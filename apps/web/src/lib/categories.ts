// Database chưa có cột nhóm món, nên nhóm được khai báo ở đây theo tên món.
// Thêm món mới vào seed thì nhớ thêm tên vào nhóm tương ứng (món chưa có nhóm chỉ hiện ở "Tất cả").
export const CATEGORIES = [
  {
    key: 'coffee',
    label: 'Cà phê',
    names: ['Cà phê đen', 'Cà phê sữa', 'Bạc xỉu', 'Cà phê muối', 'Americano'],
  },
  { key: 'latte', label: 'Latte', names: ['Ice latte', 'Chocolate', 'Matcha latte'] },
  {
    key: 'tea',
    label: 'Trà',
    names: ['Trà đào', 'Trà ổi', 'Trà mãng cầu', 'Trà kiwi', 'Trà sữa'],
  },
  { key: 'cream', label: 'Cream', names: ['Cookie cream', 'Choco cream', 'Matcha cream'] },
];

export function categoryOf(name: string) {
  return CATEGORIES.find((category) => category.names.includes(name))?.key ?? 'other';
}
