# ADR-005: Thanh toán mô phỏng và idempotency

- Trạng thái: Chấp nhận

## Bối cảnh
Đề dùng cổng thanh toán mô phỏng và yêu cầu gửi lại cùng một yêu cầu thanh toán không bị trừ tiền hai lần.

## Quyết định
Thanh toán mô phỏng nằm trong module `payments` của API, trả về thành công hoặc thất bại. Client gửi header `Idempotency-Key`; bảng Payment lưu key này với ràng buộc duy nhất. Nếu key đã tồn tại, API trả lại kết quả của lần trước.

## Hệ quả
- Tốt: đơn giản, kiểm thử được, chống thanh toán lặp.
- Hạn chế: không phản ánh độ trễ và lỗi của cổng thanh toán thật.
- Hạn chế: hai yêu cầu cùng key đến đúng cùng lúc vẫn có thể cùng gọi cổng mô phỏng, nhưng ràng buộc duy nhất của database chỉ cho lưu một Payment và yêu cầu đến sau nhận lại kết quả đã lưu. Với cổng thật cần khóa theo key trước khi gọi cổng.
