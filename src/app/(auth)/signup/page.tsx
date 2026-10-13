import { Suspense } from "react";
import type { Metadata } from "next";
import AuthForm from "@/components/layout/AuthForm";

export const metadata: Metadata = { title: "회원가입" };

export default function SignupPage() {
  return (
    <Suspense>
      <AuthForm mode="signup" />
    </Suspense>
  );
}
