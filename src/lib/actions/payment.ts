"use server";

import { FunctionsHttpError } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export async function confirmPayment(paymentKey: string, orderId: string, amount: number) {
  const supabase = await createClient();
  const { data, error } = await supabase.functions.invoke<{ ok: boolean; orderId: string }>(
    "confirm-payment",
    { body: { paymentKey, orderId, amount } },
  );

  if (error) {
    if (error instanceof FunctionsHttpError) {
      const body = await error.context.json().catch(() => null);
      return { ok: false as const, message: body?.message ?? "결제 승인에 실패했습니다" };
    }
    return { ok: false as const, message: error.message };
  }
  return { ok: true as const, orderId: data!.orderId };
}
