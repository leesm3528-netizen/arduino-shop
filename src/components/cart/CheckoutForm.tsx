"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import { createClient } from "@/lib/supabase/client";
import { useCart, cartTotal } from "@/store/cart";
import { useHydrated } from "@/hooks/useHydrated";
import { won } from "@/lib/utils/format";

type Props = {
  userId: string;
  email: string;
  defaults: { name: string; phone: string; address: string };
};

type CreatedOrder = { id: string; order_no: string; order_name: string; total_price: number };

export default function CheckoutForm({ userId, email, defaults }: Props) {
  const items = useCart((s) => s.items);
  const hydrated = useHydrated();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!hydrated) return null;
  if (items.length === 0) {
    return (
      <div className="card p-12 text-center">
        <p className="text-zinc-500">주문할 상품이 없습니다.</p>
        <Link href="/products" className="btn-primary mt-4">
          쇼핑하러 가기
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(e.currentTarget);

    try {
      const supabase = createClient();
      const { data, error: rpcError } = await supabase
        .rpc("create_order", {
          p_items: items.map((i) => ({ product_id: i.productId, quantity: i.quantity })),
          p_recipient: String(form.get("recipient")),
          p_phone: String(form.get("phone")),
          p_address: String(form.get("address")),
          p_memo: String(form.get("memo") ?? "") || null,
        })
        .single<CreatedOrder>();
      if (rpcError || !data) throw new Error(rpcError?.message ?? "주문 생성에 실패했습니다");

      const toss = await loadTossPayments(process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!);
      const payment = toss.payment({ customerKey: userId });
      await payment.requestPayment({
        method: "CARD",
        amount: { currency: "KRW", value: data.total_price },
        orderId: data.order_no,
        orderName: data.order_name,
        customerEmail: email || undefined,
        customerName: String(form.get("recipient")),
        successUrl: `${window.location.origin}/checkout/success`,
        failUrl: `${window.location.origin}/checkout/fail`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      // 사용자가 결제창을 닫은 경우는 오류로 보지 않음
      if (!/USER_CANCEL|취소/.test(message)) setError(message);
      setPending(false);
    }
  }

  const total = cartTotal(items);

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <section className="card space-y-4 p-6">
        <h2 className="text-lg font-bold">배송 정보</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="recipient">받는 분</label>
            <input id="recipient" name="recipient" required defaultValue={defaults.name} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="phone">연락처</label>
            <input
              id="phone"
              name="phone"
              required
              defaultValue={defaults.phone}
              placeholder="010-0000-0000"
              className="input"
            />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="address">주소</label>
          <input id="address" name="address" required defaultValue={defaults.address} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="memo">배송 메모 (선택)</label>
          <input id="memo" name="memo" placeholder="문 앞에 놓아주세요" className="input" />
        </div>
        <p className="text-xs text-zinc-500">입력한 배송 정보는 마이페이지에서 기본값으로 저장할 수 있습니다.</p>
      </section>

      <aside className="card h-fit space-y-4 p-5">
        <h2 className="text-lg font-bold">주문 상품 {items.length}종</h2>
        <ul className="space-y-3">
          {items.map((i) => (
            <li key={i.productId} className="flex items-center gap-3 text-sm">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-zinc-100">
                {i.image && <Image src={i.image} alt="" fill sizes="48px" className="object-cover" />}
              </div>
              <div className="flex-1">
                <p className="line-clamp-1">{i.name}</p>
                <p className="text-zinc-500">
                  {won(i.price)} × {i.quantity}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <div className="flex justify-between border-t border-zinc-100 pt-4 text-lg font-bold">
          <span>최종 결제 금액</span>
          <span className="text-brand-600">{won(total)}</span>
        </div>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        <button className="btn-primary w-full py-3" disabled={pending}>
          {pending ? "결제창 여는 중..." : `${won(total)} 결제하기`}
        </button>
        <p className="text-center text-xs text-zinc-400">토스페이먼츠 테스트 결제 · 실제 청구되지 않습니다</p>
      </aside>
    </form>
  );
}
