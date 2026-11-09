import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersService } from './orders.service';

const cappuccino = { id: 1, name: 'Cappuccino', price: 45000, stock: 10 };
const brew10 = {
  id: 9,
  code: 'BREW10',
  discountPercent: 10,
  active: true,
  expiresAt: new Date('2030-12-31'),
};

describe('OrdersService', () => {
  let service: OrdersService;
  const tx = {
    product: { findUnique: jest.fn(), updateMany: jest.fn(), update: jest.fn() },
    promotion: { findUnique: jest.fn() },
    order: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
  };
  const prisma = {
    order: { findMany: jest.fn(), findUnique: jest.fn() },
    $transaction: (fn: (t: typeof tx) => unknown) => fn(tx),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module = await Test.createTestingModule({
      providers: [OrdersService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(OrdersService);
  });

  function orderLine(qty = 2) {
    return { items: [{ productId: 1, size: 'L', toppings: ['Kem'], qty }] };
  }

  it('tự tính giá ở server và lưu đơn PENDING', async () => {
    tx.product.findUnique.mockResolvedValue(cappuccino);
    tx.product.updateMany.mockResolvedValue({ count: 1 });
    tx.order.create.mockResolvedValue({ id: 7 });

    await service.create(3, orderLine());

    const data = tx.order.create.mock.calls[0][0].data;
    expect(data.userId).toBe(3);
    expect(data.subtotal).toBe(120000); // (45000 + 10000 + 5000) x 2
    expect(data.discount).toBe(0);
    expect(data.total).toBe(120000);
    expect(data.items.create[0].lineTotal).toBe(120000);
  });

  it('áp mã khuyến mãi hợp lệ: giảm 10%', async () => {
    tx.product.findUnique.mockResolvedValue(cappuccino);
    tx.product.updateMany.mockResolvedValue({ count: 1 });
    tx.promotion.findUnique.mockResolvedValue(brew10);
    tx.order.create.mockResolvedValue({ id: 7 });

    await service.create(3, { ...orderLine(), promoCode: 'brew10' });

    const data = tx.order.create.mock.calls[0][0].data;
    expect(tx.promotion.findUnique.mock.calls[0][0].where.code).toBe('BREW10');
    expect(data.discount).toBe(12000);
    expect(data.total).toBe(108000);
    expect(data.promotionId).toBe(9);
  });

  it('từ chối mã khuyến mãi không tồn tại', async () => {
    tx.product.findUnique.mockResolvedValue(cappuccino);
    tx.product.updateMany.mockResolvedValue({ count: 1 });
    tx.promotion.findUnique.mockResolvedValue(null);

    await expect(
      service.create(3, { ...orderLine(), promoCode: 'SAI' }),
    ).rejects.toThrow(BadRequestException);
    expect(tx.order.create).not.toHaveBeenCalled();
  });

  it('từ chối mã khuyến mãi đã hết hạn', async () => {
    tx.product.findUnique.mockResolvedValue(cappuccino);
    tx.product.updateMany.mockResolvedValue({ count: 1 });
    tx.promotion.findUnique.mockResolvedValue({
      ...brew10,
      expiresAt: new Date('2020-01-01'),
    });

    await expect(
      service.create(3, { ...orderLine(), promoCode: 'BREW10' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('báo lỗi 409 và không lưu đơn khi không đủ tồn kho', async () => {
    tx.product.findUnique.mockResolvedValue(cappuccino);
    tx.product.updateMany.mockResolvedValue({ count: 0 });

    await expect(service.create(3, orderLine(99))).rejects.toThrow(ConflictException);
    expect(tx.order.create).not.toHaveBeenCalled();
  });

  it('báo lỗi 400 khi sản phẩm không tồn tại', async () => {
    tx.product.findUnique.mockResolvedValue(null);

    await expect(service.create(3, orderLine())).rejects.toThrow(BadRequestException);
  });

  it('findMine chỉ lấy đơn của người dùng, mới nhất trước', async () => {
    prisma.order.findMany.mockResolvedValue([{ id: 2 }, { id: 1 }]);

    const orders = await service.findMine(3);

    expect(orders).toHaveLength(2);
    const query = prisma.order.findMany.mock.calls[0][0];
    expect(query.where).toEqual({ userId: 3 });
    expect(query.orderBy).toEqual({ createdAt: 'desc' });
  });

  it('findOne trả về đơn của chính người dùng', async () => {
    prisma.order.findUnique.mockResolvedValue({ id: 5, userId: 3 });

    expect(await service.findOne(3, 5)).toEqual({ id: 5, userId: 3 });
  });

  it('findOne báo 404 khi xem đơn của người khác', async () => {
    prisma.order.findUnique.mockResolvedValue({ id: 5, userId: 99 });

    await expect(service.findOne(3, 5)).rejects.toThrow(NotFoundException);
  });

  it('hủy đơn PENDING thì hoàn lại tồn kho và chuyển sang CANCELLED', async () => {
    tx.order.findUnique.mockResolvedValue({
      id: 5,
      userId: 3,
      status: 'PENDING',
      items: [{ productId: 1, qty: 2 }],
    });
    tx.order.update.mockResolvedValue({ id: 5, status: 'CANCELLED' });

    await service.cancel(3, 5);

    expect(tx.product.update.mock.calls[0][0].data.stock).toEqual({ increment: 2 });
    expect(tx.order.update.mock.calls[0][0].data.status).toBe('CANCELLED');
  });

  it('không hủy được đơn đã COMPLETED và không hoàn kho', async () => {
    tx.order.findUnique.mockResolvedValue({
      id: 5,
      userId: 3,
      status: 'COMPLETED',
      items: [{ productId: 1, qty: 2 }],
    });

    await expect(service.cancel(3, 5)).rejects.toThrow(ConflictException);
    expect(tx.product.update).not.toHaveBeenCalled();
  });

  it('không hủy được đơn của người khác', async () => {
    tx.order.findUnique.mockResolvedValue({
      id: 5,
      userId: 99,
      status: 'PENDING',
      items: [],
    });

    await expect(service.cancel(3, 5)).rejects.toThrow(NotFoundException);
  });
});
