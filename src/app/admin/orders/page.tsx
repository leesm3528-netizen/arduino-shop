import { createClient } from "@/lib/supabase/server";
import { formatDate, ORDER_STATUS_LABEL, won } from "@/lib/utils/format";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";
import type { Order, OrderStatus } from "@/types";

type SearchParams = Promise<{ status?: string }>;

export default async function AdminOrdersPage({ searchParams }: { searchParams: SearchParams }) {
  const { status } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false });
  if (status && status in ORDER_STATUS_LABEL) query = query.eq("status", status);
  const { data } = await query;
  const orders = (data ?? []) as Order[];

  const tabs: (OrderStatus | undefined)[] = [undefined, "pending", "paid", "shipping", "delivered", "cancelled"];

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">주문 관리</h1>
      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        {tabs.map((t) => (
          <a
            key={t ?? "all"}
            href={t ? `/admin/orders?status=${t}` : "/admin/orders"}
            className={`rounded-full border px-3 py-1 ${status === t ? "border-ink bg-ink text-white" : "border-zinc-300 bg-white"}`}
          >
            {t ? ORDER_STATUS_LABEL[t] : "전체"}
          </a>
        ))}
      </div>

      <div className="space-y-3">
        {orders.map((o) => (
          <article key={o.id} className="card p-4 text-sm">
            <div className="flex flex-wrap items-center gap-3">
              <OrderStatusSelect key={o.status} orderId={o.id} status={o.status} />
              <span className="font-semibold">{o.order_name}</span>
              <span className="font-mono text-xs text-zinc-400">{o.order_no}</span>
              <span className="ml-auto font-bold">{won(o.total_price)}</span>
            </div>
            <p className="mt-2 text-zinc-600">
              {o.order_items?.map((i) => `${i.product_name} × ${i.quantity}`).join(", ")}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              {formatDate(o.created_at)} · {o.recipient} · {o.phone} · {o.address}
              {o.memo && ` · 메모: ${o.memo}`}
            </p>
          </article>
        ))}
        {orders.length === 0 && <p className="card p-10 text-center text-zinc-500">주문이 없습니다.</p>}
      </div>
    </div>
  );
}
