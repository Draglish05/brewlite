# BrewLite Web (Next.js)

Giao diện của BrewLite, thiết kế cho điện thoại (mobile-first).

## Thư mục

```
src/
  app/          các trang, mỗi thư mục là một địa chỉ web
    page.tsx            /          menu
    products/[id]/      /products/3   chi tiết, chọn size và topping
    cart/               /cart         giỏ hàng
    checkout/           /checkout     thanh toán
    orders/             /orders       lịch sử đơn, /orders/[id] xác nhận đơn
    login/, register/   đăng nhập, đăng ký
    layout.tsx, loading.tsx, error.tsx, manifest.ts   khung chung, chờ tải, báo lỗi, PWA
  components/   thành phần dùng lại (AuthLink, CartLink, ProductOptions)
  lib/          hàm gọi API, bảng phụ thu, kiểu dữ liệu
  store/        trạng thái dùng chung (giỏ hàng, đăng nhập) bằng Zustand
public/         ảnh tĩnh, biểu tượng PWA
```

## Các file cấu hình ở thư mục này

| Nhóm | File |
|---|---|
| Chạy và build | `package.json`, `next.config.ts`, `tsconfig.json`, `Dockerfile`, `.dockerignore` |
| Chất lượng code | `eslint.config.mjs` |

## Biến môi trường (`.env.local`)

- `API_URL`: địa chỉ API mà server của Next.js gọi tới.
- `NEXT_PUBLIC_API_URL`: địa chỉ API mà trình duyệt gọi tới.

## Lệnh thường dùng

```
npm run dev     chạy web (cổng 3000)
npm run lint    kiểm tra code
npm run build   build bản chạy thật
```
