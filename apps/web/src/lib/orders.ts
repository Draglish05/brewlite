export type OrderItem = {
  id: number;
  size: string;
  toppings: string[];
  qty: number;
  lineTotal: number;
  product: { name: string };
};

export type Order = {
  id: number;
  status: string;
  subtotal: number;
  discount: number;
  total: number;
  createdAt: string;
  items: OrderItem[];
};

export const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Chờ thanh toán',
  PAID: 'Đã thanh toán',
  PREPARING: 'Đang pha chế',
  READY: 'Sẵn sàng nhận',
  COMPLETED: 'Hoàn tất',
  PAYMENT_FAILED: 'Thanh toán lỗi',
  CANCELLED: 'Đã hủy',
};
