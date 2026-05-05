import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, ArrowRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-primary text-gray-300 mt-20 border-t-4 border-accent">
      {/* Newsletter Section */}
      <div className="border-b border-gray-800">
        <div className="container-shop py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-md text-center md:text-left">
            <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-2">Đăng ký nhận tin</h3>
            <p className="text-sm text-gray-400">Nhận thông tin về bộ sưu tập mới và ưu đãi đặc biệt từ VELORA.</p>
          </div>
          <div className="flex w-full md:w-auto max-w-md">
            <input 
              type="email" 
              placeholder="Nhập email của bạn..." 
              className="flex-1 bg-gray-900 border border-gray-700 px-4 py-3 text-sm text-white focus:outline-none focus:border-white transition-colors"
            />
            <button className="bg-white text-primary px-6 py-3 text-sm font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors flex items-center gap-2">
              Đăng ký <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="container-shop py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand & Contact */}
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight mb-6">VELORA</h2>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="mt-1 flex-shrink-0 text-white" />
                <span>123 Đường Thời Trang, Quận 1, TP.HCM</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="flex-shrink-0 text-white" />
                <a href="tel:1800123456" className="hover:text-white transition-colors font-medium text-white">1800 123 456</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="flex-shrink-0 text-white" />
                <a href="mailto:hello@velora.vn" className="hover:text-white transition-colors">hello@velora.vn</a>
              </li>
            </ul>
            <div className="flex gap-4 mt-8">
              <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 hover:bg-white hover:text-primary transition-colors text-xs font-bold">
                FB
              </a>
              <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 hover:bg-white hover:text-primary transition-colors text-xs font-bold">
                IG
              </a>
              <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 hover:bg-white hover:text-primary transition-colors text-xs font-bold">
                YT
              </a>
            </div>
          </div>

          {/* About */}
          <div>
            <h3 className="text-white font-bold uppercase tracking-widest text-sm mb-6 relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-10 after:h-0.5 after:bg-accent">Về chúng tôi</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link to="#" className="hover:text-white hover:translate-x-1 inline-block transition-transform">Giới thiệu thương hiệu</Link></li>
              <li><Link to="#" className="hover:text-white hover:translate-x-1 inline-block transition-transform">Hệ thống cửa hàng</Link></li>
              <li><Link to="#" className="hover:text-white hover:translate-x-1 inline-block transition-transform">Tuyển dụng</Link></li>
              <li><Link to="#" className="hover:text-white hover:translate-x-1 inline-block transition-transform">Tin tức thời trang</Link></li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-white font-bold uppercase tracking-widest text-sm mb-6 relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-10 after:h-0.5 after:bg-accent">Chính sách</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link to="#" className="hover:text-white hover:translate-x-1 inline-block transition-transform">Chính sách đổi trả</Link></li>
              <li><Link to="#" className="hover:text-white hover:translate-x-1 inline-block transition-transform">Chính sách bảo mật</Link></li>
              <li><Link to="#" className="hover:text-white hover:translate-x-1 inline-block transition-transform">Chính sách giao hàng</Link></li>
              <li><Link to="#" className="hover:text-white hover:translate-x-1 inline-block transition-transform">Điều khoản dịch vụ</Link></li>
              <li><Link to="#" className="hover:text-white hover:translate-x-1 inline-block transition-transform">Hướng dẫn chọn size</Link></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h3 className="text-white font-bold uppercase tracking-widest text-sm mb-6 relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-10 after:h-0.5 after:bg-accent">Hỗ trợ khách hàng</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link to="/products" className="hover:text-white hover:translate-x-1 inline-block transition-transform">Sản phẩm mới</Link></li>
              <li><Link to="/products?search=sale" className="hover:text-white hover:translate-x-1 inline-block transition-transform">Sale & Ưu đãi</Link></li>
              <li><Link to="/orders" className="hover:text-white hover:translate-x-1 inline-block transition-transform">Kiểm tra đơn hàng</Link></li>
              <li><Link to="/profile" className="hover:text-white hover:translate-x-1 inline-block transition-transform">Tài khoản của tôi</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border-t border-gray-800">
        <div className="container-shop py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500 font-medium">
          <p>© {new Date().getFullYear()} VELORA MENSWEAR. All rights reserved.</p>
          <div className="flex gap-4">
            <span>Thanh toán an toàn qua</span>
            <div className="flex gap-2 text-gray-400">
              {/* Payment Method placeholders */}
              <span className="font-bold">VISA</span>
              <span className="font-bold">MASTERCARD</span>
              <span className="font-bold">JCB</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
