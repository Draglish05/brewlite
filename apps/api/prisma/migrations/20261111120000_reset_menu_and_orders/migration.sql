-- Dọn dữ liệu thử trước khi dùng menu mới (chạy đúng một lần khi deploy):
-- xoá đơn hàng, thanh toán, điểm thưởng và món cũ; giữ tài khoản, đặt điểm về 0.
-- Menu mới do seed.ts nạp lại ngay sau migration.
TRUNCATE "OrderItem", "Payment", "LoyaltyTransaction", "Order", "Product" RESTART IDENTITY;
UPDATE "User" SET "loyaltyPoints" = 0;
