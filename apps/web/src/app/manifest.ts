import type { MetadataRoute } from 'next';

// Thông tin để cài BrewLite lên màn hình chính điện thoại (PWA)
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BrewLite',
    short_name: 'BrewLite',
    description: 'Đặt đồ uống không dùng tiền mặt',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
