FROM node:24-slim

WORKDIR /app

# Cài thư viện trước để Docker giữ lại lớp này khi chỉ sửa mã nguồn
COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
COPY prisma.config.ts tsconfig.json tsconfig.build.json nest-cli.json ./
# Chỉ cần để sinh Prisma Client, không kết nối database lúc build
RUN DATABASE_URL=postgresql://build:build@localhost:5432/build npx prisma generate

COPY src ./src
RUN npm run build

EXPOSE 4000

# Áp dụng migration và nạp dữ liệu mẫu (an toàn khi chạy lại) rồi mới mở API
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && node dist/main"]
