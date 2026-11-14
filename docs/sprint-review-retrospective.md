# Sprint Review và Sprint Retrospective

Dự án do một người thực hiện, đảm nhận cả ba vai trò Product Owner, Scrum Master và Development Team. Daily Scrum không được tổ chức thành buổi họp riêng, thay vào đó tiến độ được theo dõi bằng bảng Product Backlog trên GitHub Projects, các issue và lịch sử commit.

## 1. Kế hoạch và thực tế

Đề gợi ý chia 10 task của Assignment 1 thành 3 Sprint. Thực tế Sprint chạy như sau (ngày theo lịch sử commit và pull request trên `main`):

| Sprint | Mục tiêu | Thời gian thực tế | Kết quả |
|---|---|---|---|
| 1 | Nền tảng và hiển thị menu | 24/10 đến 25/10 | Xong: khởi tạo repo, API sản phẩm, trang menu, CI, README, quy ước làm việc; tài liệu Task 1 đến 3 của Assignment 2 |
| 2 | Giỏ hàng, đặt đơn, đăng nhập | 26/10 | Xong: chi tiết và tùy chọn sản phẩm, giỏ hàng, đăng ký và đăng nhập JWT, API tạo đơn, API thanh toán |
| 3 | Thanh toán, bàn giao, nghiệp vụ nâng cao | 10/11 đến 11/11 | Xong: giao diện thanh toán và lịch sử đơn, Task 10, test tích hợp, Docker, health check, CD và triển khai production |

Giữa Sprint 2 và Sprint 3 có khoảng nghỉ 13 ngày (27/10 đến 09/11) không có commit nào, nên phần lớn khối lượng Sprint 3 bị dồn vào hai ngày cuối.

## 2. Sprint Review

### Increment bàn giao

Một hệ thống chạy được trên môi trường production, dùng được từ đầu đến cuối:

- Web: https://brewlitetat.vercel.app
- API: https://brewlite-api-g7xb.onrender.com (kiểm tra sống: `/health`)
- Mã nguồn: https://github.com/Draglish05/brewlite, bản phát hành `v1.0.2`.

### Kịch bản demo (luồng end-to-end)

1. Mở trang web, xem menu 6 đồ uống (có trạng thái đang tải khi API vừa thức dậy).
2. Bấm một món, chọn size L và topping Kem, giá cập nhật theo lựa chọn, thêm vào giỏ hai lần.
3. Mở giỏ hàng, sửa số lượng, thấy tổng tiền tự tính và số lượng trên biểu tượng giỏ.
4. Bấm Thanh toán khi chưa đăng nhập: được yêu cầu đăng nhập. Đăng ký tài khoản mới, quay lại giỏ hàng (giỏ vẫn còn).
5. Ở trang thanh toán, nhập mã `BREW10` (giảm 10%), chọn Ví điện tử, bấm Xác nhận trả.
6. Màn hình xác nhận hiện mã đơn, trạng thái PAID, giảm giá và tổng tiền. Mở lịch sử đơn thấy đơn vừa tạo và điểm tích lũy.
7. Nhánh lỗi: đặt đơn khác, tick "Giả lập thanh toán lỗi", trạng thái đơn là thanh toán lỗi và giỏ hàng được giữ; bỏ tick rồi bấm Thử thanh toán lại để thanh toán thành công.
8. Hủy một đơn và cho thấy tồn kho được hoàn lại.

### Kết quả kiểm thử

- 41 unit test và 9 test tích hợp trên database thật, đều qua, chạy lại nhiều lần vẫn ổn định.
- Ba test theo yêu cầu của Task 10: chặn chuyển trạng thái sai; gửi hai lần cùng Idempotency-Key chỉ tạo một thanh toán (kể cả khi gửi năm yêu cầu đồng thời); 10 yêu cầu đặt đồng thời khi kho còn 5 thì đúng 5 thành công và kho về 0.
- CI chặn merge khi test hoặc build đỏ (đã có một lần CI phát hiện lỗi và chặn, ở pull request #3).

### Đối chiếu Definition of Done

Code chạy được và qua build; mọi thay đổi đi qua pull request với CI xanh; API có kiểm tra dữ liệu đầu vào; giao diện xử lý trạng thái đang tải, trống và lỗi; có hướng dẫn chạy trong README.

### Chưa hoàn thành hoặc còn hạn chế

- Màn hình cho barista (yêu cầu FR-20) chưa làm, nằm ngoài MVP.
- Thanh toán chỉ là mô phỏng, chưa hoàn tiền khi hủy đơn đã thanh toán, điểm thưởng không bị thu hồi khi hủy.
- Giao diện web chưa có test tự động, mới kiểm tra thủ công.
- `POST /auth/login` mất khoảng 500ms trên production, sát ngưỡng của NFR-01 (xem `docs/traceability-matrix.md`).
- API trên gói miễn phí "ngủ" sau 15 phút không có truy cập, lần gọi đầu mất khoảng 1 phút.

## 3. Biểu đồ burndown

Đơn vị là số hạng mục trong Product Backlog (14 hạng mục, mỗi hạng mục là một issue). Ngày hoàn thành lấy theo ngày mã nguồn của hạng mục được merge vào `main`.

| Ngày | Hoàn thành trong ngày | Còn lại cuối ngày |
|---|---|---|
| 24/10 (bắt đầu) | không có | 14 |
| 25/10 | Khởi tạo repo, API sản phẩm, trang menu, CI | 10 |
| 26/10 | Chi tiết và tùy chọn sản phẩm, giỏ hàng, đăng nhập, API tạo đơn | 6 |
| 27/10 đến 09/11 | không có (khoảng nghỉ) | 6 |
| 10/11 | Thanh toán, xác nhận và lịch sử đơn, nghiệp vụ Task 10, kiểm thử và Docker | 2 |
| 11/11 | CD, triển khai production, bàn giao | 1 |

```
Còn lại
14 |#
12 |
10 |  #
 8 |
 6 |     #-----------------#
 4 |
 2 |                          #
 1 |                              #
 0 +---------------------------------
     24/10 25/10 26/10 ... 09/11 10/11 11/11
```

Hạng mục còn lại cuối cùng là đưa nốt tài liệu thiết kế (một số sơ đồ và thư mục kiến trúc) lên repository.

## 4. Sprint Retrospective

### Điều làm tốt

- Mọi thay đổi đều đi qua pull request và CI, nên nhánh `main` luôn chạy được. Luật chặn merge khi CI đỏ đã được chứng minh bằng một lần CI đỏ thật.
- Nghiệp vụ cốt lõi (trừ kho, thanh toán, idempotency, máy trạng thái) có test chạy trên database thật, tìm và sửa được lỗi test không lặp lại được (khóa Idempotency-Key cố định).
- Pipeline CD tự phát hiện lỗi cấu hình khi triển khai, dừng đúng chỗ và không đưa bản hỏng lên production. Có sẵn cách rollback.
- Tài liệu và mã nguồn bám nhau: ma trận truy vết nối từng yêu cầu với use-case, sơ đồ, code và test.
- Dùng các công cụ chuẩn (Docker, GitHub Actions, Prisma migration) nên cả hệ thống tái tạo được từ đầu bằng `docker compose up --build`.

### Điều cần cải thiện

- Khoảng nghỉ 13 ngày giữa hai Sprint làm khối lượng dồn vào cuối, tăng rủi ro.
- Thử triển khai quá muộn: lần chạy CD đầu tiên mới lộ ra hai lỗi cấu hình (biến môi trường ở chế độ Sensitive không kéo về được CI, và cặp ID dự án không khớp với token), mất ba lần đẩy thẻ để sửa.
- Giao diện web chưa có test tự động, nên có thể sót lỗi ở luồng thanh toán và hủy đơn.
- Làm một mình nên không có người review chéo, chỉ có tự review qua pull request và CI.
- Một số tài liệu thiết kế hoàn thành sớm nhưng đưa lên repository muộn, nên lịch sử commit không phản ánh đúng thứ tự Task 1, 2, 3 trước Task 4, 5.
- Thời gian đăng nhập sát ngưỡng NFR-01.

### Hành động cho lần sau

- Chia việc theo từng ngày và đặt mốc kiểm tra giữa chừng thay vì để dồn.
- Thử triển khai ngay trong Sprint đầu tiên với một bản tối thiểu, để lỗi cấu hình lộ sớm.
- Commit tài liệu ngay khi hoàn thành từng task.
- Thêm test cho giao diện web (component và luồng chính) bằng một công cụ chạy trình duyệt tự động.
- Nếu cần, giảm thời gian đăng nhập bằng cách chỉnh độ khó băm mật khẩu hoặc dùng gói máy chủ mạnh hơn.

## 5. Product Backlog cho phiên bản sau

1. Màn hình cho barista nhận đơn và cập nhật trạng thái pha chế (FR-20), kèm thông báo cho khách khi đơn sẵn sàng.
2. Hoàn tiền và thu hồi điểm thưởng khi hủy đơn đã thanh toán.
3. Tích hợp cổng thanh toán thật ở chế độ thử nghiệm (sandbox) thay cho cổng mô phỏng, khóa chặt hơn theo Idempotency-Key.
4. Service worker để dùng PWA khi không có mạng.
5. Test end-to-end cho giao diện bằng trình duyệt tự động.
6. Trang quản trị menu và tồn kho.
7. Thu hẹp thời gian "ngủ" của API (gói trả phí hoặc cơ chế giữ thức).

## 6. Phản hồi từ giảng viên (khách hàng)

_Ghi lại sau buổi Sprint Review và demo._
