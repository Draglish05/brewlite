import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const image = (text: string) => `https://placehold.co/400x400?text=${text}`;

// Thứ tự menu: cà phê, latte, trà, cream (menu sắp theo id nên thêm món theo đúng thứ tự này).
const menu = [
  { name: 'Cà phê đen', price: 20000, imageUrl: image('Ca+phe+den') },
  { name: 'Cà phê sữa', price: 20000, imageUrl: image('Ca+phe+sua') },
  { name: 'Bạc xỉu', price: 20000, imageUrl: image('Bac+xiu') },
  { name: 'Cà phê muối', price: 25000, imageUrl: image('Ca+phe+muoi') },
  { name: 'Americano', price: 25000, imageUrl: image('Americano') },
  { name: 'Ice latte', price: 40000, imageUrl: image('Ice+latte') },
  { name: 'Chocolate', price: 40000, imageUrl: image('Chocolate') },
  { name: 'Matcha latte', price: 40000, imageUrl: image('Matcha+latte') },
  { name: 'Trà đào', price: 30000, imageUrl: image('Tra+dao') },
  { name: 'Trà ổi', price: 30000, imageUrl: image('Tra+oi') },
  { name: 'Trà mãng cầu', price: 30000, imageUrl: image('Tra+mang+cau') },
  { name: 'Trà kiwi', price: 30000, imageUrl: image('Tra+kiwi') },
  { name: 'Trà sữa', price: 30000, imageUrl: image('Tra+sua') },
  { name: 'Cookie cream', price: 40000, imageUrl: image('Cookie+cream') },
  { name: 'Choco cream', price: 40000, imageUrl: image('Choco+cream') },
  { name: 'Matcha cream', price: 40000, imageUrl: image('Matcha+cream') },
];

async function main() {
  // Chạy lại nhiều lần vẫn an toàn: món có rồi thì chỉ cập nhật giá và ảnh (giữ nguyên tồn kho),
  // chưa có thì tạo mới; mã khuyến mãi dùng upsert.
  // Món cũ không còn trong menu bị xoá, trừ món đã có đơn hàng (khoá ngoại không cho xoá).
  await prisma.product.deleteMany({
    where: { name: { notIn: menu.map((m) => m.name) }, orderItems: { none: {} } },
  });

  for (const item of menu) {
    const found = await prisma.product.findFirst({ where: { name: item.name } });
    if (found) {
      await prisma.product.update({ where: { id: found.id }, data: item });
    } else {
      await prisma.product.create({ data: { ...item, stock: 50 } });
    }
  }

  await prisma.promotion.upsert({
    where: { code: 'BREW10' },
    update: {},
    create: { code: 'BREW10', discountPercent: 10, expiresAt: new Date('2030-12-31') },
  });
}

main().finally(() => prisma.$disconnect());
