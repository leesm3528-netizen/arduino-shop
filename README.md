# 아두몰 (Arduino Shop)

> 아두이노 보드 · 센서 · 모듈을 파는 **학습용 풀스택 쇼핑몰**입니다.
> Next.js + Supabase + 토스페이먼츠(테스트)로 하루 만에 기획부터 배포까지 진행한 과정을 담았습니다.

**배포 사이트:** https://arduino-shop-gamma.vercel.app

**단계별 학습 가이드:** [docs/LEARNING_GUIDE.md](docs/LEARNING_GUIDE.md) ← 처음이라면 여기부터!

---

## 한눈에 보기

| 구분 | 내용 |
|---|---|
| 프론트엔드 | Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 |
| 백엔드 / DB | Supabase (PostgreSQL · Auth · Storage · Edge Functions) |
| 상태 관리 | Zustand (장바구니, localStorage 저장) |
| 결제 | 토스페이먼츠 결제창 **테스트 모드** (실제 청구 없음) |
| 배포 | Vercel (웹) + Supabase Cloud (DB) |
| 상품 데이터 | 22개 상품, 가격은 디바이스마트 판매가 기준 |
| 이미지 | Wikimedia Commons · Flickr 무료 라이선스 실사 사진 |

## 주요 기능

**고객**
- 메인 페이지 (배너, 카테고리, 인기 상품)
- 상품 목록 — 카테고리 / 검색 / 가격순 정렬 / 재고 필터
- 상품 상세 — 사양표, 수량 선택, 리뷰
- 장바구니 → 주문/결제 → 결제 완료
- 회원가입 · 로그인 · 마이페이지(배송지, 주문 내역)
- 구매한 상품에만 리뷰 작성

**관리자**
- 대시보드 (매출, 주문 수, 재고 부족 알림)
- 상품 등록 / 수정 / 삭제 + 이미지 업로드
- 주문 상태 변경 (결제완료 → 배송중 → 배송완료)

## 폴더 구조

```
.
├─ src/
│  ├─ app/                      # 페이지 (폴더 = URL)
│  │  ├─ page.tsx               #   /            메인
│  │  ├─ (shop)/products/       #   /products    목록, [slug] 상세
│  │  ├─ (shop)/cart/           #   /cart        장바구니
│  │  ├─ (shop)/checkout/       #   /checkout    결제, success, fail
│  │  ├─ (auth)/login, signup/  #   /login, /signup
│  │  ├─ auth/callback/         #   이메일 인증 콜백
│  │  ├─ mypage/                #   /mypage, /mypage/orders
│  │  ├─ admin/                 #   /admin (관리자 전용)
│  │  └─ credits/               #   /credits     이미지 출처
│  ├─ components/               # 재사용 UI (layout, product, cart, admin)
│  ├─ lib/supabase/             # Supabase 클라이언트 (브라우저/서버/미들웨어)
│  ├─ lib/actions/              # 서버 액션 (DB 쓰기 작업)
│  ├─ store/cart.ts             # 장바구니 상태 (Zustand)
│  ├─ types/                    # TypeScript 타입
│  └─ middleware.ts             # 로그인 필요 페이지 보호
├─ supabase/
│  ├─ migrations/0001_init.sql  # 테이블 · 보안정책(RLS) · DB 함수
│  ├─ functions/confirm-payment # 결제 승인 Edge Function
│  └─ seed/                     # 상품 데이터(JSON) → seed.sql 생성
├─ public/images/               # 상품 · 배너 사진 (+ CREDITS.md)
└─ docs/                        # 계획서, 학습 가이드
```

> `(shop)`, `(auth)`처럼 괄호로 감싼 폴더는 **URL에 포함되지 않는** 그룹 폴더입니다. 파일 정리용이에요.

## 내 컴퓨터에서 실행하기

### 준비물
- Node.js 20 이상
- Supabase 계정 (무료)

### 1) 설치
```bash
git clone https://github.com/leesm3528-netizen/arduino-shop.git
cd arduino-shop
npm install
```

### 2) Supabase 준비
1. [supabase.com](https://supabase.com)에서 새 프로젝트 생성
2. 대시보드 **SQL Editor**에서 아래 두 파일을 순서대로 실행
   - `supabase/migrations/0001_init.sql` (테이블·보안정책)
   - `supabase/seed/seed.sql` (카테고리 6개 + 상품 22개)
3. 결제 승인 함수 배포
   ```bash
   npx supabase login
   npx supabase functions deploy confirm-payment --project-ref <프로젝트ref> --use-api
   ```

### 3) 환경변수
`.env.example`을 복사해 `.env.local`을 만들고 값을 채웁니다.
```bash
NEXT_PUBLIC_SUPABASE_URL=https://<프로젝트ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Publishable key>
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq   # 토스 공식 문서 테스트 키
```
> Supabase 대시보드 → **Project Settings → API Keys**에서 확인할 수 있어요.

### 4) 실행
```bash
npm run dev
```
→ http://localhost:3000 접속

### 5) 관리자 계정 만들기
회원가입 후 SQL Editor에서:
```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = '내이메일@example.com');
```

## 테스트 결제 방법
1. 상품을 장바구니에 담고 **주문하기**
2. 배송 정보 입력 후 **결제하기** → 토스 결제창이 열림
3. 테스트 모드이므로 아무 카드나 선택해 진행해도 **실제 청구되지 않습니다**

## 보안 포인트 (학습용 핵심!)
| 위험 | 막는 방법 |
|---|---|
| 브라우저에서 가격을 조작 | 주문 금액은 DB 함수 `create_order`가 **서버에서 다시 계산** |
| 결제 없이 "결제완료" 처리 | `mark_order_paid`는 Edge Function(서비스 권한)만 호출 가능 |
| 결제 금액 바꿔치기 | Edge Function이 **주문 금액 = 결제 금액**인지 확인 후 승인 |
| 남의 주문 조회 | RLS 정책으로 **본인 주문만** 조회 |
| 스스로 관리자 승격 | `profiles.role` 컬럼은 사용자 수정 권한 없음 |

## 더 알아보기
- [단계별 학습 가이드](docs/LEARNING_GUIDE.md) — 오늘 진행한 전 과정 + 겪은 문제와 해결법
- [초기 기획서](docs/PLAN.md)
- [이미지 출처](public/images/CREDITS.md)

---
<sub>※ 학습용 데모입니다. 가격 정보는 디바이스마트 판매가(2026-10-13 기준)를 참고했으며, 상품 사진은 대표 이미지로 실제 상품과 다를 수 있습니다.</sub>
