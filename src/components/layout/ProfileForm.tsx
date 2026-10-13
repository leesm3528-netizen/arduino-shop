"use client";

import { useActionState } from "react";
import { updateProfile } from "@/lib/actions/profile";

type Props = { defaults: { name: string; phone: string; address: string } };

export default function ProfileForm({ defaults }: Props) {
  const [state, action, pending] = useActionState(updateProfile, null);

  return (
    <form action={action} className="card space-y-4 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="name">이름</label>
          <input id="name" name="name" defaultValue={defaults.name} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="phone">연락처</label>
          <input id="phone" name="phone" defaultValue={defaults.phone} placeholder="010-0000-0000" className="input" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="address">주소</label>
        <input id="address" name="address" defaultValue={defaults.address} className="input" />
      </div>
      <div className="flex items-center gap-3">
        <button className="btn-primary" disabled={pending}>
          {pending ? "저장 중..." : "저장"}
        </button>
        {state?.ok && <span className="text-sm text-brand-600">저장되었습니다</span>}
        {state?.error && <span className="text-sm text-red-600">{state.error}</span>}
      </div>
    </form>
  );
}
