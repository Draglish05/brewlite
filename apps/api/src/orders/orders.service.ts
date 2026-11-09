import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { calcUnitPrice } from './pricing';

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

  async findOne(userId: number, id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: ORDER_INCLUDE,
    });
    if (order === null || order.userId !== userId) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }
    return order;
  }

  create(userId: number, dto: CreateOrderDto) {
    // Mọi thứ trong transaction: một bước lỗi thì tất cả được hoàn tác,
    // không để lại tồn kho đã trừ mà không có đơn.
    return this.prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const lines: {
        productId: number;
        size: string;
        toppings: string[];
        qty: number;
        lineTotal: number;
      }[] = [];

      for (const item of dto.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });
        if (product === null) {
          throw new BadRequestException(`Sản phẩm ${item.productId} không tồn tại`);
        }

        // Chỉ trừ khi còn đủ hàng. Câu lệnh này chạy nguyên tử trong database
        // nên hai người đặt cùng lúc không thể bán vượt tồn kho.
        const updated = await tx.product.updateMany({
          where: { id: product.id, stock: { gte: item.qty } },
          data: { stock: { decrement: item.qty }, version: { increment: 1 } },
        });
        if (updated.count === 0) {
          throw new ConflictException(`${product.name} không đủ số lượng`);
        }

        const unitPrice = calcUnitPrice(product.price, item.size, item.toppings);
        const lineTotal = unitPrice * item.qty;
        subtotal += lineTotal;
        lines.push({
          productId: product.id,
          size: item.size,
          toppings: item.toppings,
          qty: item.qty,
          lineTotal,
        });
      }

      return tx.order.create({
        data: { userId, subtotal, total: subtotal, items: { create: lines } },
        include: { items: true },
      });
    });
  }
}
