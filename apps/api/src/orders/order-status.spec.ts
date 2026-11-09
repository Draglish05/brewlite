import { ConflictException } from '@nestjs/common';
import { assertTransition, canTransition } from './order-status';

const ALL = [
  'PENDING',
  'PAID',
  'PREPARING',
  'READY',
  'COMPLETED',
  'PAYMENT_FAILED',
  'CANCELLED',
];

// Đúng các mũi tên trong sơ đồ máy trạng thái của đề
const VALID = [
  ['PENDING', 'PAID'],
  ['PENDING', 'PAYMENT_FAILED'],
  ['PENDING', 'CANCELLED'],
  ['PAYMENT_FAILED', 'PENDING'],
  ['PAYMENT_FAILED', 'CANCELLED'],
  ['PAID', 'PREPARING'],
  ['PAID', 'CANCELLED'],
  ['PREPARING', 'READY'],
  ['READY', 'COMPLETED'],
];

describe('máy trạng thái đơn hàng', () => {
  it('cho phép đúng các chuyển trạng thái trong sơ đồ', () => {
    for (const [from, to] of VALID) {
      expect(() => assertTransition(from, to)).not.toThrow();
    }
  });

  it('chặn mọi chuyển trạng thái không có mũi tên', () => {
    for (const from of ALL) {
      for (const to of ALL) {
        const isValid = VALID.some(([f, t]) => f === from && t === to);
        if (isValid === false) {
          expect(canTransition(from, to)).toBe(false);
          expect(() => assertTransition(from, to)).toThrow(ConflictException);
        }
      }
    }
  });

  it('COMPLETED và CANCELLED là trạng thái kết thúc', () => {
    for (const to of ALL) {
      expect(canTransition('COMPLETED', to)).toBe(false);
      expect(canTransition('CANCELLED', to)).toBe(false);
    }
  });

  it('không nhảy cóc: PENDING không thể sang PREPARING hay COMPLETED', () => {
    expect(() => assertTransition('PENDING', 'PREPARING')).toThrow(ConflictException);
    expect(() => assertTransition('PENDING', 'COMPLETED')).toThrow(ConflictException);
  });
});
