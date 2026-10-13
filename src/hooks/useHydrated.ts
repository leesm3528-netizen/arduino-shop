"use client";

import { useEffect, useState } from "react";

/** localStorage 기반 상태(장바구니)를 SSR 불일치 없이 쓰기 위한 훅 */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
