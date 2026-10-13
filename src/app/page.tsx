import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/product/ProductCard";
import type { Category, Product } from "@/types";

const CATEGORY_DESC: Record<string, string> = {
  boards: "우노 · 나노 · 메가 · ESP32",
  sensors: "거리 · 온습도 · 모션 · 자이로",
  modules: "모터 · 디스플레이 · 릴레이",
  parts: "브레드보드 · 점퍼선 · LED",
  kits: "입문용 올인원 키트",
  tools: "측정 · 작업 공구",
};

export default async function HomePage() {
  const supabase = await createClient();
  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("products").select("*").eq("is_active", true).order("id"),
  ]);

  const all = (products ?? []) as Product[];
  const boards = all.filter((p) => p.category_id === categories?.find((c) => c.slug === "boards")?.id);
  const popular = all.filter((p) => !boards.includes(p)).slice(0, 8);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-zinc-900">
        <Image
          src="/images/hero-1.jpg"
          alt="아두이노 보드"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-50"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-white sm:py-28">
          <p className="mb-3 text-sm font-semibold tracking-widest text-brand-100">MAKER&apos;S PARTS STORE</p>
          <h1 className="max-w-xl text-3xl font-bold leading-tight sm:text-5xl">
            아이디어를 현실로,
            <br />
            아두이노로 시작하세요
          </h1>
          <p className="mt-4 max-w-md text-zinc-200">
            보드부터 센서, 모듈, 키트까지. 첫 프로젝트에 필요한 부품을 한 번에 준비하세요.
          </p>
          <div className="mt-8 flex gap-3">
            <Link href="/products" className="btn-primary px-6 py-3">
              전체 상품 보기
            </Link>
            <Link href="/products?category=kits" className="btn border border-white/40 px-6 py-3 text-white hover:bg-white/10">
              입문 키트
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4">
        {/* Categories */}
        <section className="py-12">
          <h2 className="mb-5 text-xl font-bold">카테고리</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {(categories as Category[] | null)?.map((c) => (
              <Link
                key={c.slug}
                href={`/products?category=${c.slug}`}
                className="card p-4 transition hover:border-brand-500 hover:shadow-md"
              >
                <p className="font-semibold">{c.name}</p>
                <p className="mt-1 text-xs text-zinc-500">{CATEGORY_DESC[c.slug] ?? ""}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Boards */}
        {boards.length > 0 && (
          <section className="pb-12">
            <div className="mb-5 flex items-end justify-between">
              <h2 className="text-xl font-bold">개발 보드</h2>
              <Link href="/products?category=boards" className="text-sm text-zinc-500 hover:text-ink">
                더보기 →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {boards.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* Banner */}
        <section className="relative mb-12 overflow-hidden rounded-2xl bg-zinc-900">
          <Image src="/images/hero-2.jpg" alt="전자부품 작업대" fill sizes="100vw" className="object-cover opacity-40" />
          <div className="relative px-6 py-12 text-white sm:px-12">
            <h2 className="text-2xl font-bold">센서 하나로 달라지는 프로젝트</h2>
            <p className="mt-2 text-zinc-200">초음파, 온습도, 인체감지 센서로 주변 세상을 읽어 보세요.</p>
            <Link href="/products?category=sensors" className="btn-primary mt-6">
              센서 보러가기
            </Link>
          </div>
        </section>

        {/* Popular */}
        <section>
          <div className="mb-5 flex items-end justify-between">
            <h2 className="text-xl font-bold">인기 부품</h2>
            <Link href="/products" className="text-sm text-zinc-500 hover:text-ink">
              더보기 →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {popular.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          {all.length === 0 && (
            <p className="card p-10 text-center text-zinc-500">등록된 상품이 없습니다.</p>
          )}
        </section>
      </div>
    </div>
  );
}
