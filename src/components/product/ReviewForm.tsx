"use client";

import { useActionState, useState } from "react";
import { createReview } from "@/lib/actions/reviews";

export default function ReviewForm({ productId, slug }: { productId: number; slug: string }) {
  const [state, action, pending] = useActionState(createReview, null);
  const [rating, setRating] = useState(5);

  if (state?.ok) {
    return <p className="mb-4 rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-700">리뷰가 등록되었습니다. 감사합니다!</p>;
  }

  return (
    <form action={action} className="card mb-4 space-y-3 p-5">
      <input type="hidden" name="product_id" value={productId} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="rating" value={rating} />
      <div className="flex items-center gap-1 text-2xl">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            className={n <= rating ? "text-amber-500" : "text-zinc-300"}
            aria-label={`${n}점`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea name="content" rows={3} required placeholder="상품은 어떠셨나요?" className="input" />
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button className="btn-primary" disabled={pending}>
        {pending ? "등록 중..." : "리뷰 등록"}
      </button>
    </form>
  );
}
