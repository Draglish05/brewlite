# Ma trận truy vết

Liên kết mỗi yêu cầu (`docs/requirements/srs.md`) với use-case, sơ đồ, code và test. Tên file sơ đồ nằm trong `docs/diagrams/`.

Quy ước test:
- **UT** là unit test trong `apps/api/src`, chạy bằng `npm test`.
- **INT** là test tích hợp trên database thật trong `tests/api.e2e-spec.ts`, chạy bằng `npm run test:e2e`.
- **Thủ công** là kiểm tra bằng tay trên giao diện (chưa có test tự động cho web).

## Yêu cầu chức năng

| Mã yêu cầu | Use-case / User Story | Thiết kế / Sơ đồ | Code / API | Test |
|---|---|---|---|---|
| FR-01 Menu | Xem menu | `usecase-overview`, `activity-checkout`, `class-domain` (Product) | `GET /products`; `apps/web/src/app/page.tsx` | UT `products.service.spec.ts`; INT luồng end-to-end |
| FR-02 Chi tiết sản phẩm | Xem chi tiết sản phẩm | `usecase-overview`, `class-domain` | `GET /products/:id`; `apps/web/src/app/products/[id]/page.tsx` | UT `products.service.spec.ts` (404); INT |
| FR-03 Size và topping | Chọn size và topping | `usecase-overview` | `apps/web/src/lib/options.ts`, `components/ProductOptions.tsx`; `apps/api/src/orders/pricing.ts` | UT `pricing.spec.ts`; thủ công |
| FR-04 Giỏ hàng | Quản lý giỏ hàng | `usecase-overview`, `activity-checkout` | `apps/web/src/store/cart.ts`, `app/cart/page.tsx` | Thủ công (chưa có test tự động) |
| FR-05 Tổng tiền | Quản lý giỏ hàng, UC-01 | `activity-checkout` | `apps/web/src/app/cart/page.tsx`; tính lại ở server `orders.service.ts` | UT `orders.service.spec.ts`; INT |
| FR-06 Đăng ký | Đăng ký | `usecase-overview` | `POST /auth/register`; `apps/web/src/app/register/page.tsx` | UT `auth.service.spec.ts`; INT |
| FR-07 Đăng nhập | Đăng nhập | `usecase-overview`, `sequence-checkout` | `POST /auth/login`; `apps/web/src/app/login/page.tsx` | UT `auth.service.spec.ts`; INT |
| FR-08 Chặn khi chưa đăng nhập | UC-01 (luồng A1, E2) | `activity-checkout`, `sequence-checkout` | `auth/jwt-auth.guard.ts`, `jwt.strategy.ts` | INT "chặn đặt đơn khi chưa đăng nhập" |
| FR-09 Tạo đơn | UC-01 | `sequence-checkout`, `class-domain` (Order, OrderItem) | `POST /orders`; `orders.service.ts` | UT `orders.service.spec.ts`; INT |
| FR-10 Tồn kho | UC-01 (E3) | `sequence-checkout`, `activity-checkout` | `orders.service.ts` (trừ kho có điều kiện trong transaction) | UT `orders.service.spec.ts`; INT Task 10 (c) |
| FR-11 Khuyến mãi | UC-01 (A2) | `class-domain` (Promotion) | `orders.service.ts`, `pricing.ts` (`calcDiscount`), `prisma/seed.ts` (BREW10) | UT `orders.service.spec.ts`, `pricing.spec.ts`; INT luồng end-to-end |
| FR-12 Thanh toán Ví/Thẻ | UC-01 | `sequence-checkout`, `class-domain` (Payment) | `POST /payments`; `payments/payments.service.ts`, `mock-payment.gateway.ts`; `apps/web/src/app/checkout/page.tsx` | UT `payments.service.spec.ts`; INT |
| FR-13 Idempotency | UC-01 (E5) | `sequence-checkout` | `payments.service.ts` (`Idempotency-Key` duy nhất trong bảng Payment) | UT `payments.service.spec.ts`; INT Task 10 (b) |
| FR-14 Điểm thưởng | UC-01 | `class-domain` (LoyaltyTransaction) | `payments.service.ts`, `pricing.ts` (`calcPoints`); `GET /auth/me` | UT `payments.service.spec.ts`, `pricing.spec.ts`; INT luồng end-to-end (10 điểm) |
| FR-15 Thanh toán thật (Won't) | Ngoài phạm vi | `context-and-scope` | Không thực hiện | Không áp dụng |
| FR-16 Xác nhận đơn | UC-01 | `activity-checkout` | `GET /orders/:id`; `apps/web/src/app/orders/[id]/page.tsx` | UT `orders.service.spec.ts`; INT |
| FR-17 Lịch sử đơn | Xem lịch sử đơn | `usecase-overview` | `GET /orders/me`; `apps/web/src/app/orders/page.tsx` | UT `orders.service.spec.ts`; INT |
| FR-18 Máy trạng thái | UC-01 | `class-domain` (OrderStatus) | `orders/order-status.ts` (`assertTransition`) | UT `order-status.spec.ts`; INT Task 10 (a) |
| FR-19 Hủy đơn | Hủy đơn | `usecase-overview` | `POST /orders/:id/cancel`; `orders.service.ts` | UT `orders.service.spec.ts`; INT Task 10 (a) |
| FR-20 Barista cập nhật trạng thái (Could) | Cập nhật trạng thái pha chế | `usecase-overview` | Chưa thực hiện (nằm ngoài MVP, máy trạng thái đã hỗ trợ sẵn các bước PREPARING, READY, COMPLETED) | Chỉ có UT cho máy trạng thái |

## Yêu cầu phi chức năng

| Mã yêu cầu | Thiết kế | Code / cấu hình | Test / minh chứng |
|---|---|---|---|
| NFR-01 Phản hồi dưới 500ms | `architecture.md` | Toàn bộ API | Đo trên production (mục "Minh chứng"): các API đọc đạt, đăng nhập sát ngưỡng |
| NFR-02 Băm mật khẩu | ADR-004 | `auth.service.ts` (bcrypt) | UT `auth.service.spec.ts` |
| NFR-03 JWT | ADR-004 | `jwt-auth.guard.ts` | INT (401 khi thiếu hoặc sai token) |
| NFR-04 Validate đầu vào | `architecture.md` | DTO trong `auth/dto`, `orders/dto`, `payments/dto`; `ValidationPipe` trong `main.ts` | INT (400 khi dữ liệu sai) |
| NFR-05 Không lộ bí mật | `docs/deployment.md` | `.gitignore` (`.env`), `.env.example`, secret của GitHub Actions | Quét lịch sử Git không thấy bí mật |
| NFR-06 Mobile-first | `architecture.md` | Tailwind, `apps/web/src/app/manifest.ts` | Thủ công |
| NFR-07 Trình duyệt phổ biến | `architecture.md` | Next.js | Thủ công |
| NFR-08 Loading, empty, error | `activity-checkout` | `app/loading.tsx`, `app/error.tsx`, trạng thái trống ở các trang | Thủ công |
| NFR-09 Nhất quán dữ liệu | `sequence-checkout` | `$transaction` trong `orders.service.ts`, `payments.service.ts` | INT (hoàn tác khi hết hàng) |
| NFR-10 Chạy bằng Docker | ADR-006, `deployment` | `docker-compose.yml`, `apps/api/Dockerfile`, `apps/web/Dockerfile` | Chạy `docker compose up --build`, kiểm tra thủ công |
| NFR-11 Health check | `architecture.md`, `deployment` | `apps/api/src/health/` | UT `health.controller.spec.ts`; INT `GET /health` |
| NFR-12 Production, CI/CD | ADR-006, `deployment` | `.github/workflows/ci.yml`, `cd.yml`, `deploy.yml`, `rollback.yml` | CI xanh trên mọi pull request; CD chạy khi đẩy tag (ghi trong `deployment.md`) |
| NFR-13 Kiểm thử tự động | `architecture.md` | `apps/api/src/**/*.spec.ts`, `tests/api.e2e-spec.ts` | `npm test`, `npm run test:e2e` |
| NFR-14 Tài liệu hướng dẫn | | `README.md`, `docs/deployment.md`, `docs/contributing.md` | Người ngoài làm theo được |

## Khoảng trống đã biết

- Web chưa có test tự động (FR-04, giao diện), chỉ kiểm tra thủ công. API có test đầy đủ.
- FR-20 (barista) nằm ngoài MVP.
- NFR-01: `POST /auth/login` có thời gian trung vị khoảng 500ms trên production, sát ngưỡng (chi tiết ở mục "Minh chứng").
- API chạy trên gói miễn phí nên "ngủ" sau 15 phút không có truy cập, lần gọi đầu tiên sau đó mất khoảng 1 phút.

## Minh chứng

### Địa chỉ production

- Web: https://brewlite-nine.vercel.app
- API: https://brewlite-api-g7xb.onrender.com (kiểm tra sống: `/health`)

### Thời gian phản hồi API (NFR-01)

Đo ngày 11/11/2026 trên API production, từ máy của người phát triển (Việt Nam, máy chủ ở Singapore). Mỗi API đo 30 lần sau 3 lần chạy làm nóng, riêng đăng nhập đo 15 lần. Thời gian kết nối TCP thuần tới máy chủ trung bình 88ms (đã nằm trong các số dưới).

| API | Trung vị | p95 | Lớn nhất | Số lần dưới 500ms |
|---|---|---|---|---|
| `GET /health` | 184ms | 211ms | 285ms | 30/30 |
| `GET /products` | 167ms | 205ms | 226ms | 30/30 |
| `GET /products/3` | 174ms | 208ms | 229ms | 30/30 |
| `GET /auth/me` (có JWT) | 166ms | 209ms | 296ms | 30/30 |
| `GET /orders/me` (có JWT) | 187ms | 204ms | 207ms | 30/30 |
| `POST /auth/login` | 500ms | 551ms | 575ms | 7/15 |

Kết luận: các API đọc đạt yêu cầu với biên độ lớn (gấp khoảng hai lần dưới ngưỡng). `POST /auth/login` ở mức sát ngưỡng và vượt ở một nửa số lần đo, vì mỗi lần đăng nhập phải so khớp mật khẩu bằng bcrypt (cố ý chậm để chống dò mật khẩu, yêu cầu NFR-02) trên CPU dùng chung của gói miễn phí. Nhóm chấp nhận đánh đổi này, ưu tiên bảo mật hơn tốc độ cho riêng thao tác đăng nhập.

### Triển khai và phát hành

- Lần chạy CD thành công: https://github.com/Draglish05/brewlite/actions/runs/42983667550 (thẻ `v1.0.2`, đủ 4 job: kiểm tra chất lượng, build image, triển khai và smoke test, tạo release).
- Bản phát hành: https://github.com/Draglish05/brewlite/releases/tag/v1.0.2
- Image trên registry: `ghcr.io/draglish05/brewlite-api` với các tag `v0.1.0`, `v1.0.0`, `v1.0.1`, `v1.0.2` và tag theo commit SHA.
- Các lần chạy CD thất bại và đã dừng đúng thiết kế: thẻ `v0.1.0` (chưa có secret, lần chạy thử đầu tiên), `v1.0.0` và `v1.0.1` (lỗi cấu hình bước Vercel, xem `docs/sprint-review-retrospective.md`).

### CI

- Mọi pull request chạy lint, test, build, và không merge được nếu CI đỏ (xem pull request #3: một lần CI phát hiện test sai rồi xanh trở lại sau khi sửa).
