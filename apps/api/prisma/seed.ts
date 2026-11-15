import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Ảnh chung cho mọi món, nằm trong apps/web/public (web phục vụ tại /drink.webp)
const imageUrl = '/drink.webp';

// Thứ tự menu: cà phê, latte, trà, cream (menu sắp theo id nên nạp đúng thứ tự này).
const menu = [
  { name: 'Cà phê đen', price: 20000, imageUrl, stock: 50 },
  { name: 'Cà phê sữa', price: 20000, imageUrl, stock: 50 },
  { name: 'Bạc xỉu', price: 20000, imageUrl, stock: 50 },
  { name: 'Cà phê muối', price: 25000, imageUrl, stock: 50 },
  { name: 'Americano', price: 25000, imageUrl, stock: 50 },
  { name: 'Ice latte', price: 40000, imageUrl, stock: 50 },
  { name: 'Chocolate', price: 40000, imageUrl, stock: 50 },
  { name: 'Matcha latte', price: 40000, imageUrl, stock: 50 },
  { name: 'Trà đào', price: 30000, imageUrl, stock: 50 },
  { name: 'Trà ổi', price: 30000, imageUrl, stock: 50 },
  { name: 'Trà mãng cầu', price: 30000, imageUrl, stock: 50 },
  { name: 'Trà kiwi', price: 30000, imageUrl, stock: 50 },
  { name: 'Trà sữa', price: 30000, imageUrl, stock: 50 },
  { name: 'Cookie cream', price: 40000, imageUrl, stock: 50 },
  { name: 'Choco cream', price: 40000, imageUrl, stock: 50 },
  { name: 'Matcha cream', price: 40000, imageUrl, stock: 50 },
];

async function main() {
  // Chạy lại nhiều lần vẫn an toàn: sản phẩm chỉ nạp khi bảng còn trống,
  // mã khuyến mãi dùng upsert.
  if ((await prisma.product.count()) === 0) { // nếu bảng Product trống thì tự có các món sau
    await prisma.product.createMany({ data: menu });
  }

  await prisma.promotion.upsert({
    where: { code: 'BREW10' },
    update: {},
    create: { code: 'BREW10', discountPercent: 10, expiresAt: new Date('2030-12-31') },
  });
}

main().finally(() => prisma.$disconnect());
