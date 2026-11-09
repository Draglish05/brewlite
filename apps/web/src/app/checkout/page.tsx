'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getErrorMessage, postJson } from '@/lib/api';
import { useHydrated } from '@/lib/useHydrated';
import { useAuth } from '@/store/auth';
import { useCart } from '@/store/cart';

export default function CheckoutPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const token = useAuth((state) => state.token);
  const items = useCart((state) => state.items);
  const clear = useCart((state) => state.clear);

  const [method, setMethod] = useState<'WALLET' | 'CARD'>('WALLET');
  const [simulateFail, setSimulateFail] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handlePay() {
    setError('');
    setLoading(true);

    try {
      // Đơn chỉ tạo một lần. Nếu thanh toán lỗi thì thử lại trên cùng đơn đó,
      // để không trừ tồn kho thêm lần nữa.
      let id = orderId;
      if (id === null) {
        const created = await postJson(
          '/orders',
          {
            items: items.map((i) => ({
              productId: i.productId,
              size: i.size,
              toppings: i.toppings,
              qty: i.qty,
            })),
          },
          { token },
        );
        if (created.ok === false) {
          setError(getErrorMessage(created.data));
          return;
        }
        id = created.data.id as number;
        setOrderId(id);
      }

      const paid = await postJson(
        '/payments',
        { orderId: id, method, simulateFail },
        { token, headers: { 'Idempotency-Key': crypto.randomUUID() } },
      );
      if (paid.ok === false) {
        setError(
          getErrorMessage(paid.data) + '. Giỏ hàng được giữ nguyên, bạn có thể thử lại.',
        );
        return;
      }

      setDone(true);
      clear();
      router.push(`/orders/${id}`);
    } catch {
      setError('Không kết nối được máy chủ');
    } finally {
      setLoading(false);
    }
  }

  if (hydrated === false || done) {
    return <p className="p-4 text-center">Đang xử lý...</p>;
  }

  if (token === '') {
    return (
      <div className="p-4 text-center">
        <p className="mb-2">Bạn cần đăng nhập để thanh toán.</p>
        <Link href="/login" className="underline">
          Đăng nhập
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="mb-2">Giỏ hàng trống</p>
        <Link href="/" className="underline">
          Xem menu
        </Link>
      </div>
    );
  }

  let total = 0;
  for (const item of items) {
    total += item.unitPrice * item.qty;
  }

  return (
    <main className="mx-auto max-w-md p-4">
      <h1 className="mb-4 text-2xl font-bold">Thanh toán</h1>
      <p className="mb-4 text-xl font-bold">Tổng: {total.toLocaleString('vi-VN')}đ</p>

      <fieldset className="mb-4">
        <legend className="mb-1 font-semibold">Phương thức (không dùng tiền mặt)</legend>
        <label className="mr-4">
          <input
            type="radio"
            name="method"
            checked={method === 'WALLET'}
            onChange={() => setMethod('WALLET')}
          />{' '}
          Ví điện tử
        </label>
        <label>
          <input
            type="radio"
            name="method"
            checked={method === 'CARD'}
            onChange={() => setMethod('CARD')}
          />{' '}
          Thẻ ngân hàng
        </label>
      </fieldset>

      <label className="mb-4 block text-sm">
        <input
          type="checkbox"
          checked={simulateFail}
          onChange={(e) => setSimulateFail(e.target.checked)}
        />{' '}
        Giả lập thanh toán lỗi (cổng thanh toán mô phỏng, dùng để thử)
      </label>

      {error !== '' && <p className="mb-3 text-red-600">{error}</p>}

      <button
        onClick={handlePay}
        disabled={loading}
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {loading
          ? 'Đang thanh toán...'
          : orderId === null
            ? 'Xác nhận trả'
            : 'Thử thanh toán lại'}
      </button>
    </main>
  );
}
