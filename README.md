# BrewLite

Ứng dụng đặt đồ uống không dùng tiền mặt: xem menu, chọn size và topping, giỏ hàng, đăng nhập, thanh toán (cổng mô phỏng) và theo dõi đơn hàng.

## Bản đang chạy (production)

- Web: https://brewlitetat.vercel.app
- API: https://brewlite-api-g7xb.onrender.com/health (kiểm tra sống)
- Mã khuyến mãi để thử: `BREW10` (giảm 10%).
- API chạy trên gói miễn phí nên "ngủ" sau khoảng 15 phút không có truy cập. Lần mở đầu tiên có thể mất khoảng 1 phút.

## Công nghệ

- Frontend: Next.js, TypeScript, TailwindCSS (`apps/web`)
- Backend: NestJS, TypeScript, Prisma (`apps/api`)
- Cơ sở dữ liệu: PostgreSQL chạy bằng Docker
- Triển khai: GitHub Actions, GitHub Container Registry, Render (API và database), Vercel (web)

## Yêu cầu

- Node.js bản LTS (22 hoặc 24)
- Docker Desktop

## Chuẩn bị (làm một lần)

Tạo file `.env` ở thư mục gốc từ file mẫu:

```
cp .env.example .env
```

Trên Windows (CMD hoặc PowerShell) dùng `copy .env.example .env`.

Mở file `.env` và đổi `change_me` thành giá trị của bạn ở **ba chỗ**:

- `POSTGRES_PASSWORD`
- `DATABASE_URL` (mật khẩu trong đường dẫn phải **giống** `POSTGRES_PASSWORD`)
- `JWT_SECRET` (một chuỗi ngẫu nhiên dài)

## Chạy nhanh bằng Docker Compose (web, API và database)

Ở thư mục gốc:

```
docker compose up --build
```

- Web: http://localhost:3000
- API: http://localhost:4000 (kiểm tra sống bằng http://localhost:4000/health)
- API tự áp dụng migration và nạp dữ liệu mẫu (16 đồ uống, mã khuyến mãi `BREW10` giảm 10%) khi khởi động.

Dừng bằng `docker compose down` (thêm `-v` nếu muốn xóa luôn dữ liệu).

## Chạy ở máy local (từng phần, để lập trình)

Không chạy cách này cùng lúc với Docker Compose ở trên, vì hai bên dùng chung cổng 3000 và 4000.

1. Chạy cơ sở dữ liệu (chỉ database, không chạy API và web):

```
docker compose up -d db
```

2. Chạy API (cổng 4000):

```
cd apps/api
npm install
npx prisma migrate deploy
npx prisma db seed
npm run start:dev
```

3. Chạy web (cổng 3000). Tạo file `apps/web/.env.local` gồm hai dòng `API_URL=http://localhost:4000` và `NEXT_PUBLIC_API_URL=http://localhost:4000`, rồi:

```
cd apps/web
npm install
npm run dev
```

Mở http://localhost:3000 để xem menu.

## Kiểm thử và build

```
cd apps/api
npm test
npm run test:e2e
npm run lint
npm run build
```

`npm test` chạy unit test (dùng dữ liệu giả). `npm run test:e2e` chạy test tích hợp trên **database thật**: cần database đang chạy (`docker compose up -d db`), test tự tạo và dùng database riêng `brewlite_test`, không đụng dữ liệu làm việc.

```
cd apps/web
npm run lint
npm run build
```

## Triển khai và rollback

- **Kiểm tra tự động (CI):** chạy cho mỗi pull request và mỗi lần đẩy lên `main`: cài thư viện, lint, test, build. Pull request không được merge khi CI đỏ.
- **Triển khai (CD):** đẩy một thẻ phiên bản, ví dụ `git tag v1.0.4` rồi `git push origin v1.0.4`. Pipeline sẽ kiểm tra chất lượng, build image Docker, đẩy lên GitHub Container Registry, triển khai API lên Render và web lên Vercel, chạy smoke test, rồi tạo bản phát hành (GitHub Release). Migration database tự chạy khi API khởi động.
- **Rollback API:** vào tab Actions của repository, chọn workflow **Rollback**, bấm Run workflow và nhập tag image của phiên bản cũ (ví dụ `v1.0.3`). Rollback web bằng "Instant Rollback" trên Vercel.
- Chi tiết biến môi trường và thiết lập lần đầu: [docs/deployment.md](docs/deployment.md).

## Cấu trúc thư mục

Repository chia làm 4 phần rõ ràng. Mỗi thư mục có README riêng giải thích bên trong.

```
brewlite/
├─ apps/                  CODE
│  ├─ api/                backend NestJS (cổng 4000)
│  └─ web/                frontend Next.js (cổng 3000)
├─ tests/                 TEST tích hợp và end-to-end (gọi API thật)
├─ docs/                  TÀI LIỆU: yêu cầu, sơ đồ, kiến trúc, triển khai
└─ cấu hình chung
   ├─ .github/workflows/  CI/CD (kiểm tra, build, triển khai, rollback)
   ├─ docker-compose.yml  chạy web, API, database bằng Docker
   ├─ .env.example        mẫu biến môi trường
   └─ README.md
```

- `apps/api`: xem [apps/api/README.md](apps/api/README.md)
- `apps/web`: xem [apps/web/README.md](apps/web/README.md)
- `tests`: xem [tests/README.md](tests/README.md)
- `docs`: xem [docs/README.md](docs/README.md)
