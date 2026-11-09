import { calcDiscount, calcPoints, calcUnitPrice } from './pricing';

describe('calcUnitPrice', () => {
  it('size S không topping giữ nguyên giá gốc', () => {
    expect(calcUnitPrice(45000, 'S', [])).toBe(45000);
  });

  it('cộng phụ thu của size và từng topping', () => {
    expect(calcUnitPrice(45000, 'L', ['Kem'])).toBe(60000);
    expect(calcUnitPrice(45000, 'M', ['Kem', 'Trân châu'])).toBe(60000);
  });
});

describe('calcDiscount', () => {
  it('giảm theo phần trăm', () => {
    expect(calcDiscount(120000, 10)).toBe(12000);
  });

  it('làm tròn xuống đến đồng', () => {
    expect(calcDiscount(35005, 10)).toBe(3500);
  });
});

describe('calcPoints', () => {
  it('1 điểm cho mỗi 10.000đ, làm tròn xuống', () => {
    expect(calcPoints(120000)).toBe(12);
    expect(calcPoints(35000)).toBe(3);
    expect(calcPoints(9999)).toBe(0);
  });
});
