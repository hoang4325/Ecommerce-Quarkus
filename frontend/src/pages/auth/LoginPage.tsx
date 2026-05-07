import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Lock, Mail, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { authService } from '../../auth/authService';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/';
  const registered = searchParams.get('registered') === '1';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authService.login({ email, password });
      await authService.getMe();
      navigate(redirectTo, { replace: true });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string; errors?: { message: string }[] } } };
      const errData = axiosErr.response?.data;
      if (errData?.errors?.length) {
        setError(errData.errors.map(e => e.message).join(', '));
      } else {
        setError(errData?.message ?? 'Email hoặc mật khẩu không đúng');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F2F0F1]">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-primary text-white lg:block">
          <img
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop"
            alt="Fashion collection"
            className="absolute inset-0 h-full w-full object-cover opacity-55"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/45 to-black/70" />
          <div className="relative z-10 flex h-full flex-col justify-between p-12">
            <Link to="/" className="text-[32px] font-black tracking-[-0.03em]">
              SHOP.CO
            </Link>

            <div className="max-w-[560px]">
              <p className="mb-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">
                Member access
              </p>
              <h1 className="text-[56px] font-black leading-[0.98] tracking-normal">
                FIND CLOTHES
                <br />
                THAT MATCHES
                <br />
                YOUR STYLE
              </h1>
              <p className="mt-6 max-w-[460px] text-base leading-7 text-white/70">
                Sign in to continue your shopping journey, manage orders, and keep your cart ready across devices.
              </p>
            </div>

            <div className="grid max-w-[520px] grid-cols-3 divide-x divide-white/20">
              {[
                ['200+', 'Brands'],
                ['2,000+', 'Products'],
                ['30,000+', 'Customers'],
              ].map(([value, label]) => (
                <div key={label} className="px-5 first:pl-0">
                  <p className="text-3xl font-bold">{value}</p>
                  <p className="mt-1 text-sm text-white/60">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="w-full max-w-[480px]"
          >
            <div className="mb-8 flex items-center justify-between">
              <Link to="/" className="text-[30px] font-black tracking-[-0.03em] text-primary lg:hidden">
                SHOP.CO
              </Link>
              <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-black/60 transition-colors hover:text-primary">
                <ArrowLeft size={16} />
                Home
              </Link>
            </div>

            <div className="rounded-lg border border-black/10 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-8">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">
                  <ShoppingBag size={22} />
                </div>
                <h1 className="text-[34px] font-black leading-tight text-primary">Welcome back</h1>
                <p className="mt-2 text-sm leading-6 text-black/60">
                  Sign in to access your cart, orders, and personalized product picks.
                </p>
              </div>

              {registered && (
                <div className="mb-5 rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                  Tạo tài khoản thành công. Bạn có thể đăng nhập ngay.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-primary">
                    Email
                  </label>
                  <div className="relative">
                    <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      placeholder="email@example.com"
                      className="h-12 w-full rounded-full bg-[#F0F0F0] pl-12 pr-5 text-sm text-primary placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/10"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm font-medium text-primary">
                      Password
                    </label>
                    <Link to="/login" className="text-sm text-black/50 underline underline-offset-4 transition-colors hover:text-primary">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" />
                    <input
                      id="password"
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      placeholder="Enter your password"
                      className="h-12 w-full rounded-full bg-[#F0F0F0] pl-12 pr-12 text-sm text-primary placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 transition-colors hover:text-primary"
                      aria-label={showPw ? 'Hide password' : 'Show password'}
                    >
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="h-[52px] w-full rounded-full bg-primary px-8 text-sm font-medium text-white transition-colors hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-black/60">
                Don&apos;t have an account?{' '}
                <Link to="/register" className="font-semibold text-primary underline underline-offset-4 transition-colors hover:text-black/70">
                  Sign up
                </Link>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-black/45">
              By signing in, you agree to SHOP.CO account access for orders, cart, and profile services.
            </p>
          </motion.div>
        </section>
      </div>
    </main>
  );
}
