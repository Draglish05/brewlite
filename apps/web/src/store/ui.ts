import { create } from 'zustand';

// Trạng thái đóng/mở bảng danh mục ở trang menu (nút ba gạch nằm ở thanh tiêu đề)
type UiState = {
  menuOpen: boolean;
  toggleMenu: () => void;
  setMenuOpen: (open: boolean) => void;
};

export const useUi = create<UiState>((set) => ({
  menuOpen: true,
  toggleMenu: () => set((state) => ({ menuOpen: !state.menuOpen })),
  setMenuOpen: (open) => set({ menuOpen: open }),
}));
