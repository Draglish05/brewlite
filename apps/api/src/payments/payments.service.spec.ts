import { ConflictException, HttpException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { MockPaymentGateway } from './mock-payment.gateway';
import { PaymentsService } from './payments.service';

const pendingOrder = { id: 5, userId: 3, status: 'PENDING', total: 120000 };

describe('PaymentsService', () => {
  let service: PaymentsService;
  const tx = {
    payment: { create: jest.fn() },
    order: { update: jest.fn() },
    loyaltyTransaction: { create: jest.fn() },
    user: { update: jest.fn() },
  };
  const prisma = {
    payment: { findUnique: jest.fn() },
    order: { findUnique: jest.fn() },
    $transaction: (fn: (t: typeof tx) => unknown) => fn(tx),
  };
  const gateway = { charge: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();
    tx.payment.create.mockImplementation(({ data }) => ({ id: 1, ...data }));
    const module = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: prisma },
        { provide: MockPaymentGateway, useValue: gateway },
      ],
    }).compile();
    service = module.get(PaymentsService);
  });

  it('thanh toán thành công thì đơn chuyển sang PAID', async () => {
    prisma.payment.findUnique.mockResolvedValue(null);
    prisma.order.findUnique.mockResolvedValue(pendingOrder);
    gateway.charge.mockResolvedValue(true);

    const result = await service.pay(3, 'key-1', { orderId: 5, method: 'WALLET' });

    expect(result.status).toBe('PAID');
    expect(result.amount).toBe(120000);
    expect(tx.order.update.mock.calls[0][0].data.status).toBe('PAID');
  });

  it('đơn PAID thì cộng điểm thưởng: 120.000đ được 12 điểm', async () => {
    prisma.payment.findUnique.mockResolvedValue(null);
    prisma.order.findUnique.mockResolvedValue(pendingOrder);
    gateway.charge.mockResolvedValue(true);

    await service.pay(3, 'key-1', { orderId: 5, method: 'WALLET' });

    expect(tx.loyaltyTransaction.create.mock.calls[0][0].data).toEqual({
      userId: 3,
      orderId: 5,
      points: 12,
    });
    expect(tx.user.update.mock.calls[0][0].data.loyaltyPoints).toEqual({ increment: 12 });
  });

  it('thanh toán lỗi thì đơn là PAYMENT_FAILED, trả về 402 và không cộng điểm', async () => {
    prisma.payment.findUnique.mockResolvedValue(null);
    prisma.order.findUnique.mockResolvedValue(pendingOrder);
    gateway.charge.mockResolvedValue(false);

    const error = await service
      .pay(3, 'key-1', { orderId: 5, method: 'CARD', simulateFail: true })
      .catch((e) => e);

    expect(error).toBeInstanceOf(HttpException);
    expect(error.getStatus()).toBe(402);
    expect(tx.order.update.mock.calls[0][0].data.status).toBe('PAYMENT_FAILED');
    expect(tx.loyaltyTransaction.create).not.toHaveBeenCalled();
  });

  it('gửi lại cùng Idempotency-Key thì không thanh toán lần hai', async () => {
    prisma.payment.findUnique.mockResolvedValue({
      id: 1,
      orderId: 5,
      amount: 120000,
      method: 'WALLET',
      status: 'SUCCESS',
      order: { userId: 3 },
    });

    const result = await service.pay(3, 'key-1', { orderId: 5, method: 'WALLET' });

    expect(result.status).toBe('PAID');
    expect(gateway.charge).not.toHaveBeenCalled();
    expect(tx.payment.create).not.toHaveBeenCalled();
    expect(tx.loyaltyTransaction.create).not.toHaveBeenCalled();
  });

  it('không cho thanh toán đơn của người khác', async () => {
    prisma.payment.findUnique.mockResolvedValue(null);
    prisma.order.findUnique.mockResolvedValue({ ...pendingOrder, userId: 99 });

    await expect(
      service.pay(3, 'key-1', { orderId: 5, method: 'WALLET' }),
    ).rejects.toThrow(NotFoundException);
    expect(gateway.charge).not.toHaveBeenCalled();
  });

  it.each(['PAID', 'CANCELLED', 'PREPARING', 'COMPLETED'])(
    'chặn thanh toán đơn đang ở trạng thái %s, không gọi cổng thanh toán',
    async (status) => {
      prisma.payment.findUnique.mockResolvedValue(null);
      prisma.order.findUnique.mockResolvedValue({ ...pendingOrder, status });

      await expect(
        service.pay(3, 'key-2', { orderId: 5, method: 'WALLET' }),
      ).rejects.toThrow(ConflictException);
      expect(gateway.charge).not.toHaveBeenCalled();
    },
  );

  it('đơn PAYMENT_FAILED được thử lại với key mới', async () => {
    prisma.payment.findUnique.mockResolvedValue(null);
    prisma.order.findUnique.mockResolvedValue({
      ...pendingOrder,
      status: 'PAYMENT_FAILED',
    });
    gateway.charge.mockResolvedValue(true);

    const result = await service.pay(3, 'key-new', { orderId: 5, method: 'CARD' });

    expect(result.status).toBe('PAID');
  });
});
