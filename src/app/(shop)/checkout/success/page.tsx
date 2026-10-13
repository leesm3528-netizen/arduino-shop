"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { confirmPayment } from "@/lib/actions/payment";
import { useCart } from "@/store/cart";
import { won } from "@/lib/utils/format";

function SuccessContent() {
  const params = useSearchParams();
  const clear = useCart((s) => s.clear);
  const started = useRef(false);
  const [state, setState] = useState<"loading" | "done" | "error">("loading");
  const [message, setMessage] = useState("");

  const paymentKey = params.get("paymentKey") ?? "";
  const orderId = params.get("orderId") ?? "";
  const amount = Number(params.get("amount"));

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    confirmPayment(paymentKey, orderId, amount).then((res) => {
      if (res.ok) {
        clear();
        setState("done");
      } else {
        setMessage(res.message);
        setState("error");
      }
    });
  }, [paymentKey, orderId, amount, clear]);

  if (state === "loading") {
    return <p className="text-zinc-500">결제를 승인하고 있습니다...</p>;
  }

  if (state === "error") {
    return (
      <>
        <h1 className="text-2xl font-bold text-red-600">결제 승인 실패</h1>
        <p className="mt-2 text-zinc-600">{message}</p>
        <Link href="/cart" className="btn-outline mt-6">
          장바구니로 돌아가기
        </Link>
      </>
    );
  }

  return (
    <>
      <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-brand-500 text-2xl text-white">✓</div>
      <h1 className="text-2xl font-bold">주문이 완료되었습니다</h1>
      <p className="mt-2 text-zinc-600">
        주문번호 <span className="font-mono">{orderId}</span>
      </p>
      <p className="text-zinc-600">결제금액 {won(amount)}</p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/mypage/orders" className="btn-primary">
          주문 내역 보기
        </Link>
        <Link href="/products" className="btn-outline">
          쇼핑 계속하기
        </Link>
      </div>
    </>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <Suspense>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
