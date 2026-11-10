import { createRequire } from 'module';
import { resolve } from 'path';

// Thư viện (pg, dotenv...) được cài trong apps/api. Phần chuẩn bị chạy một lần
// (global-setup) nằm ngoài cơ chế nạp module của Jest, nên nạp thư viện từ đó bằng cách này.
export const apiRequire = createRequire(
  resolve(__dirname, '../../apps/api/package.json'),
);
