import { Suspense } from "react";
import type { Metadata } from "next";
import AuthForm from "@/components/layout/AuthForm";

export const metadata: Metadata = { title: "로그인" };

export default function LoginPage() {
  return (
    <Suspense>
      <AuthForm mode="login" />
    </Suspense>
  );
}
