import Link from "next/link";
import { getCurrentUser } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";
import CartLink from "@/components/cart/CartLink";

export default async function Header() {
  const { supabase, user, profile } = await getCurrentUser();
  const { data: categories } = await supabase
    .from("categories")
    .select("slug, name")
    .order("sort_order");

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-500 text-lg font-bold text-white">
            ∞
          </span>
          <span className="text-xl font-bold tracking-tight">아두몰</span>
        </Link>

        <form action="/products" className="hidden flex-1 sm:block">
          <input
            name="q"
            placeholder="찾으시는 부품을 검색해 보세요 (예: 초음파, 서보)"
            className="input bg-zinc-50"
          />
        </form>

        <nav className="ml-auto flex items-center gap-1 text-sm">
          {profile?.role === "admin" && (
            <Link href="/admin" className="rounded-lg px-3 py-2 font-medium text-brand-700 hover:bg-brand-50">
              관리자
            </Link>
          )}
          {user ? (
            <>
              <Link href="/mypage" className="rounded-lg px-3 py-2 hover:bg-zinc-100">
                마이페이지
              </Link>
              <form action={signOut}>
                <button className="rounded-lg px-3 py-2 text-zinc-500 hover:bg-zinc-100">로그아웃</button>
              </form>
            </>
          ) : (
            <Link href="/login" className="rounded-lg px-3 py-2 hover:bg-zinc-100">
              로그인
            </Link>
          )}
          <CartLink />
        </nav>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-3 sm:hidden">
        <form action="/products">
          <input name="q" placeholder="부품 검색" className="input bg-zinc-50" />
        </form>
      </div>

      <div className="border-t border-zinc-100">
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2 text-sm">
          <Link href="/products" className="shrink-0 rounded-full px-3 py-1.5 font-medium hover:bg-zinc-100">
            전체상품
          </Link>
          {categories?.map((c) => (
            <Link
              key={c.slug}
              href={`/products?category=${c.slug}`}
              className="shrink-0 rounded-full px-3 py-1.5 text-zinc-600 hover:bg-zinc-100 hover:text-ink"
            >
              {c.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
