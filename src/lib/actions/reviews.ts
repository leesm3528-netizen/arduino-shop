"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/supabase/server";
import type { ActionState } from "./profile";

export async function createReview(_: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user, profile } = await getCurrentUser();
  if (!user) return { error: "로그인이 필요합니다" };

  const productId = Number(formData.get("product_id"));
  const slug = String(formData.get("slug") ?? "");
  const rating = Number(formData.get("rating"));
  const content = String(formData.get("content") ?? "").trim();
  if (!content) return { error: "리뷰 내용을 입력해 주세요" };
  if (!(rating >= 1 && rating <= 5)) return { error: "별점을 선택해 주세요" };

  const { error } = await supabase.from("reviews").insert({
    product_id: productId,
    user_id: user.id,
    author_name: profile?.name || user.email?.split("@")[0] || "구매자",
    rating,
    content,
  });

  if (error) {
    if (error.code === "23505") return { error: "이미 이 상품에 리뷰를 작성하셨습니다" };
    if (error.code === "42501") return { error: "구매 확정된 상품만 리뷰를 작성할 수 있습니다" };
    return { error: error.message };
  }
  revalidatePath(`/products/${slug}`);
  return { ok: true };
}

export async function deleteReview(formData: FormData) {
  const { supabase, user } = await getCurrentUser();
  if (!user) return;
  await supabase.from("reviews").delete().eq("id", Number(formData.get("id")));
  revalidatePath(`/products/${String(formData.get("slug"))}`);
}
