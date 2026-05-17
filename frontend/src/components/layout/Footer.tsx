import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';

const FOOTER_COLUMNS = [
  {
    title: 'Công ty',
    links: ['Giới thiệu', 'Tính năng', 'Hoạt động', 'Tuyển dụng'],
  },
  {
    title: 'Trợ giúp',
    links: ['Hỗ trợ khách hàng', 'Chi tiết giao hàng', 'Điều khoản', 'Chính sách bảo mật'],
  },
  {
    title: 'Hỏi đáp',
    links: ['Tài khoản', 'Quản lý giao hàng', 'Đơn hàng', 'Thanh toán'],
  },
  {
    title: 'Tài nguyên',
    links: ['Ebooks miễn phí', 'Hướng dẫn phát triển', 'Cách viết blog', 'Danh sách Youtube'],
  },
];

export default function Footer() {
  return (
    <footer className="mt-24 md:mt-32 bg-[#F0F0F0] text-black/60">
      <div className="container-shop">
        <div className="-translate-y-1/2 rounded-lg bg-primary px-6 py-8 text-white md:px-16 md:py-9">
          <div className="grid gap-7 md:grid-cols-[1fr_350px] md:items-center lg:grid-cols-[1fr_420px]">
            <h2 className="max-w-[560px] text-3xl font-black leading-tight md:text-[40px]">
              NHẬN THÔNG TIN MỚI NHẤT VỀ CÁC ƯU ĐÃI
            </h2>
            <form className="space-y-3">
              <div className="relative">
                <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" />
                <input
                  type="email"
                  placeholder="Nhập địa chỉ email của bạn"
                  className="h-12 w-full rounded-full bg-white pl-12 pr-5 text-sm text-primary placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-white/40"
                />
              </div>
              <button
                type="submit"
                className="h-12 w-full rounded-full bg-white px-5 text-sm font-medium text-primary transition-colors hover:bg-white/90"
              >
                Đăng ký nhận tin
              </button>
            </form>
          </div>
        </div>

        <div className="-mt-16 grid gap-10 border-b border-black/10 pb-12 pt-4 md:grid-cols-[1.2fr_repeat(2,1fr)] lg:grid-cols-[1.5fr_repeat(4,1fr)]">
          <div className="max-w-[260px]">
            <Link to="/" className="text-3xl font-black tracking-[-0.03em] text-primary">
              SHOP.CO
            </Link>
            <p className="mt-5 text-sm leading-6">
              Chúng tôi mang đến những bộ trang phục phù hợp với phong cách và giúp bạn tự tin. Dành cho cả nam và nữ.
            </p>
            <div className="mt-7 flex gap-3">
              {['X', 'FB', 'IG', 'GH'].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-black/20 bg-white text-[10px] font-bold text-primary transition-colors hover:bg-primary hover:text-white"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-primary">{column.title}</h3>
              <ul className="mt-5 space-y-4 text-sm">
                {column.links.map((link) => (
                  <li key={link}>
                    <Link to="/products" className="transition-colors hover:text-primary">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 py-6 text-sm md:flex-row">
          <p>Shop.co © 2000-2026, Bảo lưu mọi quyền</p>
          <div className="flex gap-3">
            {['VISA', 'MC', 'PAYPAL', 'APPLE', 'GPAY'].map((method) => (
              <span key={method} className="rounded border border-black/10 bg-white px-3 py-1 text-xs font-bold text-primary shadow-sm">
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
