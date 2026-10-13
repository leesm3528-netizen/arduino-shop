import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { deleteReview } from "@/lib/actions/reviews";
import { formatDate, won } from "@/lib/utils/format";
import AddToCart from "@/components/product/AddToCart";
import ReviewForm from "@/components/product/ReviewForm";
import type { Product, Review } from "@/types";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("name, summary").eq("slug", slug).maybeSingle();
  return { title: data?.name ?? "상품", description: data?.summary ?? undefined };
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-amber-500" aria-label={`별점 ${rating}점`}>
      {"★".repeat(rating)}
      <span className="text-zinc-300">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

export default async function ProductDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const { supabase, user } = await getCurrentUser();

  const { data: product } = await supabase
    .from("products")
    .select("*, categories(slug, name)")
    .eq("slug", slug)
    .maybeSingle<Product & { categories: { slug: string; name: string } | null }>();
  if (!product) notFound();

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", product.id)
    .order("created_at", { ascending: false });
  const list = (reviews ?? []) as Review[];
  const avg = list.length ? list.reduce((s, r) => s + r.rating, 0) / list.length : 0;

  let canReview = false;
  if (user && !list.some((r) => r.user_id === user.id)) {
    const { count } = await supabase
      .from("order_items")
      .select("id, orders!inner(status, user_id)", { count: "exact", head: true })
      .eq("product_id", product.id)
      .eq("orders.user_id", user.id)
      .in("orders.status", ["paid", "shipping", "delivered"]);
    canReview = (count ?? 0) > 0;
  }

  const specs = Object.entries(product.specs ?? {});

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="mb-6 text-sm text-zinc-500">
        <Link href="/products" className="hover:text-ink">
          전체상품
        </Link>
        {product.categories && (
          <>
            {" / "}
            <Link href={`/products?category=${product.categories.slug}`} className="hover:text-ink">
              {product.categories.name}
            </Link>
          </>
        )}
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        <div className="card relative aspect-square overflow-hidden">
          {product.image && (
            <Image
              src={product.image}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          )}
        </div>

        <div className="flex flex-col">
          <h1 className="text-2xl font-bold leading-snug">{product.name}</h1>
          {product.summary && <p className="mt-2 text-zinc-600">{product.summary}</p>}
          {list.length > 0 && (
            <p className="mt-2 text-sm">
              <Stars rating={Math.round(avg)} /> <span className="text-zinc-500">{avg.toFixed(1)} ({list.length})</span>
            </p>
          )}
          <p className="mt-5 text-3xl font-bold">{won(product.price)}</p>
          <p className="mt-1 text-sm text-zinc-500">
            {product.stock > 0 ? `재고 ${product.stock}개` : "품절"} · 무료배송
          </p>

          {specs.length > 0 && (
            <dl className="mt-6 divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-white text-sm">
              {specs.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[120px_1fr] px-4 py-2.5">
                  <dt className="text-zinc-500">{k}</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-6">
            <AddToCart
              product={{
                productId: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                image: product.image,
                stock: product.stock,
              }}
            />
          </div>

          {product.devicemart_url && (
            <p className="mt-4 text-xs text-zinc-400">
              가격 참고:{" "}
              <a href={product.devicemart_url} target="_blank" rel="noreferrer" className="underline hover:text-zinc-600">
                디바이스마트
              </a>
            </p>
          )}
        </div>
      </div>

      {product.description && (
        <section className="mt-14">
          <h2 className="mb-4 text-lg font-bold">상품 설명</h2>
          <div className="card whitespace-pre-line p-6 leading-relaxed text-zinc-700">{product.description}</div>
        </section>
      )}

      <section className="mt-14">
        <h2 className="mb-4 text-lg font-bold">리뷰 {list.length > 0 && <span className="text-brand-600">{list.length}</span>}</h2>

        {canReview && <ReviewForm productId={product.id} slug={product.slug} />}
        {user && !canReview && !list.some((r) => r.user_id === user.id) && (
          <p className="mb-4 text-sm text-zinc-500">결제 완료된 상품에 대해 리뷰를 작성할 수 있습니다.</p>
        )}

        {list.length === 0 ? (
          <p className="card p-8 text-center text-sm text-zinc-500">아직 작성된 리뷰가 없습니다.</p>
        ) : (
          <ul className="card divide-y divide-zinc-100">
            {list.map((r) => (
              <li key={r.id} className="p-5">
                <div className="flex items-center gap-3 text-sm">
                  <Stars rating={r.rating} />
                  <span className="font-medium">{r.author_name}</span>
                  <span className="text-zinc-400">{formatDate(r.created_at)}</span>
                  {user?.id === r.user_id && (
                    <form action={deleteReview} className="ml-auto">
                      <input type="hidden" name="id" value={r.id} />
                      <input type="hidden" name="slug" value={product.slug} />
                      <button className="text-xs text-zinc-400 hover:text-red-500">삭제</button>
                    </form>
                  )}
                </div>
                <p className="mt-2 whitespace-pre-line text-sm text-zinc-700">{r.content}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
