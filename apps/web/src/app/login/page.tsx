'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { getErrorMessage, postJson } from '@/lib/api';
import { useAuth } from '@/store/auth';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuth((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');

    try {
      const { ok, data } = await postJson('/auth/login', { email, password });
      if (ok === false) {
        setError(getErrorMessage(data));
        return;
      }
      login(data.accessToken, email);
      router.push('/');
    } catch {
      setError('Không kết nối được máy chủ');
    }
  }

  return (
    <main className="mx-auto max-w-[400px] p-4">
      <h1 className="mb-4 text-2xl font-bold">Đăng nhập</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded border p-2 focus:outline-none focus:ring-2 focus:ring-terracotta"
          required
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded border p-2 focus:outline-none focus:ring-2 focus:ring-terracotta"
          required
        />
        {error !== '' && <p className="text-red-600">{error}</p>}
        <button type="submit" className="rounded bg-olive px-4 py-2 text-white transition-colors hover:bg-terracotta">
          Đăng nhập
        </button>
      </form>
      <p className="mt-10">
        Chưa có tài khoản?{' '}
        <Link href="/register" className="text-terracotta underline">
          Đăng ký
        </Link>
      </p>
    </main>
  );
}
