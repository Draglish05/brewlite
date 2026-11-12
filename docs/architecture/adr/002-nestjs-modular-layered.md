# ADR-002: Backend NestJS theo module và kiến trúc phân lớp

- Trạng thái: Chấp nhận

## Bối cảnh
Backend có nhiều nghiệp vụ: xác thực, sản phẩm, đơn hàng, thanh toán, khuyến mãi, điểm thưởng.

## Quyết định
Mỗi nhóm nghiệp vụ chính (auth, products, orders, payments, health) là một module NestJS gồm controller, service và dto. Khuyến mãi nằm trong module orders, điểm thưởng nằm trong module payments. Controller chỉ nhận request và gọi service; nghiệp vụ nằm trong service; dữ liệu truy cập qua Prisma.

## Hệ quả
- Tốt: dễ đọc, dễ tìm code, dễ viết unit test cho service, cấu trúc phổ biến với NestJS.
- Hạn chế: là một khối (monolith), không scale riêng từng module.
