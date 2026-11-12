# Kiến trúc BrewLite

## 1. Tổng quan

BrewLite dùng **kiến trúc phân lớp** với hai ứng dụng tách biệt trong một repository: frontend `apps/web` (Next.js) gọi REST API của backend `apps/api` (NestJS), backend lưu dữ liệu trong PostgreSQL và gọi một dịch vụ thanh toán mô phỏng.

```
Trình duyệt / PWA --HTTPS--> Next.js (apps/web)
       |                            |
       | HTTPS, REST/JSON           | HTTPS, REST/JSON (server tải /products)
       v                            v
       +-----------------> NestJS API (apps/api) --SQL--> PostgreSQL
                                    |
                                    +--> Payment Service (mô phỏng, nằm trong tiến trình API)
```

Trình duyệt tải trang từ Next.js, rồi gọi API trực tiếp cho đăng nhập, đặt đơn, thanh toán. Riêng trang menu, Next.js tải dữ liệu từ API ngay trên server.

## 2. Các thành phần

| Thành phần | Công nghệ | Vai trò | Mã nguồn |
|---|---|---|---|
| Frontend | Next.js (App Router), TypeScript, TailwindCSS, Zustand | Hiển thị menu, giỏ hàng, thanh toán, lịch sử đơn; mobile-first, có manifest PWA | `apps/web` |
| Backend API | NestJS, TypeScript, class-validator, Passport JWT | Xác thực, nghiệp vụ đơn hàng, thanh toán, tồn kho, khuyến mãi | `apps/api` |
| Cơ sở dữ liệu | PostgreSQL, Prisma | Lưu User, Product, Order, OrderItem, Payment, Promotion, LoyaltyTransaction | `apps/api/prisma` |
| Dịch vụ thanh toán | Module mô phỏng trong NestJS | Giả lập Ví/Thẻ, trả về thành công hoặc thất bại | `apps/api/src/payments` |
| CI/CD | GitHub Actions, GitHub Container Registry | Lint, test, build, đóng gói image, deploy, smoke test | `.github/workflows` |

## 3. Backend theo module

Mỗi nghiệp vụ là một module NestJS gồm controller (nhận request), service (xử lý nghiệp vụ) và dto (kiểm tra dữ liệu vào):

```
apps/api/src/
├─ auth/        đăng ký, đăng nhập, JWT guard
├─ products/    danh sách và chi tiết sản phẩm
├─ orders/      tạo đơn, hủy đơn, lịch sử đơn, máy trạng thái, tính giá, mã khuyến mãi
├─ payments/    thanh toán mô phỏng, idempotency, cộng điểm thưởng
├─ health/      GET /health
└─ prisma/      kết nối cơ sở dữ liệu
```

Các lớp: **Controller** (HTTP) gọi **Service** (nghiệp vụ) gọi **Prisma** (dữ liệu). Controller không chứa nghiệp vụ.

## 4. Cơ sở dữ liệu và migration

PostgreSQL được truy cập qua Prisma. Cấu trúc bảng nằm trong `schema.prisma`; mỗi thay đổi tạo một migration có lịch sử trong repository. Dữ liệu mẫu nạp bằng script seed, nên cơ sở dữ liệu tái tạo được từ đầu. Khi API khởi động, migration chạy bằng `prisma migrate deploy`, rồi seed bằng `prisma db seed`, trước khi API nhận request.

## 5. Logging, health check và cấu hình

- **Logging:** dùng bộ log mặc định của NestJS (ghi lúc khởi động và khi có lỗi), ghi ra stdout để nền tảng thu log. Chưa có log nghiệp vụ riêng. Code không ghi mật khẩu hay token.
- **Health check:** `GET /health` trả 200 khi API chạy và kết nối được cơ sở dữ liệu. Nền tảng triển khai và bước smoke test sau deploy dùng endpoint này.
- **Cấu hình:** đọc từ biến môi trường (`DATABASE_URL`, `JWT_SECRET`, `WEB_URL` cho CORS, `NEXT_PUBLIC_API_URL` và `API_URL` cho web). Repository chỉ có `.env.example`; giá trị thật nằm trong secret của GitHub Actions và của nền tảng.

## 6. Lý do chọn, ưu điểm, hạn chế và đánh đổi

| Quyết định | Ưu điểm | Hạn chế / đánh đổi |
|---|---|---|
| Tách frontend và backend | Mỗi phần phát triển, kiểm thử và triển khai độc lập; đúng yêu cầu đề | Phải cấu hình CORS, hai pipeline và hai nơi deploy |
| Kiến trúc phân lớp, backend theo module | Dễ đọc, dễ tìm code, phổ biến với NestJS | Một khối (monolith), không scale từng module riêng |
| PostgreSQL và Prisma | Giao dịch (transaction) đáng tin cậy cho tồn kho và thanh toán; kiểu dữ liệu tự sinh | Phải học Prisma; chống bán vượt tồn kho bằng câu lệnh UPDATE có điều kiện `stock >= số lượng` (kèm cột `version`) phải tự viết |
| Thanh toán mô phỏng nằm trong API | Đơn giản, không phụ thuộc dịch vụ ngoài | Không phản ánh độ trễ và lỗi thật của cổng thanh toán |
| Triển khai Vercel và Render | Miễn phí, có HTTPS, nối GitHub dễ | Gói miễn phí có thể "ngủ" khi ít truy cập |

Các quyết định chi tiết được ghi thành ADR trong thư mục [adr](adr/).

## 7. Truy vết deployment diagram

Mỗi thành phần trong `docs/diagrams/deployment.puml` đối chiếu với kiến trúc và mã nguồn như sau:

| Thành phần trong sơ đồ | Mục trong tài liệu này | Mã nguồn |
|---|---|---|
| Vercel (Next.js) | Mục 2, Frontend | `apps/web` |
| Render Web Service (NestJS API) | Mục 2 và 3, Backend API | `apps/api`, `apps/api/Dockerfile` |
| Render PostgreSQL | Mục 4, Cơ sở dữ liệu | `apps/api/prisma` |
| GitHub Container Registry | Mục 2, CI/CD | `.github/workflows` |
| GitHub Actions | Mục 2, CI/CD | `.github/workflows` |
| GitHub Repository | Mục 2, CI/CD | `.github/workflows`, `docs/contributing.md` |
| Mock Payment Gateway (trong API) | Mục 2, Dịch vụ thanh toán | `apps/api/src/payments/mock-payment.gateway.ts` |
| Local (Docker Compose) | Mục 5, Cấu hình | `docker-compose.yml`, `.env.example` |
