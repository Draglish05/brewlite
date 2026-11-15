'use client';

import { useState } from 'react';
import { SIZES, TOPPINGS } from '@/lib/options';
import type { Product } from '@/lib/products';
import { useCart } from '@/store/cart';

export default function ProductOptions({ product }: { product: Product }) {
  const [size, setSize] = useState(SIZES[0]);
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const addItem = useCart((state) => state.addItem);

  function toggleTopping(name: string) {
    if (selectedToppings.includes(name)) {
      setSelectedToppings(selectedToppings.filter((t) => t !== name));
    } else {
      setSelectedToppings([...selectedToppings, name]);
    }
  }

  let total = product.price + size.extra;
  for (const topping of TOPPINGS) {
    if (selectedToppings.includes(topping.name)) {
      total += topping.extra;
    }
  }

  return (
    <div className="flex flex-col justify-between gap-6 rounded-xl bg-background p-6 shadow-md ring-1 ring-foreground/10">
      <div>
        <fieldset className="mb-6">
          <legend className="text-lg font-semibold">Size</legend>
          <div className="mt-3 flex flex-wrap gap-6">
            {SIZES.map((s) => (
              <label key={s.name} className="flex items-center gap-2 text-lg">
                <input
                  type="radio"
                  name="size"
                  checked={size.name === s.name}
                  onChange={() => setSize(s)}
                  className="h-4 w-4 accent-olive"
                />
                {s.name}
                {s.extra > 0 && ` (+${s.extra.toLocaleString('vi-VN')}đ)`}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-lg font-semibold">Topping</legend>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-3">
            {TOPPINGS.map((t) => (
              <label key={t.name} className="flex items-center gap-2 text-lg">
                <input
                  type="checkbox"
                  checked={selectedToppings.includes(t.name)}
                  onChange={() => toggleTopping(t.name)}
                  className="h-4 w-4 accent-olive"
                />
                {t.name} (+{t.extra.toLocaleString('vi-VN')}đ)
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div>
        <p className="text-xl font-bold">Giá: {total.toLocaleString('vi-VN')}đ</p>

        <button
          onClick={() =>
            addItem({
              productId: product.id,
              name: product.name,
              size: size.name,
              toppings: selectedToppings,
              unitPrice: total,
            })
          }
          className="mt-4 w-full rounded bg-olive px-4 py-3 text-white transition-colors hover:bg-terracotta"
        >
          Thêm vào giỏ
        </button>
      </div>
    </div>
  );
}
