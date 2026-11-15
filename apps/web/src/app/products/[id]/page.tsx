import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import ProductOptions from '@/components/ProductOptions';
import { getProduct } from '@/lib/products';

type Params = Promise<{ id: string }>;

async function ProductDetail({ params }: { params: Params }) {
  const { id } = await params;
  const product = await getProduct(id);

  if (product === null) {
    notFound();
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <img
          src={product.imageUrl}
          alt={product.name}
          className="aspect-square w-full rounded-xl object-cover"
        />
        <h1 className="mt-4 text-2xl font-bold">{product.name}</h1>
      </div>
      <ProductOptions product={product} />
    </div>
  );
}

export default function ProductPage({ params }: { params: Params }) {
  return (
    <main className="mx-auto w-full max-w-4xl p-4">
      <Suspense fallback={<p>Đang tải sản phẩm...</p>}>
        <ProductDetail params={params} />
      </Suspense>
    </main>
  );
}
