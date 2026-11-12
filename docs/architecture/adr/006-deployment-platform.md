# ADR-006: Triển khai trên Vercel và Render, image lưu ở GitHub Container Registry

- Trạng thái: Chấp nhận

## Bối cảnh
Cần một URL production dùng HTTPS, cơ sở dữ liệu không public, pipeline CI/CD tự động, và chi phí bằng không.

## Quyết định
- Frontend Next.js chạy trên Vercel (có CDN và HTTPS).
- Backend NestJS chạy trên Render dưới dạng Docker image, PostgreSQL chạy trên Render và chỉ nhận kết nối nội bộ.
- Image API được build trong GitHub Actions, gắn tag bằng commit SHA (và tên phiên bản) rồi đẩy lên GitHub Container Registry.
- Pipeline (chạy khi đẩy thẻ `v*`) gọi deploy hook của Render bằng secret, rồi chạy smoke test vào `GET /health`.
- Sau đó pipeline gọi deploy hook của Vercel để build web, rồi chạy smoke test vào trang chủ.

## Hệ quả
- Tốt: miễn phí, cấu hình ít, có HTTPS tự động.
- Hạn chế: gói miễn phí của Render có thể "ngủ" khi ít truy cập; cơ sở dữ liệu miễn phí có thể hết hạn, cần kiểm tra trước ngày nộp. Rollback API bằng workflow Rollback với tag image cũ; rollback web bằng "Instant Rollback" của Vercel.
