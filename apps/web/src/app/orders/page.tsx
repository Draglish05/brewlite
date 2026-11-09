'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getErrorMessage, getJson } from '@/lib/api';
import { STATUS_LABEL } from '@/lib/orders';
import type { Order } from '@/lib/orders';
import { useHydrated } from '@/lib/useHydrated';
import { useAuth } from '@/store/auth';

export default function OrderHistoryPage() {
  const hydrated = useHydrated();
  const token = useAuth((state) => state.token);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token === '') {
      return;
    }
    getJson('/orders/me', { token })
      .then(({ ok, data }) => {
        if (ok) {
          setOrders(data);
        } else {
          setError(getErrorMessage(data));
        }
      })
      .catch(() => setError('Không kết nối được máy chủ'));
  }, [token]);

  if (hydrated === false) {
    return <p className="p-4 text-center">Đang tải...</p>;
  }
  if (token === '') {
    return (
      <div className="p-4 text-center">
        <p className="mb-2">Bạn cần đăng nhập để xem lịch sử đơn.</p>
        <Link href="/login" className="underline">
          Đăng nhập
        </Link>
      </div>
    );
  }
  if (error !== '') {
    return <p className="p-4 text-center text-red-600">{error}</p>;
  }
  if (orders === null) {
    return <p className="p-4 text-center">Đang tải lịch sử đơn...</p>;
  }
  if (orders.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="mb-2">Bạn chưa có đơn hàng nào.</p>
        <Link href="/" className="underline">
          Xem menu
        </Link>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-md p-4">
      <h1 className="mb-4 text-2xl font-bold">Lịch sử đơn hàng</h1>
      <ul>
        {orders.map((order) => (
          <li key={order.id} className="mb-2 rounded border p-3">
            <Link href={`/orders/${order.id}`} className="block">
              <p className="font-semibold">Đơn #{order.id}</p>
              <p>{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
              <p>
                {STATUS_LABEL[order.status] ?? order.status} -{' '}
                {order.total.toLocaleString('vi-VN')}đ
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
