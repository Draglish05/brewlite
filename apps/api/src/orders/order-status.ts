import { ConflictException } from '@nestjs/common';

// Các chuyển trạng thái được phép (đúng sơ đồ máy trạng thái của đề).
// COMPLETED và CANCELLED là trạng thái kết thúc.
const ALLOWED: Record<string, string[]> = {
  PENDING: ['PAID', 'PAYMENT_FAILED', 'CANCELLED'],
  PAYMENT_FAILED: ['PENDING', 'CANCELLED'],
  PAID: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY'],
  READY: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
};

export function canTransition(from: string, to: string) {
  return ALLOWED[from]?.includes(to) ?? false;
}

// Chuyển trạng thái không hợp lệ thì ném lỗi 409
export function assertTransition(from: string, to: string) {
  if (canTransition(from, to) === false) {
    throw new ConflictException(`Không thể chuyển đơn từ ${from} sang ${to}`);
  }
}
