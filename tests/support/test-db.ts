import { resolve } from 'path';
import { apiRequire } from './api-require';

const { config } = apiRequire('dotenv') as typeof import('dotenv');

export const TEST_DB_NAME = 'brewlite_test';

// Test tích hợp chạy trên database riêng (brewlite_test) cùng máy chủ với
// DATABASE_URL, để không làm hỏng dữ liệu làm việc.
export function getTestDatabaseUrl() {
  config({ path: resolve(__dirname, '../../.env'), quiet: true });
  const base = process.env.DATABASE_URL;
  if (!base) {
    throw new Error('Thiếu DATABASE_URL (đặt trong .env hoặc biến môi trường)');
  }
  const url = new URL(base);
  url.pathname = `/${TEST_DB_NAME}`;
  return url.toString();
}

export function getAdminDatabaseUrl() {
  const url = new URL(getTestDatabaseUrl());
  url.pathname = '/postgres';
  return url.toString();
}
