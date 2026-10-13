import Image from "next/image";
import Link from "next/link";
import { won } from "@/lib/utils/format";
import type { Product } from "@/types";

export default function ProductCard({ product }: { product: Product }) {
  const soldOut = product.stock <= 0;
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group card flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-zinc-100">
        {product.image && (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        )}
        {soldOut && (
          <span className="absolute inset-0 grid place-items-center bg-black/50 text-sm font-bold text-white">
            품절
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3.5">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug">{product.name}</h3>
        {product.summary && <p className="line-clamp-1 text-xs text-zinc-500">{product.summary}</p>}
        <p className="mt-auto pt-2 text-base font-bold">{won(product.price)}</p>
      </div>
    </Link>
  );
}
