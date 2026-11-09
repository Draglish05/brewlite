import { getTestDatabaseUrl } from './test-db';

// Chạy trong mỗi file test, trước khi nạp ứng dụng: trỏ ứng dụng vào database test
process.env.DATABASE_URL = getTestDatabaseUrl();
