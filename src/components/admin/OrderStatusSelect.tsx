"use client";

import { useTransition } from "react";
import { updateOrderStatus } from "@/lib/actions/admin";
import { ORDER_STATUS_LABEL, ORDER_STATUS_STYLE } from "@/lib/utils/format";
import type { OrderStatus } from "@/types";

export default function OrderStatusSelect({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value as OrderStatus;
        startTransition(async () => {
          await updateOrderStatus(orderId, next);
        });
      }}
      className={`rounded-full border-0 px-2.5 py-1 text-xs font-semibold ${ORDER_STATUS_STYLE[status]}`}
    >
      {(Object.keys(ORDER_STATUS_LABEL) as OrderStatus[]).map((s) => (
        <option key={s} value={s}>
          {ORDER_STATUS_LABEL[s]}
        </option>
      ))}
    </select>
  );
}
