"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const ERROR_KO: Record<string, string> = {
  "Invalid login credentials": "이메일 또는 비밀번호가 올바르지 않습니다",
  "Email not confirmed": "이메일 인증이 필요합니다. 메일함을 확인해 주세요",
  "User already registered": "이미 가입된 이메일입니다",
};

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const rawNext = params.get("next") ?? "/";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));
    const supabase = createClient();

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(ERROR_KO[error.message] ?? error.message);
        setPending(false);
        return;
      }
      router.replace(next);
      router.refresh();
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: String(form.get("name")) },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    setPending(false);
    if (error) {
      setError(ERROR_KO[error.message] ?? error.message);
      return;
    }
    if (data.session) {
      router.replace(next);
      router.refresh();
    } else {
      setNotice(`${email} 으로 인증 메일을 보냈습니다. 메일의 링크를 누르면 가입이 완료됩니다.`);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-8 text-center text-2xl font-bold">{mode === "login" ? "로그인" : "회원가입"}</h1>

      {notice ? (
        <p className="card p-6 text-center text-sm leading-relaxed">{notice}</p>
      ) : (
        <form onSubmit={handleSubmit} className="card space-y-4 p-6">
          {mode === "signup" && (
            <div>
              <label className="label" htmlFor="name">이름</label>
              <input id="name" name="name" required className="input" />
            </div>
          )}
          <div>
            <label className="label" htmlFor="email">이메일</label>
            <input id="email" name="email" type="email" required autoComplete="email" className="input" />
          </div>
          <div>
            <label className="label" htmlFor="password">비밀번호</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              className="input"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="btn-primary w-full py-3" disabled={pending}>
            {pending ? "처리 중..." : mode === "login" ? "로그인" : "가입하기"}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-zinc-500">
        {mode === "login" ? (
          <>
            아직 회원이 아니신가요?{" "}
            <Link href={`/signup?next=${encodeURIComponent(next)}`} className="font-semibold text-brand-600">
              회원가입
            </Link>
          </>
        ) : (
          <>
            이미 계정이 있으신가요?{" "}
            <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-semibold text-brand-600">
              로그인
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
