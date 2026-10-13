"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import type { OrderStatus } from "@/types";
import type { ActionState } from "./profile";

async function requireAdmin() {
  const ctx = await getCurrentUser();
  if (ctx.profile?.role !== "admin") throw new Error("관리자 권한이 필요합니다");
  return ctx.supabase;
}

const STATUSES: OrderStatus[] = ["pending", "paid", "shipping", "delivered", "cancelled"];

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  if (!STATUSES.includes(status)) return { error: "잘못된 상태값" };
  const supabase = await requireAdmin();
  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
  if (error) return { error: error.message };
  revalidatePath("/admin/orders");
  return { ok: true };
}

/** "키: 값" 줄 단위 텍스트 → specs 객체 */
function parseSpecs(text: string) {
  const specs: Record<string, string> = {};
  for (const line of text.split("\n")) {
    const idx = line.indexOf(":");
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (key && value) specs[key] = value;
  }
  return specs;
}

export async function saveProduct(_: ActionState, formData: FormData): Promise<ActionState> {
  let supabase;
  try {
    supabase = await requireAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const payload = {
    name: String(formData.get("name") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim().toLowerCase(),
    category_id: Number(formData.get("category_id")),
    price: Number(formData.get("price")),
    stock: Number(formData.get("stock")),
    summary: String(formData.get("summary") ?? "").trim() || null,
    description: String(formData.get("description") ?? "").trim() || null,
    specs: parseSpecs(String(formData.get("specs") ?? "")),
    image: String(formData.get("image") ?? "").trim() || null,
    devicemart_url: String(formData.get("devicemart_url") ?? "").trim() || null,
    is_active: formData.get("is_active") === "on",
  };

  if (!payload.name || !payload.slug) return { error: "상품명과 슬러그는 필수입니다" };
  if (!/^[a-z0-9-]+$/.test(payload.slug)) return { error: "슬러그는 영문 소문자, 숫자, - 만 사용할 수 있습니다" };
  if (!(payload.price >= 0) || !(payload.stock >= 0)) return { error: "가격과 재고를 확인해 주세요" };

  const { error } = id
    ? await supabase.from("products").update(payload).eq("id", id)
    : await supabase.from("products").insert(payload);

  if (error) {
    if (error.code === "23505") return { error: "이미 사용 중인 슬러그입니다" };
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/admin/products");
}

export async function deleteProduct(formData: FormData) {
  const supabase = await requireAdmin();
  const id = Number(formData.get("id"));
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) {
    await supabase.from("products").update({ is_active: false }).eq("id", id);
  }
  revalidatePath("/", "layout");
}
