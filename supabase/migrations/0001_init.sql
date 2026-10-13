-- =========================================================
-- 아두이노 쇼핑몰 초기 스키마
-- =========================================================

-- ---------- profiles ----------
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text,
  phone      text,
  address    text,
  role       text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- ---------- categories ----------
create table public.categories (
  id         bigint generated always as identity primary key,
  slug       text not null unique,
  name       text not null,
  sort_order int  not null default 0
);

-- ---------- products ----------
create table public.products (
  id             bigint generated always as identity primary key,
  category_id    bigint not null references public.categories(id),
  slug           text   not null unique,
  name           text   not null,
  summary        text,
  description    text,
  price          int    not null check (price >= 0),
  stock          int    not null default 0 check (stock >= 0),
  specs          jsonb  not null default '{}'::jsonb,
  image          text,
  devicemart_url text,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now()
);
create index products_category_idx on public.products (category_id);

-- ---------- orders ----------
create table public.orders (
  id          uuid primary key default gen_random_uuid(),
  order_no    text not null unique,
  user_id     uuid not null references auth.users(id) on delete cascade,
  status      text not null default 'pending'
              check (status in ('pending', 'paid', 'shipping', 'delivered', 'cancelled')),
  order_name  text not null,
  total_price int  not null check (total_price >= 0),
  recipient   text not null,
  phone       text not null,
  address     text not null,
  memo        text,
  payment_key text,
  paid_at     timestamptz,
  created_at  timestamptz not null default now()
);
create index orders_user_idx on public.orders (user_id, created_at desc);

create table public.order_items (
  id           bigint generated always as identity primary key,
  order_id     uuid   not null references public.orders(id) on delete cascade,
  product_id   bigint references public.products(id) on delete set null,
  product_name text   not null,
  price        int    not null,
  quantity     int    not null check (quantity > 0)
);
create index order_items_order_idx on public.order_items (order_id);
create index order_items_product_idx on public.order_items (product_id);

-- ---------- reviews ----------
create table public.reviews (
  id          bigint generated always as identity primary key,
  product_id  bigint not null references public.products(id) on delete cascade,
  user_id     uuid   not null references auth.users(id) on delete cascade,
  author_name text   not null,
  rating      int    not null check (rating between 1 and 5),
  content     text   not null,
  created_at  timestamptz not null default now(),
  unique (product_id, user_id)
);
create index reviews_user_idx on public.reviews (user_id);

-- =========================================================
-- RLS
-- =========================================================
alter table public.profiles    enable row level security;
alter table public.categories  enable row level security;
alter table public.products    enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews     enable row level security;

-- profiles: 본인 + 관리자
create policy "profiles_select" on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));
create policy "profiles_update_own" on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));
-- role 컬럼은 사용자가 직접 바꿀 수 없도록 컬럼 단위 권한 제한
revoke update on public.profiles from authenticated, anon;
grant  update (name, phone, address) on public.profiles to authenticated;

-- categories / products: 누구나 읽기, 관리자만 쓰기
create policy "categories_read" on public.categories for select using (true);
create policy "categories_admin" on public.categories for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "products_read" on public.products for select
  using (is_active or (select public.is_admin()));
create policy "products_admin_insert" on public.products for insert to authenticated
  with check ((select public.is_admin()));
create policy "products_admin_update" on public.products for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "products_admin_delete" on public.products for delete to authenticated
  using ((select public.is_admin()));

-- orders: 본인 조회, 관리자 조회/상태변경 (생성은 create_order 함수로만)
create policy "orders_select" on public.orders for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy "orders_admin_update" on public.orders for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "order_items_select" on public.order_items for select to authenticated
  using (exists (
    select 1 from public.orders o
    where o.id = order_id and (o.user_id = (select auth.uid()) or (select public.is_admin()))
  ));

-- reviews: 누구나 읽기, 구매자만 작성, 본인만 삭제
create policy "reviews_read" on public.reviews for select using (true);
create policy "reviews_insert_buyer" on public.reviews for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.orders o
      join public.order_items oi on oi.order_id = o.id
      where o.user_id = (select auth.uid())
        and o.status in ('paid', 'shipping', 'delivered')
        and oi.product_id = reviews.product_id
    )
  );
create policy "reviews_delete_own" on public.reviews for delete to authenticated
  using (user_id = (select auth.uid()));

-- =========================================================
-- 주문 생성 (가격은 서버에서 계산)
-- p_items: [{"product_id": 1, "quantity": 2}, ...]
-- =========================================================
create or replace function public.create_order(
  p_items jsonb,
  p_recipient text,
  p_phone text,
  p_address text,
  p_memo text default null
)
returns table (id uuid, order_no text, order_name text, total_price int)
language plpgsql
security definer set search_path = ''
as $$
#variable_conflict use_column
declare
  v_uid      uuid := auth.uid();
  v_order_id uuid;
  v_order_no text;
  v_total    int := 0;
  v_count    int := 0;
  v_first    text;
  r          record;
begin
  if v_uid is null then
    raise exception '로그인이 필요합니다';
  end if;
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception '장바구니가 비어 있습니다';
  end if;

  for r in
    select p.id, p.name, p.price, p.stock, p.is_active, sum(i.quantity)::int as qty
    from jsonb_to_recordset(p_items) as i(product_id bigint, quantity int)
    join public.products p on p.id = i.product_id
    group by p.id
  loop
    if not r.is_active then
      raise exception '판매 중지된 상품입니다: %', r.name;
    end if;
    if r.qty <= 0 then
      raise exception '수량이 올바르지 않습니다: %', r.name;
    end if;
    if r.stock < r.qty then
      raise exception '재고가 부족합니다: % (남은 수량 %)', r.name, r.stock;
    end if;
    v_total := v_total + r.price * r.qty;
    v_count := v_count + 1;
    if v_first is null then v_first := r.name; end if;
  end loop;

  if v_count = 0 then
    raise exception '주문할 상품을 찾을 수 없습니다';
  end if;

  v_order_no := 'ORD-' || to_char(now() at time zone 'Asia/Seoul', 'YYYYMMDDHH24MISS')
                || '-' || substr(md5(gen_random_uuid()::text), 1, 6);

  insert into public.orders (order_no, user_id, order_name, total_price, recipient, phone, address, memo)
  values (
    v_order_no, v_uid,
    case when v_count > 1 then v_first || ' 외 ' || (v_count - 1) || '건' else v_first end,
    v_total, p_recipient, p_phone, p_address, p_memo
  )
  returning orders.id into v_order_id;

  insert into public.order_items (order_id, product_id, product_name, price, quantity)
  select v_order_id, p.id, p.name, p.price, sum(i.quantity)::int
  from jsonb_to_recordset(p_items) as i(product_id bigint, quantity int)
  join public.products p on p.id = i.product_id
  group by p.id;

  return query
    select o.id, o.order_no, o.order_name, o.total_price
    from public.orders o where o.id = v_order_id;
end;
$$;

revoke execute on function public.create_order(jsonb, text, text, text, text) from public, anon;
grant  execute on function public.create_order(jsonb, text, text, text, text) to authenticated;

-- =========================================================
-- 결제 승인 처리 (Edge Function 이 service_role 로만 호출)
-- =========================================================
create or replace function public.mark_order_paid(p_order_id uuid, p_payment_key text)
returns void
language plpgsql
security definer set search_path = ''
as $$
begin
  update public.orders
     set status = 'paid', payment_key = p_payment_key, paid_at = now()
   where id = p_order_id and status = 'pending';

  if not found then
    return;
  end if;

  update public.products p
     set stock = greatest(p.stock - oi.quantity, 0)
    from public.order_items oi
   where oi.order_id = p_order_id and oi.product_id = p.id;
end;
$$;

revoke execute on function public.mark_order_paid(uuid, text) from public, anon, authenticated;
grant  execute on function public.mark_order_paid(uuid, text) to service_role;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- =========================================================
-- Storage: 상품 이미지 버킷 (공개 읽기, 관리자 업로드)
-- =========================================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "product_images_admin_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and (select public.is_admin()));
create policy "product_images_admin_update" on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()));
create policy "product_images_admin_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()));
