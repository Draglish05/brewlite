import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const image = (text: string) => `https://placehold.co/400x400?text=${text}`;

async function main() {
  // Chạy lại nhiều lần vẫn an toàn: sản phẩm chỉ nạp khi bảng còn trống,
  // mã khuyến mãi dùng upsert.
  if ((await prisma.product.count()) === 0) {
    await prisma.product.createMany({
      data: [
        { name: 'Cà phê sữa', price: 35000, imageUrl: image('Ca+phe+sua'), stock: 50 },
        { name: 'Americano', price: 40000, imageUrl: image('Americano'), stock: 50 },
        { name: 'Cappuccino', price: 45000, imageUrl: image('Cappuccino'), stock: 50 },
        { name: 'Trà đào', price: 39000, imageUrl: image('Tra+dao'), stock: 50 },
        { name: 'Trà vải', price: 39000, imageUrl: image('Tra+vai'), stock: 50 },
        { name: 'Bạc xỉu', price: 38000, imageUrl: image('Bac+xiu'), stock: 50 },
      ],
    });
  }

  await prisma.promotion.upsert({
    where: { code: 'BREW10' },
    update: {},
    create: { code: 'BREW10', discountPercent: 10, expiresAt: new Date('2030-12-31') },
  });
}

main().finally(() => prisma.$disconnect());
