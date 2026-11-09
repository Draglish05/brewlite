import {
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { assertTransition } from '../orders/order-status';
import { calcPoints } from '../orders/pricing';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { MockPaymentGateway } from './mock-payment.gateway';

type PaymentRecord = {
  id: number;
  orderId: number;
  amount: number;
  method: string;
  status: string;
};

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: MockPaymentGateway,
  ) {}

  async pay(userId: number, idempotencyKey: string, dto: CreatePaymentDto) {
    // Cùng Idempotency-Key thì trả lại kết quả cũ, không thanh toán lần nữa
    const existing = await this.prisma.payment.findUnique({
      where: { idempotencyKey },
      include: { order: true },
    });
    if (existing) {
      if (existing.order.userId !== userId) {
        throw new ConflictException('Idempotency-Key đã được dùng');
      }
      return this.toResult(existing);
    }

    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
    });
    if (order === null || order.userId !== userId) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    // Kiểm tra bằng máy trạng thái trước khi gọi cổng thanh toán.
    // Đơn thanh toán lỗi được thử lại: PAYMENT_FAILED -> PENDING -> PAID.
    let from = order.status;
    if (from === 'PAYMENT_FAILED') {
      assertTransition(from, 'PENDING');
      from = 'PENDING';
    }
    assertTransition(from, 'PAID');

    const success = await this.gateway.charge(order.total, dto.simulateFail === true);

    try {
      const payment = await this.prisma.$transaction(async (tx) => {
        const created = await tx.payment.create({
          data: {
            orderId: order.id,
            idempotencyKey,
            amount: order.total,
            method: dto.method,
            status: success ? 'SUCCESS' : 'FAILED',
          },
        });
        await tx.order.update({
          where: { id: order.id },
          data: { status: success ? 'PAID' : 'PAYMENT_FAILED' },
        });

        // Cộng điểm thưởng khi đơn PAID. orderId của LoyaltyTransaction là duy nhất
        // nên một đơn không thể được cộng điểm hai lần.
        const points = calcPoints(order.total);
        if (success && points > 0) {
          await tx.loyaltyTransaction.create({
            data: { userId, orderId: order.id, points },
          });
          await tx.user.update({
            where: { id: userId },
            data: { loyaltyPoints: { increment: points } },
          });
        }
        return created;
      });
      return this.toResult(payment);
    } catch (error) {
      // ponytail: hai yêu cầu cùng key đến cùng lúc vẫn có thể gọi cổng hai lần,
      // nhưng database chỉ lưu một Payment (key là duy nhất). Muốn chặt hơn thì khóa theo key.
      if ((error as { code?: string }).code === 'P2002') {
        const duplicate = await this.prisma.payment.findUnique({
          where: { idempotencyKey },
        });
        if (duplicate) {
          return this.toResult(duplicate);
        }
      }
      throw error;
    }
  }

  private toResult(payment: PaymentRecord) {
    if (payment.status === 'FAILED') {
      throw new HttpException(
        {
          message: 'Thanh toán thất bại',
          orderId: payment.orderId,
          status: 'PAYMENT_FAILED',
        },
        402,
      );
    }
    return {
      paymentId: payment.id,
      orderId: payment.orderId,
      status: 'PAID',
      amount: payment.amount,
      method: payment.method,
    };
  }
}
