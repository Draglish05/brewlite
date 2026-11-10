import { execSync } from 'child_process';
import { resolve } from 'path';
import { apiRequire } from './api-require';
import { getAdminDatabaseUrl, getTestDatabaseUrl, TEST_DB_NAME } from './test-db';

const { Client } = apiRequire('pg') as typeof import('pg');

// Chạy một lần trước toàn bộ test: tạo database test (nếu chưa có),
// áp dụng migration và nạp dữ liệu mẫu.
export default async function globalSetup() {
  const admin = new Client({ connectionString: getAdminDatabaseUrl() });
  await admin.connect();
  const found = await admin.query('select 1 from pg_database where datname = $1', [
    TEST_DB_NAME,
  ]);
  if (found.rowCount === 0) {
    await admin.query(`create database ${TEST_DB_NAME}`);
  }
  await admin.end();

  const options = {
    cwd: resolve(__dirname, '../../apps/api'),
    env: { ...process.env, DATABASE_URL: getTestDatabaseUrl() },
    stdio: 'ignore' as const,
  };
  execSync('npx prisma migrate deploy', options);
  execSync('npx prisma db seed', options);
}
