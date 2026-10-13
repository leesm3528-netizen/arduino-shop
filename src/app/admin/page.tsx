import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { formatDate, ORDER_STATUS_LABEL, ORDER_STATUS_STYLE, won } from "@/lib/utils/format";
import type { Order } from "@/types";

export const metadata: Metadata = { title: "관리자" };

export default async function AdminDashboard() {
  const supabase = await createClient();
  const [{ data: paidOrders }, { count: productCount }, { data: lowStock }, { data: recent }] = await Promise.all([
    supabase.from("orders").select("total_price, status").neq("status", "pending").neq("status", "cancelled"),
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id, name, stock").lt("stock", 20).order("stock"),
    supabase.from("orders").select("*").neq("status", "pending").order("created_at", { ascending: false }).limit(5),
  ]);

  const revenue = (paidOrders ?? []).reduce((s, o) => s + o.total_price, 0);
  const toShip = (paidOrders ?? []).filter((o) => o.status === "paid").length;

  const stats = [
    { label: "누적 매출", value: won(revenue) },
    { label: "주문 수", value: `${paidOrders?.length ?? 0}건` },
    { label: "배송 대기", value: `${toShip}건` },
    { label: "등록 상품", value: `${productCount ?? 0}개` },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <p className="text-sm text-zinc-500">{s.label}</p>
            <p className="mt-1 text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <div className="mb-3 flex items-end justify-between">
            <h2 className="font-bold">최근 주문</h2>
            <Link href="/admin/orders" className="text-sm text-zinc-500 hover:text-ink">
              전체 →
            </Link>
          </div>
          <ul className="card divide-y divide-zinc-100 text-sm">
            {(recent as Order[] | null)?.map((o) => (
              <li key={o.id} className="flex items-center gap-3 px-4 py-3">
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${ORDER_STATUS_STYLE[o.status]}`}>
                  {ORDER_STATUS_LABEL[o.status]}
                </span>
                <span className="line-clamp-1 flex-1">{o.order_name}</span>
                <span className="text-xs text-zinc-400">{formatDate(o.created_at)}</span>
              </li>
            ))}
            {!recent?.length && <li className="px-4 py-6 text-center text-zinc-500">주문이 없습니다</li>}
          </ul>
        </section>

        <section>
          <h2 className="mb-3 font-bold">재고 부족 (20개 미만)</h2>
          <ul className="card divide-y divide-zinc-100 text-sm">
            {lowStock?.map((p) => (
              <li key={p.id} className="flex items-center justify-between px-4 py-3">
                <Link href={`/admin/products/${p.id}`} className="hover:underline">
                  {p.name}
                </Link>
                <span className={p.stock === 0 ? "font-semibold text-red-600" : "text-amber-600"}>{p.stock}개</span>
              </li>
            ))}
            {!lowStock?.length && <li className="px-4 py-6 text-center text-zinc-500">재고 부족 상품이 없습니다</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}
