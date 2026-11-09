'use client';

import Link from 'next/link';
import { useHydrated } from '@/lib/useHydrated';
import { useAuth } from '@/store/auth';

export default function AuthLink() {
  const hydrated = useHydrated();
  const email = useAuth((state) => state.email);
  const logout = useAuth((state) => state.logout);

  if (hydrated === false || email === '') {
    return <Link href="/login">Đăng nhập</Link>;
  }

  return (
    <span>
      <Link href="/orders" className="mr-3">
        Đơn hàng
      </Link>
      {email}{' '}
      <button onClick={logout} className="underline">
        Đăng xuất
      </button>
    </span>
  );
}
