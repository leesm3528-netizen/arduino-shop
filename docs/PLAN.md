# 아두이노 쇼핑몰 프로젝트 계획

## 1. 기술 스택
| 영역 | 선택 |
|---|---|
| 프론트엔드 | Next.js (App Router) + TypeScript |
| 스타일 | Tailwind CSS |
| 백엔드/DB | Supabase (Postgres, Auth, Storage, RLS) |
| 상태관리 | Zustand (장바구니) |
| 결제 | 토스페이먼츠 (테스트 모드) |
| 배포 | Vercel + Supabase Cloud |

## 2. 핵심 기능
### 고객
- 상품 목록 / 카테고리별 보기 (보드, 센서, 모듈, 키트, 부품, 공구)
- 상품 상세 (사양, 핀맵, 호환 보드, 예제 코드 링크, 재고)
- 검색 / 필터 (가격, 카테고리, 재고 있음)
- 장바구니 (비회원은 localStorage, 회원은 DB 동기화)
- 회원가입 / 로그인 (이메일, 소셜)
- 주문 / 결제 / 주문 내역
- 리뷰 (구매자만)

### 관리자
- 상품 등록·수정·삭제, 이미지 업로드
- 재고 관리
- 주문 상태 변경 (결제완료 → 배송중 → 배송완료)

## 3. DB 설계 (초안)
- `profiles` — id(auth.users), name, phone, address, role(user/admin)
- `categories` — id, name, slug, parent_id
- `products` — id, category_id, name, slug, description, price, stock, specs(jsonb), images(text[]), is_active
- `cart_items` — id, user_id, product_id, quantity
- `orders` — id, user_id, status, total_price, shipping_address, payment_key, created_at
- `order_items` — id, order_id, product_id, price, quantity
- `reviews` — id, user_id, product_id, rating, content

RLS: 상품/카테고리는 누구나 읽기, 쓰기는 admin만. 장바구니/주문/프로필은 본인만.

## 4. 개발 단계
1. **세팅** — Next.js 생성, Supabase 프로젝트 연결, 환경변수
2. **DB** — 마이그레이션(테이블 + RLS), 시드 데이터(아두이노 상품 20~30개)
3. **상품 조회** — 메인, 카테고리, 상품 상세, 검색
4. **인증** — 회원가입/로그인, 프로필
5. **장바구니**
6. **주문/결제** — 체크아웃, 토스 결제 연동, 웹훅
7. **마이페이지** — 주문 내역, 리뷰
8. **관리자** — 상품/재고/주문 관리
9. **배포** — Vercel 배포, 도메인
