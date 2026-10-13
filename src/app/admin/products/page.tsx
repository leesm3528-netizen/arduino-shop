import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteProduct } from "@/lib/actions/admin";
import { won } from "@/lib/utils/format";
import type { Product } from "@/types";

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("*, categories(name)").order("id");
  const products = (data ?? []) as (Product & { categories: { name: string } | null })[];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">상품 관리 ({products.length})</h1>
        <Link href="/admin/products/new" className="btn-primary">
          + 상품 등록
        </Link>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">상품</th>
              <th className="px-4 py-3 font-medium">카테고리</th>
              <th className="px-4 py-3 text-right font-medium">가격</th>
              <th className="px-4 py-3 text-right font-medium">재고</th>
              <th className="px-4 py-3 font-medium">상태</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-zinc-100">
                      {p.image && <Image src={p.image} alt="" fill sizes="40px" className="object-cover" />}
                    </div>
                    <span className="font-medium">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-2 text-zinc-600">{p.categories?.name}</td>
                <td className="px-4 py-2 text-right">{won(p.price)}</td>
                <td className={`px-4 py-2 text-right ${p.stock < 20 ? "font-semibold text-amber-600" : ""}`}>{p.stock}</td>
                <td className="px-4 py-2">
                  {p.is_active ? (
                    <span className="text-brand-600">판매중</span>
                  ) : (
                    <span className="text-zinc-400">숨김</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/products/${p.id}`} className="btn-outline px-3 py-1.5 text-xs">
                      수정
                    </Link>
                    <form action={deleteProduct}>
                      <input type="hidden" name="id" value={p.id} />
                      <button className="btn-danger px-3 py-1.5 text-xs">삭제</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
