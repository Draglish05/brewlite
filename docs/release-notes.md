# BrewLite v1.0.0

Phiên bản đầu tiên hoàn chỉnh của BrewLite: ứng dụng đặt đồ uống không dùng tiền mặt, từ chọn món đến thanh toán và theo dõi đơn.

## Địa chỉ

- Web: https://brewlite-nine.vercel.app
- API: https://brewlite-api-g7xb.onrender.com (kiểm tra sống: `/health`)

Lưu ý: API chạy trên gói miễn phí nên ngủ sau khoảng 15 phút không có truy cập. Lần mở đầu tiên có thể mất khoảng 1 phút.

## Tính năng

- Xem menu, chi tiết sản phẩm, chọn size (S, M, L) và topping, giá cập nhật theo lựa chọn.
- Giỏ hàng: thêm, sửa số lượng, xóa, tự tính tổng tiền, lưu khi tải lại trang.
- Đăng ký, đăng nhập (JWT, mật khẩu băm bằng bcrypt).
- Tạo đơn hàng: server tự tính giá, kiểm tra tồn kho và trừ kho trong một transaction.
- Thanh toán không tiền mặt bằng Ví hoặc Thẻ (cổng thanh toán mô phỏng), có Idempotency-Key để gửi lại không bị thanh toán hai lần.
- Mã khuyến mãi `BREW10` (giảm 10%) và điểm thưởng (1 điểm cho mỗi 10.000đ).
- Máy trạng thái đơn hàng, hủy đơn có hoàn lại tồn kho.
- Màn hình xác nhận đơn, lịch sử đơn, điểm tích lũy.
- Giao diện mobile-first, có manifest PWA.

## Chất lượng và vận hành

- Unit test và test tích hợp trên database thật (chặn chuyển trạng thái sai, cùng Idempotency-Key chỉ một thanh toán, đặt đồng thời không vượt tồn kho, luồng từ menu đến xác nhận đơn).
- CI chạy lint, test, build trên mọi pull request; pull request không merge được nếu CI đỏ.
- CD tự chạy khi đẩy tag: kiểm tra chất lượng, build image Docker, đẩy lên GHCR, triển khai, smoke test.
- `docker compose up --build` chạy cả web, API và database ở máy local.

## Giới hạn đã biết

- Thanh toán chỉ là mô phỏng, không có giao dịch tiền thật và không có hoàn tiền.
- Màn hình cho barista nhận đơn chưa có (nằm ngoài MVP).
- PWA mới có manifest và biểu tượng, chưa có service worker (chưa dùng offline).
- Giao diện web chưa có test tự động.

## Rollback

Xem `docs/deployment.md`, mục Rollback: chạy workflow **Rollback** với tag image của phiên bản trước, hoặc dùng Instant Rollback trên Vercel cho web.
