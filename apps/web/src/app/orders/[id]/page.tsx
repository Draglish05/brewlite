'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getErrorMessage, getJson, postJson } from '@/lib/api';
import { STATUS_LABEL } from '@/lib/orders';
import type { Order } from '@/lib/orders';
import { useHydrated } from '@/lib/useHydrated';
import { useAuth } from '@/store/auth';

export default function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const hydrated = useHydrated();
  const token = useAuth((state) => state.token);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token === '') {
      return;
    }
    getJson(`/orders/${id}`, { token })
      .then(({ ok, data }) => {
        if (ok) {
          setOrder(data);
        } else {
          setError(getErrorMessage(data));
        }
      })
      .catch(() => setError('Không kết nối được máy chủ'));
  }, [id, token]);

  async function handleCancel() {
    try {
      const { ok, data } = await postJson(`/orders/${id}/cancel`, {}, { token });
      if (ok) {
        setOrder(data);
      } else {
        setError(getErrorMessage(data));
      }
    } catch {
      setError('Không kết nối được máy chủ');
    }
  }

  if (hydrated === false) {
    return <p className="p-4 text-center">Đang tải...</p>;
  }
  if (token === '') {
    return (
      <div className="p-4 text-center">
        <p className="mb-2">Bạn cần đăng nhập để xem đơn hàng.</p>
        <Link href="/login" className="underline">
          Đăng nhập
        </Link>
      </div>
    );
  }
  if (error !== '') {
    return <p className="p-4 text-center text-red-600">{error}</p>;
  }
  if (order === null) {
    return <p className="p-4 text-center">Đang tải đơn hàng...</p>;
  }

  const paid = order.status === 'PAID';
  // Khớp với máy trạng thái ở API: hủy được khi PENDING, PAYMENT_FAILED hoặc PAID
  const canCancel = ['PENDING', 'PAYMENT_FAILED', 'PAID'].includes(order.status);

  return (
    <main className="mx-auto max-w-md p-4">
      <h1 className="mb-1 text-2xl font-bold">
        {paid ? 'Đặt hàng thành công' : 'Đơn hàng'}
      </h1>
      <p>Mã đơn: #{order.id}</p>
      <p className="mb-4">
        Trạng thái: {order.status} ({STATUS_LABEL[order.status] ?? order.status})
      </p>
      {paid && <p className="mb-4">Mời bạn tới quầy lấy nước.</p>}

      <ul className="mb-4">
        {order.items.map((item) => (
          <li key={item.id} className="mb-2 rounded border p-2">
            <p className="font-semibold">
              {item.product.name} ({item.size}) x{item.qty}
            </p>
            {item.toppings.length > 0 && <p>Topping: {item.toppings.join(', ')}</p>}
            <p>{item.lineTotal.toLocaleString('vi-VN')}đ</p>
          </li>
        ))}
      </ul>
      {order.discount > 0 && (
        <p>
          Tạm tính: {order.subtotal.toLocaleString('vi-VN')}đ, giảm giá: -
          {order.discount.toLocaleString('vi-VN')}đ
        </p>
      )}
      <p className="mb-4 text-xl font-bold">Tổng: {order.total.toLocaleString('vi-VN')}đ</p>

      {canCancel && (
        <button onClick={handleCancel} className="mb-4 mr-4 rounded border px-4 py-2">
          Hủy đơn
        </button>
      )}
      <Link href="/" className="underline">
        Về trang chủ
      </Link>
    </main>
  );
}
