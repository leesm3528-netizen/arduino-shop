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

## 4. 개발 단계 (2026-10-13 진행 결과)
- [x] **세팅** — Next.js 생성, Supabase 프로젝트 연결, 환경변수
- [x] **DB** — 마이그레이션(테이블 + RLS), 시드 데이터(아두이노 상품 22개)
- [x] **상품 조회** — 메인, 카테고리, 상품 상세, 검색
- [x] **인증** — 회원가입/로그인, 프로필
- [x] **장바구니**
- [x] **주문/결제** — 체크아웃, 토스 결제 연동 (웹훅 대신 Edge Function 승인 방식)
- [x] **마이페이지** — 주문 내역, 리뷰
- [x] **관리자** — 상품/재고/주문 관리
- [x] **배포** — Vercel 배포 (https://arduino-shop-gamma.vercel.app)
- [ ] 커스텀 도메인 연결
- [ ] Vercel ↔ GitHub 자동 배포 연결

## 5. 계획 대비 변경 사항
| 계획 | 실제 | 이유 |
|---|---|---|
| `cart_items` 테이블로 장바구니 동기화 | localStorage(Zustand) 저장 | 구현 단순화, 비회원도 사용 가능 |
| 결제 웹훅 | Edge Function에서 결제 승인 | 승인 시점에 금액 검증 + 시크릿 키 보호 |
| 카테고리/검색 별도 페이지 | `/products?category=&q=` 쿼리 방식 | 한 페이지에서 필터 조합 가능 |

자세한 과정은 [LEARNING_GUIDE.md](LEARNING_GUIDE.md)를 참고하세요.
