'use client';

import Link from 'next/link';
import { useHydrated } from '@/lib/useHydrated';
import { useCart } from '@/store/cart';

export default function CartPage() {
  const hydrated = useHydrated();
  const items = useCart((state) => state.items);
  const setQty = useCart((state) => state.setQty);
  const removeItem = useCart((state) => state.removeItem);

  if (hydrated === false) {
    return <p className="p-4 text-center">Đang tải giỏ hàng...</p>;
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
    <main className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Giỏ hàng</h1>
      <ul>
        {items.map((item) => (
          <li key={item.key} className="mb-3 rounded-lg border p-3">
            <p className="font-semibold">
              {item.name} ({item.size})
            </p>
            {item.toppings.length > 0 && <p>Topping: {item.toppings.join(', ')}</p>}
            <p>{item.unitPrice.toLocaleString('vi-VN')}đ</p>
            <div className="mt-2 flex items-center gap-3">
              <button
                onClick={() =>
                  item.qty > 1 ? setQty(item.key, item.qty - 1) : removeItem(item.key)
                }
                className="rounded border px-3"
              >
                -
              </button>
              <span>{item.qty}</span>
              <button
                onClick={() => setQty(item.key, item.qty + 1)}
                className="rounded border px-3"
              >
                +
              </button>
              <button onClick={() => removeItem(item.key)} className="ml-auto underline">
                Xóa
              </button>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xl font-bold">Tổng: {total.toLocaleString('vi-VN')}đ</p>
      <Link
        href="/checkout"
        className="mt-4 inline-block rounded bg-black px-4 py-2 text-white"
      >
        Thanh toán
      </Link>
    </main>
  );
}
