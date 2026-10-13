import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { formatDate, ORDER_STATUS_LABEL, ORDER_STATUS_STYLE, won } from "@/lib/utils/format";
import type { Order, OrderItem } from "@/types";

export const metadata: Metadata = { title: "주문 내역" };

export default async function MyOrdersPage() {
  const { supabase, user } = await getCurrentUser();
  if (!user) redirect("/login?next=/mypage/orders");

  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*, products(slug))")
    .eq("user_id", user.id)
    .neq("status", "pending")
    .order("created_at", { ascending: false });
  const orders = (data ?? []) as (Omit<Order, "order_items"> & {
    order_items: (OrderItem & { products: { slug: string } | null })[];
  })[];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/mypage" className="text-sm text-zinc-500 hover:text-ink">
        ← 마이페이지
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-bold">주문 내역</h1>

      {orders.length === 0 ? (
        <div className="card p-12 text-center text-zinc-500">
          주문 내역이 없습니다.
          <div className="mt-4">
            <Link href="/products" className="btn-primary">
              쇼핑하러 가기
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <article key={o.id} className="card overflow-hidden">
              <header className="flex flex-wrap items-center gap-3 border-b border-zinc-100 bg-zinc-50 px-5 py-3 text-sm">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${ORDER_STATUS_STYLE[o.status]}`}>
                  {ORDER_STATUS_LABEL[o.status]}
                </span>
                <span className="text-zinc-500">{formatDate(o.created_at)}</span>
                <span className="font-mono text-xs text-zinc-400">{o.order_no}</span>
                <span className="ml-auto font-bold">{won(o.total_price)}</span>
              </header>
              <ul className="divide-y divide-zinc-100 px-5">
                {o.order_items.map((it) => (
                  <li key={it.id} className="flex items-center justify-between py-3 text-sm">
                    {it.products ? (
                      <Link href={`/products/${it.products.slug}`} className="hover:underline">
                        {it.product_name}
                      </Link>
                    ) : (
                      <span>{it.product_name}</span>
                    )}
                    <span className="text-zinc-500">
                      {won(it.price)} × {it.quantity}
                    </span>
                  </li>
                ))}
              </ul>
              <footer className="border-t border-zinc-100 px-5 py-3 text-xs text-zinc-500">
                {o.recipient} · {o.phone} · {o.address}
              </footer>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
