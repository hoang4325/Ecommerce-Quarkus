import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Tag, ShoppingCart, Warehouse, CreditCard, ChevronLeft, Menu, Store } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: Tag },
  { to: '/admin/inventory', label: 'Inventory', icon: Warehouse },
  { to: '/admin/payments', label: 'Payments', icon: CreditCard },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const activeItem = navItems.find(n => n.to === location.pathname);

  return (
    <div className="min-h-screen bg-[#F6F6F6] text-primary lg:flex">
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-black/10 bg-primary text-white transition-all duration-300 lg:flex',
          collapsed ? 'w-20' : 'w-[270px]'
        )}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
          {!collapsed && (
            <Link to="/admin" className="text-[26px] font-black tracking-[-0.03em]">
              SHOP.CO
            </Link>
          )}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/15"
            aria-label="Toggle sidebar"
          >
            {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {!collapsed && <p className="px-5 pt-5 text-xs font-medium uppercase tracking-[0.24em] text-white/45">Administration</p>}

        <nav className="flex-1 space-y-1 px-3 py-5">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={clsx(
                  'flex h-12 items-center gap-3 rounded-lg px-4 text-sm font-medium transition-colors',
                  active ? 'bg-white text-primary' : 'text-white/65 hover:bg-white/10 hover:text-white',
                  collapsed && 'justify-center px-0'
                )}
                title={collapsed ? label : undefined}
              >
                <Icon size={19} className="shrink-0" />
                {!collapsed && <span>{label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <Link
            to="/"
            className={clsx(
              'flex h-12 items-center gap-3 rounded-lg px-4 text-sm font-medium text-white/65 transition-colors hover:bg-white/10 hover:text-white',
              collapsed && 'justify-center px-0'
            )}
          >
            <Store size={19} className="shrink-0" />
            {!collapsed && <span>Storefront</span>}
          </Link>
        </div>
      </aside>

      <div className={clsx('min-h-screen flex-1 transition-all duration-300', collapsed ? 'lg:ml-20' : 'lg:ml-[270px]')}>
        <header className="sticky top-0 z-30 border-b border-black/10 bg-white/90 backdrop-blur">
          <div className="flex h-20 items-center justify-between px-5 lg:px-8">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-black/40">SHOP.CO Admin</p>
              <h1 className="mt-1 text-2xl font-black leading-tight text-primary">{activeItem?.label ?? 'Admin'}</h1>
            </div>
            <Link to="/" className="hidden rounded-full border border-black/10 px-5 py-2.5 text-sm font-medium transition-colors hover:border-primary md:inline-flex">
              View Store
            </Link>
          </div>
        </header>

        <main className="p-5 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
