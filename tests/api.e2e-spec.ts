import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../apps/api/src/app.module';
import { PrismaService } from '../apps/api/src/prisma/prisma.service';

// Các test này chạy trên database thật (brewlite_test), không dùng mock.
describe('API (tích hợp, database thật)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let server: ReturnType<INestApplication['getHttpServer']>;
  let counter = 0;
  // Database test giữ dữ liệu giữa các lần chạy, nên key phải khác nhau mỗi lần chạy
  const runId = Date.now();
  const key = (name: string) => `${name}-${runId}`;

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    prisma = app.get(PrismaService);
    server = app.getHttpServer();
    server.setMaxListeners(50); // test gửi nhiều yêu cầu song song
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prisma.product.updateMany({ data: { stock: 50 } });
  });

  async function newUser() {
    const email = `e2e${Date.now()}${counter++}@example.com`;
    await request(server)
      .post('/auth/register')
      .send({ email, password: 'matkhau123' })
      .expect(201);
    const login = await request(server)
      .post('/auth/login')
      .send({ email, password: 'matkhau123' })
      .expect(200);
    return { email, token: login.body.accessToken as string };
  }

  function createOrder(
    token: string,
    productId: number,
    qty = 1,
    extra: { size?: string; toppings?: string[]; promoCode?: string } = {},
  ) {
    return request(server)
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [
          {
            productId,
            size: extra.size ?? 'S',
            toppings: extra.toppings ?? [],
            qty,
          },
        ],
        promoCode: extra.promoCode,
      });
  }

  function pay(token: string, orderId: number, key: string, simulateFail = false) {
    return request(server)
      .post('/payments')
      .set('Authorization', `Bearer ${token}`)
      .set('Idempotency-Key', key)
      .send({ orderId, method: 'WALLET', simulateFail });
  }

  async function productByName(name: string) {
    return prisma.product.findFirstOrThrow({ where: { name } });
  }

  describe('GET /health', () => {
    it('trả về 200 khi API và database hoạt động', async () => {
      const res = await request(server).get('/health').expect(200);

      expect(res.body).toEqual({ status: 'ok', database: 'up' });
    });
  });

  describe('luồng end-to-end: menu, đặt đơn, thanh toán, xác nhận', () => {
    it('đi hết luồng và có khuyến mãi, điểm thưởng, lịch sử đơn', async () => {
      // 1. Xem menu và chi tiết sản phẩm
      const menu = await request(server).get('/products').expect(200);
      expect(menu.body.length).toBeGreaterThanOrEqual(6);
      const cappuccino = await productByName('Cappuccino');
      await request(server).get(`/products/${cappuccino.id}`).expect(200);
      await request(server).get('/products/999999').expect(404);

      // 2. Đăng ký, đăng nhập, đặt đơn có mã BREW10
      const { token } = await newUser();
      const created = await createOrder(token, cappuccino.id, 2, {
        size: 'L',
        toppings: ['Kem'],
        promoCode: 'BREW10',
      }).expect(201);
      expect(created.body.status).toBe('PENDING');
      expect(created.body.subtotal).toBe(120000); // (45000 + 10000 + 5000) x 2
      expect(created.body.discount).toBe(12000);
      expect(created.body.total).toBe(108000);

      // 3. Thanh toán
      const paid = await pay(token, created.body.id, key('flow')).expect(200);
      expect(paid.body.status).toBe('PAID');
      expect(paid.body.amount).toBe(108000);

      // 4. Màn hình xác nhận và lịch sử đơn
      const confirmation = await request(server)
        .get(`/orders/${created.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(confirmation.body.status).toBe('PAID');
      expect(confirmation.body.items[0].product.name).toBe('Cappuccino');

      const history = await request(server)
        .get('/orders/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(history.body.map((o: { id: number }) => o.id)).toContain(created.body.id);

      // 5. Tồn kho đã trừ, điểm thưởng đã cộng (108.000đ được 10 điểm)
      const after = await productByName('Cappuccino');
      expect(after.stock).toBe(48);
      const me = await request(server)
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(me.body.loyaltyPoints).toBe(10);
    });

    it('chặn đặt đơn khi chưa đăng nhập và khi dữ liệu sai', async () => {
      const product = await productByName('Americano');
      await request(server)
        .post('/orders')
        .send({ items: [{ productId: product.id, size: 'S', toppings: [], qty: 1 }] })
        .expect(401);

      const { token } = await newUser();
      await request(server)
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({ items: [] })
        .expect(400);
      await createOrder(token, product.id, 1, { promoCode: 'KHONGCO' }).expect(400);
    });

    it('không xem được đơn của người khác', async () => {
      const product = await productByName('Americano');
      const owner = await newUser();
      const stranger = await newUser();
      const order = await createOrder(owner.token, product.id).expect(201);

      await request(server)
        .get(`/orders/${order.body.id}`)
        .set('Authorization', `Bearer ${stranger.token}`)
        .expect(404);
    });
  });

  describe('Task 10 (a): chặn chuyển trạng thái sai', () => {
    it('không thanh toán lại đơn đã PAID, không hủy hai lần, không thanh toán đơn đã hủy', async () => {
      const product = await productByName('Cà phê sữa');
      const { token } = await newUser();
      const order = await createOrder(token, product.id, 2).expect(201);
      expect((await productByName('Cà phê sữa')).stock).toBe(48);

      await pay(token, order.body.id, key('a1')).expect(200);
      // PAID -> PAID: không hợp lệ
      await pay(token, order.body.id, key('a2')).expect(409);

      // PAID -> CANCELLED hợp lệ và hoàn lại tồn kho
      const cancelled = await request(server)
        .post(`/orders/${order.body.id}/cancel`)
        .set('Authorization', `Bearer ${token}`)
        .expect(201);
      expect(cancelled.body.status).toBe('CANCELLED');
      expect((await productByName('Cà phê sữa')).stock).toBe(50);

      // CANCELLED là trạng thái kết thúc: không hủy lại, không thanh toán
      await request(server)
        .post(`/orders/${order.body.id}/cancel`)
        .set('Authorization', `Bearer ${token}`)
        .expect(409);
      await pay(token, order.body.id, key('a3')).expect(409);
    });

    it('thanh toán lỗi thì PAYMENT_FAILED, thử lại với key mới thì thành PAID', async () => {
      const product = await productByName('Trà đào');
      const { token } = await newUser();
      const order = await createOrder(token, product.id).expect(201);

      await pay(token, order.body.id, key('f1'), true).expect(402);
      const failed = await request(server)
        .get(`/orders/${order.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(failed.body.status).toBe('PAYMENT_FAILED');

      await pay(token, order.body.id, key('f2')).expect(200);
      const retried = await request(server)
        .get(`/orders/${order.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(retried.body.status).toBe('PAID');
    });
  });

  describe('Task 10 (b): cùng Idempotency-Key chỉ tạo một thanh toán', () => {
    it('gửi hai lần tuần tự cùng key thì chỉ có một Payment và điểm chỉ cộng một lần', async () => {
      const product = await productByName('Bạc xỉu');
      const { token, email } = await newUser();
      const order = await createOrder(token, product.id, 3).expect(201); // 114.000đ

      const first = await pay(token, order.body.id, key('idem')).expect(200);
      const second = await pay(token, order.body.id, key('idem')).expect(200);

      expect(second.body.paymentId).toBe(first.body.paymentId);
      const payments = await prisma.payment.count({
        where: { idempotencyKey: key('idem') },
      });
      expect(payments).toBe(1);
      const user = await prisma.user.findUniqueOrThrow({ where: { email } });
      expect(user.loyaltyPoints).toBe(11); // 114.000đ -> 11 điểm, đúng một lần
    });

    it('gửi 5 yêu cầu cùng key đồng thời vẫn chỉ có một Payment', async () => {
      const product = await productByName('Trà vải');
      const { token } = await newUser();
      const order = await createOrder(token, product.id).expect(201);

      const results = await Promise.all(
        Array.from({ length: 5 }, () => pay(token, order.body.id, key('idem-parallel'))),
      );

      for (const res of results) {
        expect(res.status).toBe(200);
      }
      const payments = await prisma.payment.count({
        where: { idempotencyKey: key('idem-parallel') },
      });
      expect(payments).toBe(1);
    });
  });

  describe('Task 10 (c): đặt đồng thời không vượt tồn kho', () => {
    it('10 yêu cầu cùng lúc khi kho còn 5 thì đúng 5 thành công, kho về 0', async () => {
      const product = await productByName('Americano');
      await prisma.product.update({ where: { id: product.id }, data: { stock: 5 } });
      const { token } = await newUser();

      const results = await Promise.all(
        Array.from({ length: 10 }, () => createOrder(token, product.id, 1)),
      );

      const success = results.filter((r) => r.status === 201).length;
      const soldOut = results.filter((r) => r.status === 409).length;
      expect(success).toBe(5);
      expect(soldOut).toBe(5);
      expect((await productByName('Americano')).stock).toBe(0);
    });
  });
});
