# Test tích hợp và end-to-end

Các test này gọi API thật, chạy trên **database thật** (không dùng dữ liệu giả).

```
tests/
  api.e2e-spec.ts      các bài test: luồng menu đến xác nhận đơn, 3 test của Task 10, health check
  jest-e2e.json        cấu hình Jest cho thư mục này
  tsconfig.json        cấu hình TypeScript cho thư mục này
  support/
    global-setup.ts    chạy một lần đầu: tạo database test, áp dụng migration, nạp dữ liệu mẫu
    setup-env.ts       trỏ ứng dụng vào database test
    test-db.ts         tính địa chỉ database test (brewlite_test)
```

## Cách chạy

Cần database đang chạy (`docker compose up -d db`), rồi:

```
cd apps/api
npm run test:e2e
```

Test dùng database riêng `brewlite_test` trên cùng máy chủ với `DATABASE_URL`, nên không đụng vào dữ liệu làm việc. Unit test nằm cạnh code trong `apps/api/src` (các file `.spec.ts`).
