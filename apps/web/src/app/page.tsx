import MenuView from '@/components/MenuView';
import { getProducts } from '@/lib/products';

export default async function MenuPage() {
  const products = await getProducts();

  if (products.length === 0) {
    return <p className="p-4 text-center">Menu đang trống</p>;
  }

  return <MenuView products={products} />;
}
