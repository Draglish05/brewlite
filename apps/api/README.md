# BrewLite API (NestJS)

Backend của BrewLite: đăng nhập, menu, đơn hàng, thanh toán giả lập, điểm thưởng.

## Thư mục

```
src/
  main.ts          điểm khởi động của ứng dụng
  app.module.ts    gom các module lại
  auth/            đăng ký, đăng nhập, JWT
  products/        danh sách và chi tiết sản phẩm
  orders/          đơn hàng, tính giá, mã khuyến mãi, máy trạng thái đơn
  payments/        thanh toán giả lập, Idempotency-Key, cộng điểm thưởng
  health/          GET /health
  prisma/          kết nối database
  generated/       Prisma Client (tự sinh, không sửa, không commit)
prisma/            cấu trúc bảng (schema), migration, dữ liệu mẫu (seed)
```

Mỗi module gồm: `controller` (nhận request), `service` (xử lý nghiệp vụ), `dto` (kiểm tra dữ liệu gửi lên) và các file `.spec.ts` (unit test).

## Các file cấu hình ở thư mục này

| Nhóm | File |
|---|---|
| Chạy và build | `package.json`, `nest-cli.json`, `tsconfig.json`, `tsconfig.build.json`, `Dockerfile`, `.dockerignore` |
| Chất lượng code | `oxlint.json` (lint), `.prettierrc` (định dạng), `jest.config.ts` (unit test) |
| Database | `prisma.config.ts` |

## Lệnh thường dùng

```
npm run start:dev   chạy API (cổng 4000), tự khởi động lại khi sửa code
npm test            unit test (dùng dữ liệu giả)
npm run test:e2e    test tích hợp trên database thật (code nằm ở ../../tests)
npm run lint        kiểm tra code (cả src và tests)
npm run build       biên dịch ra thư mục dist
```
