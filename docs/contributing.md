# Quy ước làm việc

## Chiến lược nhánh

- `main` luôn chạy được. Không commit trực tiếp vào `main`.
- Mỗi task làm trên một nhánh riêng, đặt tên theo dạng `loại/mô-tả-ngắn`:
  `feat/cart`, `fix/order-total`, `docs/srs`, `ci/setup`.
- Làm xong mở pull request vào `main`. Chỉ merge khi CI (job `api` và `web`) xanh.

## Quy ước commit

Dạng `loại(phạm vi): mô tả ngắn`, viết ở thì hiện tại:

- `feat`: thêm tính năng. Ví dụ: `feat(api): add products endpoints`
- `fix`: sửa lỗi
- `docs`: tài liệu
- `test`: kiểm thử
- `ci`: cấu hình CI/CD
- `chore`: việc lặt vặt (cấu hình, thư viện)

## Definition of Done

Một task chỉ xong khi:

- Code chạy được, không lỗi build, đúng tiêu chí chấp nhận của task.
- Có commit rõ ràng và đã qua pull request (CI xanh, tự review lại diff).
- API có validate đầu vào; giao diện xử lý trạng thái loading và lỗi cơ bản.
- Có test cho phần nghiệp vụ quan trọng.
- README có hướng dẫn chạy nếu cách chạy thay đổi.
