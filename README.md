# 아두몰 – 아두이노 쇼핑몰

Next.js 15 (App Router) + Supabase + 토스페이먼츠(테스트) 로 만든 아두이노 부품 쇼핑몰입니다.

## 기능
- 상품 목록 / 카테고리 / 검색 / 정렬 / 재고 필터, 상품 상세(사양표)
- 장바구니 (localStorage 저장)
- 회원가입 / 로그인 (Supabase Auth, 이메일)
- 주문 생성 (`create_order` DB 함수가 서버에서 가격·재고 검증)
- 토스페이먼츠 결제창 → `confirm-payment` Edge Function 에서 금액 검증 후 승인, 재고 차감
- 마이페이지 (배송정보, 주문 내역), 구매자 리뷰
- 관리자: 대시보드, 상품 등록/수정/삭제 + 이미지 업로드(Storage), 주문 상태 변경

## 폴더 구조
```
src/
  app/
    page.tsx                 메인
    (shop)/products          목록, [slug] 상세
    (shop)/cart              장바구니
    (shop)/checkout          결제, success, fail
    (auth)/login, signup     인증
    auth/callback            이메일 인증 콜백
    mypage/, mypage/orders   마이페이지
    admin/                   관리자 (products, orders)
    credits/                 이미지 출처
  components/  layout · product · cart · admin
  lib/supabase               브라우저/서버/미들웨어 클라이언트
  lib/actions                서버 액션
  lib/utils                  포맷 유틸
  store/cart.ts              장바구니(zustand)
  types/
supabase/
  migrations/0001_init.sql   테이블 · RLS · 함수 · 스토리지
  functions/confirm-payment  결제 승인 Edge Function
  seed/products.json         상품 원본 데이터 (디바이스마트 가격 기준)
  seed/build-seed.mjs        products.json → seed.sql 생성
public/images/               상품·배너 사진 (CREDITS.md 참고)
```

## 실행
1. `.env.example` 을 `.env.local` 로 복사하고 Supabase URL / anon key 입력
2. Supabase 에 `supabase/migrations/0001_init.sql` → `supabase/seed/seed.sql` 순서로 실행
3. Edge Function `confirm-payment` 배포
4. `npm run dev` → http://localhost:3000

### 관리자 지정
회원가입 후 SQL 실행:
```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = '내이메일');
```

### 테스트 결제
토스페이먼츠 문서용 테스트 키를 사용하므로 실제 결제가 일어나지 않습니다.
