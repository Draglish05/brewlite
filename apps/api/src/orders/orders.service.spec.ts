import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersService } from './orders.service';

const cappuccino = { id: 1, name: 'Cappuccino', price: 45000, stock: 10 };

describe('OrdersService', () => {
  let service: OrdersService;
  const tx = {
    product: { findUnique: jest.fn(), updateMany: jest.fn() },
    order: { create: jest.fn() },
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

  it('tự tính giá ở server và lưu đơn PENDING', async () => {
    tx.product.findUnique.mockResolvedValue(cappuccino);
    tx.product.updateMany.mockResolvedValue({ count: 1 });
    tx.order.create.mockResolvedValue({ id: 7 });

    await service.create(3, {
      items: [{ productId: 1, size: 'L', toppings: ['Kem'], qty: 2 }],
    });

    const data = tx.order.create.mock.calls[0][0].data;
    expect(data.userId).toBe(3);
    expect(data.subtotal).toBe(120000); // (45000 + 10000 + 5000) x 2
    expect(data.total).toBe(120000);
    expect(data.items.create[0].lineTotal).toBe(120000);
  });

  it('báo lỗi 409 và không lưu đơn khi không đủ tồn kho', async () => {
    tx.product.findUnique.mockResolvedValue(cappuccino);
    tx.product.updateMany.mockResolvedValue({ count: 0 });

    await expect(
      service.create(3, {
        items: [{ productId: 1, size: 'S', toppings: [], qty: 99 }],
      }),
    ).rejects.toThrow(ConflictException);
    expect(tx.order.create).not.toHaveBeenCalled();
  });

  it('báo lỗi 400 khi sản phẩm không tồn tại', async () => {
    tx.product.findUnique.mockResolvedValue(null);

    await expect(
      service.create(3, {
        items: [{ productId: 999, size: 'S', toppings: [], qty: 1 }],
      }),
    ).rejects.toThrow(BadRequestException);
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
});
