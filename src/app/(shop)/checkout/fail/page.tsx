import Link from "next/link";

type SearchParams = Promise<{ code?: string; message?: string }>;

export default async function CheckoutFailPage({ searchParams }: { searchParams: SearchParams }) {
  const { code, message } = await searchParams;
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">결제가 완료되지 않았습니다</h1>
      <p className="mt-2 text-zinc-600">{message ?? "결제 중 문제가 발생했습니다."}</p>
      {code && <p className="mt-1 text-xs text-zinc-400">오류 코드: {code}</p>}
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/checkout" className="btn-primary">
          다시 결제하기
        </Link>
        <Link href="/cart" className="btn-outline">
          장바구니
        </Link>
      </div>
    </div>
  );
}
