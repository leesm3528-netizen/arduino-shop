import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/product/ProductCard";
import type { Category, Product } from "@/types";

export const metadata: Metadata = { title: "상품 목록" };

const SORTS = {
  new: { label: "기본순", column: "id", ascending: true },
  price_asc: { label: "낮은 가격순", column: "price", ascending: true },
  price_desc: { label: "높은 가격순", column: "price", ascending: false },
  name: { label: "이름순", column: "name", ascending: true },
} as const;
type SortKey = keyof typeof SORTS;

type SearchParams = Promise<{ category?: string; q?: string; sort?: string; instock?: string }>;

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const { category, q, sort, instock } = await searchParams;
  const sortKey: SortKey = sort && sort in SORTS ? (sort as SortKey) : "new";
  const supabase = await createClient();

  const { data: categories } = await supabase.from("categories").select("*").order("sort_order");
  const current = (categories as Category[] | null)?.find((c) => c.slug === category);

  let query = supabase.from("products").select("*").eq("is_active", true);
  if (current) query = query.eq("category_id", current.id);
  if (q?.trim()) {
    const term = q.trim().replace(/[%,()]/g, " ");
    query = query.or(`name.ilike.%${term}%,summary.ilike.%${term}%`);
  }
  if (instock === "1") query = query.gt("stock", 0);
  const { column, ascending } = SORTS[sortKey];
  const { data: products } = await query.order(column, { ascending });

  const href = (patch: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = { category, q, sort, instock, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) params.set(k, v);
    const s = params.toString();
    return s ? `/products?${s}` : "/products";
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {q ? `'${q}' 검색 결과` : (current?.name ?? "전체 상품")}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">{products?.length ?? 0}개의 상품</p>
      </div>

      <div className="grid gap-8 md:grid-cols-[200px_1fr]">
        <aside className="space-y-6 text-sm">
          <div>
            <p className="mb-2 font-semibold">카테고리</p>
            <ul className="flex flex-wrap gap-1 md:flex-col">
              <li>
                <Link
                  href={href({ category: undefined })}
                  className={`block rounded-lg px-3 py-1.5 ${!current ? "bg-brand-50 font-semibold text-brand-700" : "hover:bg-zinc-100"}`}
                >
                  전체
                </Link>
              </li>
              {(categories as Category[] | null)?.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={href({ category: c.slug })}
                    className={`block rounded-lg px-3 py-1.5 ${current?.slug === c.slug ? "bg-brand-50 font-semibold text-brand-700" : "hover:bg-zinc-100"}`}
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 font-semibold">필터</p>
            <Link
              href={href({ instock: instock === "1" ? undefined : "1" })}
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 hover:bg-zinc-100"
            >
              <span
                className={`grid h-4 w-4 place-items-center rounded border text-[10px] ${instock === "1" ? "border-brand-500 bg-brand-500 text-white" : "border-zinc-300"}`}
              >
                {instock === "1" && "✓"}
              </span>
              재고 있는 상품만
            </Link>
          </div>
        </aside>

        <section>
          <div className="mb-4 flex flex-wrap gap-2 text-sm">
            {(Object.keys(SORTS) as SortKey[]).map((k) => (
              <Link
                key={k}
                href={href({ sort: k === "new" ? undefined : k })}
                className={`rounded-full border px-3 py-1 ${sortKey === k ? "border-ink bg-ink text-white" : "border-zinc-300 bg-white hover:border-zinc-400"}`}
              >
                {SORTS[k].label}
              </Link>
            ))}
          </div>

          {products && products.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {(products as Product[]).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="card p-12 text-center text-zinc-500">
              조건에 맞는 상품이 없습니다.
              <div className="mt-4">
                <Link href="/products" className="btn-outline">
                  전체 상품 보기
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
