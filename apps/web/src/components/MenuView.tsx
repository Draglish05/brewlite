'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CATEGORIES, categoryOf } from '@/lib/categories';
import type { Product } from '@/lib/products';
import { useUi } from '@/store/ui';

export default function MenuView({ products }: { products: Product[] }) {
  const [category, setCategory] = useState('all');
  const menuOpen = useUi((state) => state.menuOpen);
  const setMenuOpen = useUi((state) => state.setMenuOpen);

  // Màn hình nhỏ: bảng danh mục nằm đè lên lưới nên mặc định đóng
  useEffect(() => {
    if (window.innerWidth < 640) {
      setMenuOpen(false);
    }
  }, [setMenuOpen]);

  const items = [
    { key: 'all', label: 'Tất cả', count: products.length },
    ...CATEGORIES.map((item) => ({
      key: item.key,
      label: item.label,
      count: products.filter((product) => categoryOf(product.name) === item.key).length,
    })),
  ].filter((item) => item.count > 0);

  const shown =
    category === 'all'
      ? products
      : products.filter((product) => categoryOf(product.name) === category);
  const title = items.find((item) => item.key === category)?.label ?? 'Tất cả';

  function chooseCategory(key: string) {
    setCategory(key);
    if (window.innerWidth < 640) {
      setMenuOpen(false);
    }
  }

  return (
    <div className="relative">
      <div
        className={`sm:grid sm:transition-[grid-template-columns] sm:duration-300 sm:ease-out ${
          menuOpen ? 'sm:grid-cols-[16rem_minmax(0,1fr)]' : 'sm:grid-cols-[0rem_minmax(0,1fr)]'
        }`}
      >
        <aside
          className={`z-10 bg-background max-sm:absolute max-sm:inset-y-0 max-sm:left-0 max-sm:shadow-lg sm:overflow-hidden ${
            menuOpen ? '' : 'max-sm:hidden'
          }`}
        >
          <nav className="h-full w-50 border-r border-foreground/10 p-3">
            <p className="mb-2 px-3 text-sm text-foreground/60">Danh mục</p>
            {items.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => chooseCategory(item.key)}
                className={`mb-1 flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors ${
                  category === item.key
                    ? 'bg-foreground/10 font-medium'
                    : 'hover:bg-foreground/5'
                }`}
              >
                <span>{item.label}</span>
                <span className="text-sm font-normal text-foreground/50">{item.count}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="mx-auto min-w-0 max-w-6xl p-4">
          <h1 className="mb-4 text-2xl font-bold">{title}</h1>
          <ul key={category} className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {shown.map((product, index) => (
              <li key={product.id} className="card-in" style={{ animationDelay: `${index * 30}ms` }}>
                <Link
                  href={`/products/${product.id}`}
                  className="block overflow-hidden rounded-xl bg-background shadow-md ring-1 ring-foreground/10 transition duration-200 hover:-translate-y-1 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-foreground"
                >
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="aspect-square w-full object-cover"
                  />
                  <div className="p-3">
                    <p className="truncate font-medium">{product.name}</p>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="font-semibold">
                        {product.price.toLocaleString('vi-VN')}đ
                      </span>
                      <span
                        aria-hidden="true"
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-lg leading-none text-background"
                      >
                        +
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </main>
      </div>
    </div>
  );
}
