import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-zinc-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 text-sm text-zinc-500 sm:grid-cols-3">
        <div>
          <p className="mb-2 text-base font-bold text-ink">아두몰</p>
          <p>아두이노 & 메이커 전자부품 쇼핑몰 (학습용 데모)</p>
          <p className="mt-1">가격 정보는 디바이스마트 판매가를 참고했습니다.</p>
        </div>
        <div>
          <p className="mb-2 font-semibold text-ink">결제 안내</p>
          <p>결제는 토스페이먼츠 테스트 모드로 동작하며 실제로 청구되지 않습니다.</p>
        </div>
        <div>
          <p className="mb-2 font-semibold text-ink">안내</p>
          <Link href="/credits" className="hover:text-ink hover:underline">
            이미지 출처 및 라이선스
          </Link>
        </div>
      </div>
    </footer>
  );
}
