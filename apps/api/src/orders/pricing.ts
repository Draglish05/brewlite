// Bảng phụ thu. Server tự tính giá, không tin giá do trình duyệt gửi lên.
export const SIZE_EXTRA = { S: 0, M: 5000, L: 10000 };

export const TOPPING_EXTRA = { 'Trân châu': 5000, Kem: 5000 };

export const SIZES = Object.keys(SIZE_EXTRA);
export const TOPPINGS = Object.keys(TOPPING_EXTRA);

export function calcUnitPrice(basePrice: number, size: string, toppings: string[]) {
  let price = basePrice + SIZE_EXTRA[size as keyof typeof SIZE_EXTRA];
  for (const topping of toppings) {
    price += TOPPING_EXTRA[topping as keyof typeof TOPPING_EXTRA];
  }
  return price;
}

// Giảm theo phần trăm, làm tròn xuống đến đồng
export function calcDiscount(subtotal: number, discountPercent: number) {
  return Math.floor((subtotal * discountPercent) / 100);
}

// 1 điểm cho mỗi 10.000đ (làm tròn xuống)
export function calcPoints(total: number) {
  return Math.floor(total / 10000);
}
