"use client";

import Link from "next/link";
import { useCart } from "@/store/cart";
import { useHydrated } from "@/hooks/useHydrated";

export default function CartLink() {
  const count = useCart((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const hydrated = useHydrated();

  return (
    <Link href="/cart" className="relative rounded-lg px-3 py-2 font-medium hover:bg-zinc-100">
      장바구니
      {hydrated && count > 0 && (
        <span className="absolute -top-0.5 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand-500 px-1 text-[11px] font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
