import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { assertTransition } from './order-status';
import { calcDiscount, calcUnitPrice } from './pricing';

type DbTransaction = Prisma.TransactionClient;
type OrderItemInput = CreateOrderDto['items'][number];

type OrderLine = {
  productId: number;
  size: string;
  toppings: string[];
  qty: number;
  lineTotal: number;
};

// Kèm tên món để hiển thị trên màn hình xác nhận và lịch sử đơn
const ORDER_INCLUDE = {
  items: { include: { product: { select: { name: true } } } },
};

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  findMine(userId: number) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: ORDER_INCLUDE,
    });
  }

  async findOne(userId: number, orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: ORDER_INCLUDE,
    });
    if (order === null || order.userId !== userId) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }
    return order;
  }

  // Mọi thứ nằm trong transaction: một bước lỗi thì tất cả được hoàn tác,
  // không để lại tồn kho đã trừ mà không có đơn.
  create(userId: number, dto: CreateOrderDto) {
    return this.prisma.$transaction(async (db) => {
      // Bước 1: duyệt từng món, trừ kho, tính tiền
      const orderLines: OrderLine[] = [];
      let subtotal = 0;
      for (const orderItem of dto.items) {
        const orderLine = await this.buildOrderLine(db, orderItem);
        orderLines.push(orderLine);
        subtotal += orderLine.lineTotal;
      }

      // Bước 2: dữ liệu đơn hàng (chưa có khuyến mãi)
      const orderData: Prisma.OrderUncheckedCreateInput = {
        userId,
        subtotal,
        discount: 0,
        total: subtotal,
        items: { create: orderLines },
      };

      // Bước 3: áp mã khuyến mãi (nếu có)
      if (dto.promoCode) {
        const promotion = await this.getValidPromotion(db, dto.promoCode);
        const discount = calcDiscount(subtotal, promotion.discountPercent);
        orderData.discount = discount;
        orderData.total = subtotal - discount;
        orderData.promotionId = promotion.id;
      }

      // Bước 4: tạo đơn
      return db.order.create({
        data: orderData,
        include: { items: true },
      });
    });
  }

  // Hủy đơn: chỉ khi máy trạng thái cho phép, và hoàn lại tồn kho.
  // ponytail: đơn đã PAID bị hủy vẫn giữ điểm thưởng và chưa mô phỏng hoàn tiền
  // (hoàn tiền nằm ngoài phạm vi MVP).
  cancel(userId: number, orderId: number) {
    return this.prisma.$transaction(async (db) => {
      const order = await db.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });
      if (order === null || order.userId !== userId) {
        throw new NotFoundException('Không tìm thấy đơn hàng');
      }
      assertTransition(order.status, 'CANCELLED');

      for (const orderItem of order.items) {
        await db.product.update({
          where: { id: orderItem.productId },
          data: { stock: { increment: orderItem.qty }, version: { increment: 1 } },
        });
      }

      return db.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' },
        include: ORDER_INCLUDE,
      });
    });
  }

  // ---------- Các hàm phụ ----------

  // Kiểm tra món, trừ kho, tính tiền cho một dòng đơn hàng
  private async buildOrderLine(
    db: DbTransaction,
    orderItem: OrderItemInput,
  ): Promise<OrderLine> {
    const product = await db.product.findUnique({
      where: { id: orderItem.productId },
    });
    if (product === null) {
      throw new BadRequestException(`Sản phẩm ${orderItem.productId} không tồn tại`);
    }

    // Chỉ trừ khi còn đủ hàng. Câu lệnh này chạy nguyên tử trong database
    // nên hai người đặt cùng lúc không thể bán vượt tồn kho.
    const stockResult = await db.product.updateMany({
      where: { id: product.id, stock: { gte: orderItem.qty } },
      data: { stock: { decrement: orderItem.qty }, version: { increment: 1 } },
    });
    if (stockResult.count === 0) {
      throw new ConflictException(`${product.name} không đủ số lượng`);
    }

    const unitPrice = calcUnitPrice(product.price, orderItem.size, orderItem.toppings);
    return {
      productId: product.id,
      size: orderItem.size,
      toppings: orderItem.toppings,
      qty: orderItem.qty,
      lineTotal: unitPrice * orderItem.qty,
    };
  }

  // Tìm mã khuyến mãi, ném lỗi nếu không hợp lệ hoặc đã hết hạn
  private async getValidPromotion(db: DbTransaction, promoCode: string) {
    const promotion = await db.promotion.findUnique({
      where: { code: promoCode.trim().toUpperCase() },
    });
    if (
      promotion === null ||
      promotion.active === false ||
      promotion.expiresAt < new Date()
    ) {
      throw new BadRequestException('Mã khuyến mãi không hợp lệ hoặc đã hết hạn');
    }
    return promotion;
  }
}
