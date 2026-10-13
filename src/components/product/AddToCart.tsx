"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart, type CartItem } from "@/store/cart";
import { won } from "@/lib/utils/format";

export default function AddToCart({ product }: { product: Omit<CartItem, "quantity"> }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const add = useCart((s) => s.add);
  const router = useRouter();
  const soldOut = product.stock <= 0;

  const change = (n: number) => setQty(Math.max(1, Math.min(n, product.stock)));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-xl bg-zinc-100 px-4 py-3">
        <div className="flex items-center rounded-lg border border-zinc-300 bg-white">
          <button type="button" onClick={() => change(qty - 1)} className="px-3 py-1.5 text-lg" disabled={soldOut}>
            −
          </button>
          <span className="w-10 text-center text-sm font-semibold">{qty}</span>
          <button type="button" onClick={() => change(qty + 1)} className="px-3 py-1.5 text-lg" disabled={soldOut}>
            +
          </button>
        </div>
        <p className="text-sm">
          총 <span className="text-lg font-bold">{won(product.price * qty)}</span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={soldOut}
          className="btn-outline py-3"
          onClick={() => {
            add(product, qty);
            setAdded(true);
          }}
        >
          장바구니 담기
        </button>
        <button
          type="button"
          disabled={soldOut}
          className="btn-primary py-3"
          onClick={() => {
            add(product, qty);
            router.push("/cart");
          }}
        >
          {soldOut ? "품절" : "바로 구매"}
        </button>
      </div>

      {added && (
        <p className="rounded-lg bg-brand-50 px-4 py-2.5 text-sm text-brand-700">
          장바구니에 담았습니다.{" "}
          <button className="font-semibold underline" onClick={() => router.push("/cart")}>
            장바구니 보기
          </button>
        </p>
      )}
    </div>
  );
}
