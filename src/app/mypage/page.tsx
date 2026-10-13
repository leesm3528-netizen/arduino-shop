import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { formatDate, ORDER_STATUS_LABEL, ORDER_STATUS_STYLE, won } from "@/lib/utils/format";
import ProfileForm from "@/components/layout/ProfileForm";
import type { Order } from "@/types";

export const metadata: Metadata = { title: "마이페이지" };

export default async function MyPage() {
  const { supabase, user, profile } = await getCurrentUser();
  if (!user) redirect("/login?next=/mypage");

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .neq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(3);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold">마이페이지</h1>
      <p className="mt-1 text-sm text-zinc-500">{user.email}</p>

      <section className="mt-8">
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-lg font-bold">최근 주문</h2>
          <Link href="/mypage/orders" className="text-sm text-zinc-500 hover:text-ink">
            전체 주문 내역 →
          </Link>
        </div>
        {orders && orders.length > 0 ? (
          <ul className="card divide-y divide-zinc-100">
            {(orders as Order[]).map((o) => (
              <li key={o.id} className="flex flex-wrap items-center gap-3 p-4 text-sm">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${ORDER_STATUS_STYLE[o.status]}`}>
                  {ORDER_STATUS_LABEL[o.status]}
                </span>
                <span className="font-medium">{o.order_name}</span>
                <span className="ml-auto font-semibold">{won(o.total_price)}</span>
                <span className="w-full text-xs text-zinc-400 sm:w-auto">{formatDate(o.created_at)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="card p-8 text-center text-sm text-zinc-500">주문 내역이 없습니다.</p>
        )}
      </section>

      <section className="mt-10">
        <h2 className="mb-3 text-lg font-bold">기본 배송 정보</h2>
        <ProfileForm
          defaults={{ name: profile?.name ?? "", phone: profile?.phone ?? "", address: profile?.address ?? "" }}
        />
      </section>
    </div>
  );
}
