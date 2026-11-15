-- Dùng một ảnh chung (apps/web/public/drink.webp) cho mọi món.
-- Chỉ đổi địa chỉ ảnh, không xóa dữ liệu, đơn hàng hiện có giữ nguyên.
UPDATE "Product" SET "imageUrl" = '/drink.webp';
