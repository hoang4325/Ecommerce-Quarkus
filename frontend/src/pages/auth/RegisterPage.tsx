import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Mail, ShoppingBag, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { authService } from '../../auth/authService';
import type { RegisterRequest } from '../../types';

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterRequest>({ firstName: '', lastName: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const set = (k: keyof RegisterRequest) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authService.register(form);
      navigate('/login?registered=1');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string; errors?: { message: string }[] } } };
      const errData = axiosErr.response?.data;
      if (errData?.errors?.length) {
        setError(errData.errors.map(e => e.message).join(', '));
      } else {
        setError(errData?.message ?? 'Đăng ký thất bại. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F2F0F1]">
      <div className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
        <section className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="w-full max-w-[520px]"
          >
            <div className="mb-8 flex items-center justify-between">
              <Link to="/" className="text-[30px] font-black tracking-[-0.03em] text-primary lg:hidden">
                SHOP.CO
              </Link>
              <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-black/60 transition-colors hover:text-primary">
                <ArrowLeft size={16} />
                Trang chủ
              </Link>
            </div>

            <div className="rounded-lg border border-black/10 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-8">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">
                  <ShoppingBag size={22} />
                </div>
                <h1 className="text-[34px] font-black leading-tight text-primary">Tạo tài khoản</h1>
                <p className="mt-2 text-sm leading-6 text-black/60">
                  Tham gia SHOP.CO để lưu giỏ hàng, theo dõi đơn hàng và khám phá những món đồ phù hợp với phong cách của bạn.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="mb-2 block text-sm font-medium text-primary">Tên</label>
                    <div className="relative">
                      <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" />
                      <input id="firstName" type="text" value={form.firstName} onChange={set('firstName')} required placeholder="Tên" className="h-12 w-full rounded-full bg-[#F0F0F0] pl-11 pr-5 text-sm text-primary placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/10" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="lastName" className="mb-2 block text-sm font-medium text-primary">Họ</label>
                    <div className="relative">
                      <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" />
                      <input id="lastName" type="text" value={form.lastName} onChange={set('lastName')} required placeholder="Họ" className="h-12 w-full rounded-full bg-[#F0F0F0] pl-11 pr-5 text-sm text-primary placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/10" />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-primary">Email</label>
                  <div className="relative">
                    <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" />
                    <input id="email" type="email" value={form.email} onChange={set('email')} required placeholder="email@example.com" className="h-12 w-full rounded-full bg-[#F0F0F0] pl-12 pr-5 text-sm text-primary placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/10" />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="mb-2 block text-sm font-medium text-primary">Mật khẩu</label>
                  <div className="relative">
                    <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" />
                    <input id="password" type="password" value={form.password} onChange={set('password')} required minLength={6} placeholder="Ít nhất 6 ký tự" className="h-12 w-full rounded-full bg-[#F0F0F0] pl-12 pr-5 text-sm text-primary placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/10" />
                  </div>
                </div>

                {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}

                <button type="submit" disabled={loading} className="h-[52px] w-full rounded-full bg-primary px-8 text-sm font-medium text-white transition-colors hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50">
                  {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-black/60">
                Đã có tài khoản?{' '}
                <Link to="/login" className="font-semibold text-primary underline underline-offset-4 transition-colors hover:text-black/70">
                  Đăng nhập
                </Link>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="relative hidden overflow-hidden bg-primary text-white lg:block">
          <img src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1200&auto=format&fit=crop" alt="Fashion editorial" className="absolute inset-0 h-full w-full object-cover opacity-55" />
          <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/45 to-black/80" />
          <div className="relative z-10 flex h-full flex-col justify-between p-12">
            <Link to="/" className="text-[32px] font-black tracking-[-0.03em]">SHOP.CO</Link>
            <div className="max-w-[580px]">
              <p className="mb-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">Thành viên mới</p>
              <h2 className="text-[56px] font-black leading-[0.98]">PHONG CÁCH LUÔN ĐỒNG HÀNH CÙNG BẠN</h2>
              <p className="mt-6 max-w-[460px] text-base leading-7 text-white/70">
                Tạo tài khoản của bạn và giữ mọi đơn hàng, trang phục yêu thích và giỏ hàng ở cùng một nơi.
              </p>
            </div>
            <div className="grid max-w-[520px] grid-cols-3 divide-x divide-white/20">
              {[
                ['200+', 'Thương hiệu'],
                ['2,000+', 'Sản phẩm'],
                ['30,000+', 'Khách hàng'],
              ].map(([value, label]) => (
                <div key={label} className="px-5 first:pl-0">
                  <p className="text-3xl font-bold">{value}</p>
                  <p className="mt-1 text-sm text-white/60">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
