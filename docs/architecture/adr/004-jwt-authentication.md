# ADR-004: Xác thực bằng JWT

- Trạng thái: Chấp nhận

## Bối cảnh
Frontend và backend tách biệt, API cần biết ai đang đặt đơn mà không lưu phiên trên server.

## Quyết định
Đăng nhập trả về JWT; frontend gửi token trong header `Authorization: Bearer`. Backend dùng Passport JWT guard để bảo vệ các route đặt đơn, thanh toán và lịch sử đơn. Mật khẩu băm bằng bcrypt. Token có hạn 1 ngày, frontend lưu ở `localStorage`.

## Hệ quả
- Tốt: API không giữ trạng thái phiên, dễ mở rộng.
- Hạn chế: không thu hồi token ngay được trước khi hết hạn; hiện đặt hạn 1 ngày. Token lưu ở `localStorage` nên có rủi ro nếu trang bị tấn công XSS, đăng xuất chỉ xóa token phía trình duyệt.
