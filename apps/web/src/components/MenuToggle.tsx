'use client';

import { usePathname } from 'next/navigation';
import { useUi } from '@/store/ui';

// Nút ba gạch trên thanh tiêu đề, chỉ hiện ở trang menu
export default function MenuToggle() {
  const pathname = usePathname();
  const menuOpen = useUi((state) => state.menuOpen);
  const toggleMenu = useUi((state) => state.toggleMenu);

  if (pathname !== '/') {
    return null;
  }

  return (
    <button
      type="button"
      onClick={toggleMenu}
      aria-label="Đóng hoặc mở danh mục"
      aria-expanded={menuOpen}
      className="mr-1 rounded-md p-2 hover:bg-foreground/10 sm:mr-3"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-8 w-8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );
}
