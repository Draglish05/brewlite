# ADR-001: Dùng một repository (monorepo) cho web và API

- Trạng thái: Chấp nhận

## Bối cảnh
Dự án có frontend Next.js và backend NestJS. Đề yêu cầu cấu trúc `apps/web`, `apps/api`, `docs`, `tests`.

## Quyết định
Đặt cả hai ứng dụng, tài liệu và pipeline CI/CD trong một repository. Hai ứng dụng độc lập, mỗi bên có `package.json` riêng, không dùng công cụ quản lý monorepo.

## Hệ quả
- Tốt: một lịch sử commit, một pull request có thể sửa cả hai phía, tài liệu nằm cạnh mã nguồn.
- Hạn chế: CI phải chạy hai phần; phải cài thư viện hai lần.
