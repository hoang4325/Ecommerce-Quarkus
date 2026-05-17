import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, ShoppingCart, Menu, X, ChevronDown, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../auth/authStore';
import { authService } from '../../auth/authService';
import { useQuery } from '@tanstack/react-query';
import { cartApi } from '../../api/endpoints/cartApi';
import { categoryApi } from '../../api/endpoints/productApi';
import type { CategoryDTO } from '../../types';
import clsx from 'clsx';

export default function Header() {
  const [search, setSearch] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const categoryMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuthStore();
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { data: cartData } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const res = await cartApi.getCart();
      return res.data.data;
    },
    enabled: isAuthenticated(),
    staleTime: 30000,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await categoryApi.list();
      return res.data.data as CategoryDTO[];
    },
    staleTime: 300000,
  });

  const categories = categoriesData ?? [];
  const cartCount = cartData?.itemCount ?? 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  const handleLogout = () => {
    logout();
    authService.logout();
    navigate('/login');
    setUserMenuOpen(false);
  };

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(e.target as Node)) {
        setCategoryMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="bg-white sticky top-0 z-40">
      <div className="container-shop">
        <div className="flex items-center h-[72px] gap-4">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 text-[28px] font-black tracking-[-0.03em] text-primary">
            SHOP.CO
          </Link>

          {/* Category nav — desktop */}
          <nav className="hidden lg:flex items-center gap-6 text-sm text-primary">
            {/* Dropdown Sản phẩm */}
            <div className="relative" ref={categoryMenuRef}>
              <button
                onClick={() => setCategoryMenuOpen(!categoryMenuOpen)}
                className="inline-flex items-center gap-1.5 transition-colors hover:text-black/60"
              >
                Sản phẩm
                <motion.span animate={{ rotate: categoryMenuOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown size={14} />
                </motion.span>
              </button>
              <AnimatePresence>
                {categoryMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="absolute left-0 top-full mt-2 w-52 bg-white shadow-xl border border-black/8 rounded-xl z-50 overflow-hidden"
                  >
                    <Link
                      to="/products"
                      onClick={() => setCategoryMenuOpen(false)}
                      className="block px-4 py-3 text-sm font-semibold text-primary border-b border-black/5 hover:bg-black/5 transition-colors"
                    >
                      Tất cả sản phẩm
                    </Link>
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/products?category=${cat.id}`}
                        onClick={() => setCategoryMenuOpen(false)}
                        className="block px-4 py-2.5 text-sm text-black/70 hover:bg-black/5 hover:text-primary transition-colors"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Link to="/products?sort=sale" className="transition-colors hover:text-black/60">Giảm giá</Link>
            <Link to="/products?sort=new" className="transition-colors hover:text-black/60">Hàng mới về</Link>
            <Link to="/products?brands=all" className="transition-colors hover:text-black/60">Thương hiệu</Link>
          </nav>

          {/* Search - desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 mx-2">
            <div className="relative w-full">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full rounded-full bg-[#F0F0F0] py-3 pl-12 pr-5 text-sm text-primary placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
          </form>

          {/* Right icons */}
          <div className="flex items-center gap-1 ml-auto">
            {/* Notifications */}
            {isAuthenticated() && (
              <Link to="/notifications" className="p-2 hover:text-accent transition-colors relative">
                <Bell size={20} />
              </Link>
            )}

            {/* User menu */}
            {isAuthenticated() ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1 p-2 hover:text-accent transition-colors"
                >
                  <User size={20} />
                  <span className="hidden lg:inline text-sm font-medium">{user?.firstName}</span>
                  <motion.div
                    animate={{ rotate: userMenuOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={14} className="hidden lg:inline" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute right-0 top-full mt-1 w-52 bg-white shadow-lg border border-border z-50 origin-top-right"
                    >
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-sm font-semibold">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-muted truncate">{user?.email}</p>
                      </div>
                      <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2.5 text-sm hover:bg-surface transition-colors">Tài khoản của tôi</Link>
                      <Link to="/orders" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2.5 text-sm hover:bg-surface transition-colors">Đơn hàng</Link>
                      {isAdmin() && (
                        <>
                          <div className="border-t border-border" />
                          <Link to="/admin/products" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2.5 text-sm text-accent hover:bg-surface transition-colors">Quản trị</Link>
                        </>
                      )}
                      <div className="border-t border-border" />
                      <button onClick={handleLogout} className="block w-full text-left px-4 py-2.5 text-sm hover:bg-surface transition-colors">Đăng xuất</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-1 p-2 hover:text-accent transition-colors">
                <User size={20} />
                <span className="hidden lg:inline text-sm">Đăng nhập</span>
              </Link>
            )}

            {/* Cart */}
            <Link to="/cart" className="relative p-2 hover:text-accent transition-colors">
              <ShoppingCart size={20} />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white bg-accent rounded-full px-1"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 hover:text-accent transition-colors"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={mobileOpen ? "close" : "open"}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Mobile overlay */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden overflow-hidden border-t border-border"
            >
              <div className="pb-4">
                <form onSubmit={handleSearch} className="flex gap-2 pt-3 pb-4">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm kiếm..."
                    className="flex-1 border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  />
                  <button type="submit" className="btn-primary px-4 py-2">
                    <Search size={16} />
                  </button>
                </form>
                <nav className="flex flex-col gap-1">
                  <Link to="/products" onClick={() => setMobileOpen(false)} className={clsx("px-1 py-3 border-b border-border text-sm font-semibold hover:text-accent transition-colors uppercase tracking-wider")}>Tất cả sản phẩm</Link>
                  {categories.map((cat) => (
                    <Link key={cat.id} to={`/products?category=${cat.id}`} onClick={() => setMobileOpen(false)} className={clsx("px-1 py-3 border-b border-border text-sm font-semibold hover:text-accent transition-colors uppercase tracking-wider")}>{cat.name}</Link>
                  ))}
                  {!isAuthenticated() && (
                    <div className="pt-2 border-t border-border mt-2 flex gap-3">
                      <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-outline text-xs px-4 py-2 flex-1 text-center">Đăng nhập</Link>
                      <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary text-xs px-4 py-2 flex-1 text-center">Đăng ký</Link>
                    </div>
                  )}
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
