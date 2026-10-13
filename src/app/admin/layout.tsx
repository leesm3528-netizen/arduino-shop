import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (profile?.role !== "admin") notFound();

  const links = [
    { href: "/admin", label: "대시보드" },
    { href: "/admin/products", label: "상품 관리" },
    { href: "/admin/orders", label: "주문 관리" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="mr-2 rounded-md bg-ink px-2 py-1 text-xs font-bold text-white">ADMIN</span>
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="rounded-lg px-3 py-1.5 text-sm hover:bg-zinc-200">
            {l.label}
          </Link>
        ))}
      </div>
      {children}
    </div>
  );
}
