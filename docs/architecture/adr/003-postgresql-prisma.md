# ADR-003: Dùng PostgreSQL với Prisma

- Trạng thái: Chấp nhận

## Bối cảnh
Hệ thống cần transaction cho việc tạo đơn và trừ tồn kho, và cơ sở dữ liệu phải tái tạo được bằng migration và seed. Đề bắt buộc PostgreSQL.

## Quyết định
Dùng PostgreSQL, truy cập qua Prisma (schema, migration, seed). Chống bán vượt tồn kho bằng câu lệnh UPDATE có điều kiện (`stock >= số lượng`) trong transaction, kèm cột `version` của Product tăng sau mỗi lần trừ kho (khóa lạc quan: không giữ khóa, câu lệnh chỉ thành công khi điều kiện còn đúng).

## Hệ quả
- Tốt: kiểu dữ liệu TypeScript tự sinh từ schema, migration có lịch sử, transaction đáng tin cậy.
- Hạn chế: cần học Prisma; điều kiện cập nhật tồn kho phải tự viết trong câu lệnh.
