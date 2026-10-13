"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart, cartTotal } from "@/store/cart";
import { useHydrated } from "@/hooks/useHydrated";
import { won } from "@/lib/utils/format";

export default function CartPage() {
  const { items, setQuantity, remove, clear } = useCart();
  const hydrated = useHydrated();

  if (!hydrated) return <div className="mx-auto max-w-4xl px-4 py-16" />;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">장바구니가 비어 있습니다</h1>
        <p className="mt-2 text-zinc-500">필요한 부품을 담아 보세요.</p>
        <Link href="/products" className="btn-primary mt-6">
          쇼핑하러 가기
        </Link>
      </div>
    );
  }

  const total = cartTotal(items);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">장바구니</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div>
          <ul className="card divide-y divide-zinc-100">
            {items.map((i) => (
              <li key={i.productId} className="flex gap-4 p-4">
                <Link href={`/products/${i.slug}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                  {i.image && <Image src={i.image} alt={i.name} fill sizes="80px" className="object-cover" />}
                </Link>
                <div className="flex flex-1 flex-col">
                  <Link href={`/products/${i.slug}`} className="text-sm font-medium hover:underline">
                    {i.name}
                  </Link>
                  <p className="text-sm text-zinc-500">{won(i.price)}</p>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <div className="flex items-center rounded-lg border border-zinc-300">
                      <button className="px-2.5 py-1" onClick={() => setQuantity(i.productId, i.quantity - 1)}>
                        −
                      </button>
                      <span className="w-8 text-center text-sm">{i.quantity}</span>
                      <button className="px-2.5 py-1" onClick={() => setQuantity(i.productId, i.quantity + 1)}>
                        +
                      </button>
                    </div>
                    <p className="font-semibold">{won(i.price * i.quantity)}</p>
                  </div>
                </div>
                <button onClick={() => remove(i.productId)} className="self-start text-zinc-400 hover:text-red-500" aria-label="삭제">
                  ✕
                </button>
              </li>
            ))}
          </ul>
          <button onClick={clear} className="mt-3 text-sm text-zinc-500 hover:text-red-500">
            전체 비우기
          </button>
        </div>

        <aside className="card h-fit space-y-3 p-5 lg:sticky lg:top-32">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">상품 금액</span>
            <span>{won(total)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">배송비</span>
            <span>무료</span>
          </div>
          <div className="flex justify-between border-t border-zinc-100 pt-3 text-lg font-bold">
            <span>결제 예정 금액</span>
            <span className="text-brand-600">{won(total)}</span>
          </div>
          <Link href="/checkout" className="btn-primary w-full py-3">
            주문하기
          </Link>
        </aside>
      </div>
    </div>
  );
}
