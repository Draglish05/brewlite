# Triển khai BrewLite

Production dùng: **Vercel** (web Next.js), **Render** (API NestJS chạy từ Docker image và PostgreSQL), **GitHub Container Registry** (nơi lưu image của API). Lý do chọn nằm trong `docs/architecture/adr/006-deployment-platform.md`.

```
Trình duyệt --HTTPS--> Vercel (web) --HTTPS--> Render (API) --mạng nội bộ--> Render PostgreSQL
                                                   ^
GitHub Actions --build, push image--> GHCR --pull--+
```

## 1. Biến môi trường và bí mật

Không có bí mật nào nằm trong repository hay log CI. Giá trị thật chỉ đặt ở các nơi dưới đây.

### Render (dịch vụ API)

| Biến | Giá trị |
|---|---|
| `DATABASE_URL` | Internal Database URL của Render PostgreSQL |
| `JWT_SECRET` | Chuỗi ngẫu nhiên dài (khác bản trên máy local) |
| `PORT` | `4000` |
| `WEB_URL` | URL web trên Vercel (để API cho phép CORS), ví dụ `https://brewlite.vercel.app` |

### Vercel (dự án web)

| Biến | Giá trị |
|---|---|
| `API_URL` | URL API trên Render (gọi từ phía server của Next.js) |
| `NEXT_PUBLIC_API_URL` | URL API trên Render (gọi từ trình duyệt) |

### GitHub (Settings, Secrets and variables, Actions)

| Loại | Tên | Ý nghĩa |
|---|---|---|
| Secret | `RENDER_DEPLOY_HOOK_URL` | Deploy hook của dịch vụ API trên Render |
| Secret | `VERCEL_TOKEN` | Token tạo ở Vercel (Account Settings, Tokens) |
| Secret | `VERCEL_ORG_ID` | Lấy từ file `.vercel/project.json` sau khi chạy `npx vercel link` |
| Secret | `VERCEL_PROJECT_ID` | Lấy từ file `.vercel/project.json` |
| Variable | `API_URL` | URL API production (dùng cho smoke test) |
| Variable | `WEB_URL` | URL web production (dùng cho smoke test) |

## 2. Thiết lập lần đầu

1. **Database:** trên Render, New, PostgreSQL, chọn gói Free. Giữ database **không công khai**: chỉ dùng Internal Database URL cho API.
2. **API:** trên Render, New, Web Service, chọn "Existing image" và nhập `ghcr.io/<chủ-repo-viết-thường>/brewlite-api:latest`. Đặt các biến ở bảng trên. Health check path: `/health`. Sau lần đẩy image đầu tiên, vào GitHub, Packages, `brewlite-api`, đổi **visibility thành Public** để Render kéo được image.
3. **Deploy hook:** Render, dịch vụ API, Settings, Deploy Hook. Sao chép vào secret `RENDER_DEPLOY_HOOK_URL`.
4. **Web:** trên Vercel, Add New Project, chọn repository, đặt **Root Directory** là `apps/web`, thêm hai biến `API_URL` và `NEXT_PUBLIC_API_URL`. Tắt tính năng tự deploy từ Git nếu muốn chỉ deploy qua pipeline.
5. Tạo token Vercel và đặt các secret, variable ở bảng trên.

## 3. Quy trình phát hành

1. Merge mọi thay đổi vào `main` (CI phải xanh).
2. Tạo tag phiên bản:

```
git tag v1.0.0
git push origin v1.0.0
```

3. Pipeline **CD** tự chạy: `Lint, Test, Build` (dùng lại CI), build image Docker, đẩy lên GHCR với hai tag (12 ký tự đầu của commit SHA và tên phiên bản), gọi deploy hook của Render với đúng tag đó, chờ `GET /health` trả `ok`, triển khai web lên Vercel, rồi kiểm tra trang chủ.
4. Nếu smoke test thất bại thì pipeline **dừng và báo lỗi**, kèm hướng dẫn rollback (mục 4).

### Migration an toàn

API chạy `prisma migrate deploy` mỗi lần khởi động. Lệnh này **chỉ áp dụng migration còn thiếu**, không xóa hay đặt lại dữ liệu. Nếu migration lỗi thì container dừng và Render giữ nguyên phiên bản cũ đang chạy. Mọi migration phải tương thích ngược với bản API đang chạy (chỉ thêm cột, thêm bảng) để rollback không bị vướng.

## 4. Rollback

**API:** trên GitHub, tab Actions, chọn workflow **Rollback**, Run workflow, nhập `image_tag` của phiên bản trước (xem danh sách tag ở Packages, `brewlite-api`, hoặc trong log của lần CD trước). Workflow triển khai lại đúng image đó và chạy smoke test.

**Web:** trên Vercel, dự án, Deployments, chọn bản triển khai tốt gần nhất, **Instant Rollback**.

**Database:** không tự rollback dữ liệu. Vì migration chỉ thêm (mục 3) nên bản API cũ vẫn chạy được trên schema mới.

## 5. Lưu ý về gói miễn phí

- API trên Render ngủ sau khoảng 15 phút không có truy cập, lần gọi đầu mất khoảng 1 phút. Trước khi demo, mở `/health` vài phút trước.
- PostgreSQL miễn phí **hết hạn sau 30 ngày** kể từ lúc tạo. Không tạo quá sớm so với ngày chấm.

## 6. Kiểm tra thủ công sau khi triển khai

- Web: mở URL production, xem menu, đăng ký, đặt và thanh toán một đơn.
- API: `GET <API_URL>/health` trả `{"status":"ok","database":"up"}`.
- Database không truy cập được từ Internet (chỉ có Internal URL).
