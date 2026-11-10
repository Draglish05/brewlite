# BrewLite
Ứng dụng đặt đồ uống không dùng tiền mặt.
## Công nghệ
- Frontend: Next.js, TypeScript, TailwindCSS (`apps/web`)
- Backend: NestJS, TypeScript, Prisma (`apps/api`)
- Cơ sở dữ liệu: PostgreSQL chạy bằng Docker
## Yêu cầu
- Node.js bản LTS (22 hoặc 24)
- Docker Desktop
## Chạy nhanh bằng Docker Compose (web, API và database)

Tạo file `.env` từ file mẫu (xem bước 1 bên dưới), rồi ở thư mục gốc:

```
docker compose up --build
```

- Web: http://localhost:3000
- API: http://localhost:4000 (kiểm tra sống bằng http://localhost:4000/health)
- API tự áp dụng migration và nạp dữ liệu mẫu (6 đồ uống, mã khuyến mãi `BREW10` giảm 10%) khi khởi động.

Dừng bằng `docker compose down` (thêm `-v` nếu muốn xóa luôn dữ liệu).

## Chạy ở máy local (từng phần, để lập trình)
1. Tạo file `.env` từ file mẫu rồi đổi `change_me` thành mật khẩu của bạn (ở cả hai chỗ):

```
cp .env.example .env
```

2. Chạy cơ sở dữ liệu:

```
docker compose up -d
```

3. Chạy API (cổng 4000):

```
cd apps/api
npm install
npx prisma migrate deploy
npx prisma db seed
npm run start:dev
```

4. Chạy web (cổng 3000). Tạo file `apps/web/.env.local` gồm hai dòng `API_URL=http://localhost:4000` và `NEXT_PUBLIC_API_URL=http://localhost:4000`, rồi:

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