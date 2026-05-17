import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Bell, ChevronRight, Package, ShoppingCart, User, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import { orderApi } from '../../api/endpoints/orderApi';
import { notificationApi } from '../../api/endpoints/notificationApi';
import { useAuthStore } from '../../auth/authStore';

const formatPrice = (price: number) => `${price.toLocaleString('vi-VN')} đ`;

const DashboardPage = () => {
  const { user, isAdmin } = useAuthStore();
  const isAdminUser = isAdmin();

  const { data: orders } = useQuery({
    queryKey: ['orders'],
    queryFn: () => orderApi.getOrders().then((r) => r.data.data ?? []),
  });

  const { data: unreadNotifications } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () => notificationApi.getUnread().then((r) => r.data.data ?? []),
  });

  const confirmedTotal = orders?.filter((order) => order.status === 'CONFIRMED').reduce((sum, order) => sum + order.totalAmount, 0) ?? 0;
  const pendingCount = orders?.filter((order) => order.status === 'PENDING').length ?? 0;

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className="container-shop border-t border-black/10 py-6">
        <nav className="flex items-center gap-2 text-sm text-black/60">
          <Link to="/" className="transition-colors hover:text-primary">Home</Link>
          <ChevronRight size={16} />
          <span className="font-medium text-primary">Dashboard</span>
        </nav>

        <section className="mt-6 rounded-lg bg-primary p-6 text-white md:p-8">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-white/45">Account overview</p>
          <h1 className="mt-3 text-4xl font-black leading-tight md:text-5xl">
            WELCOME, {user?.firstName?.toUpperCase() || 'USER'}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">
            Track your orders, profile details, notifications, and shopping activity from one place.
          </p>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'My Orders', value: orders?.length ?? 0, icon: Package },
            { label: 'Pending Orders', value: pendingCount, icon: ShoppingCart },
            { label: 'Unread Notifications', value: unreadNotifications?.length ?? 0, icon: Bell },
            { label: 'Total Spent', value: formatPrice(confirmedTotal), icon: Wallet },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-lg border border-black/10 bg-white p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-black/50">{label}</p>
                  <p className="mt-3 text-3xl font-black text-primary">{value}</p>
                </div>
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white">
                  <Icon size={20} />
                </span>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-[1fr_330px]">
          <div className="rounded-lg border border-black/10 bg-white p-6">
            <h2 className="text-2xl font-bold text-primary">Recent Orders</h2>
            <div className="mt-5 divide-y divide-black/10">
              {(orders ?? []).slice(0, 5).map((order) => (
                <Link key={order.id} to={`/orders/${order.id}`} className="flex items-center justify-between gap-4 py-4">
                  <div>
                    <p className="font-mono text-xs font-bold text-primary">#{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="mt-1 text-sm text-black/50">{new Date(order.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}</p>
                  </div>
                  <p className="font-bold text-primary">{formatPrice(order.totalAmount)}</p>
                </Link>
              ))}
              {(orders ?? []).length === 0 && <p className="py-8 text-center text-sm text-black/50">No recent orders.</p>}
            </div>
          </div>

          <div className="rounded-lg border border-black/10 bg-white p-6">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">
              <User size={22} />
            </span>
            <h2 className="mt-5 text-2xl font-bold text-primary">Account</h2>
            <p className="mt-2 text-sm leading-6 text-black/60">{user?.email || 'No email available'}</p>
            <div className="mt-6 grid gap-3">
              <Link to="/profile" className="rounded-full border border-black/10 px-5 py-3 text-center text-sm font-medium transition-colors hover:border-primary">Edit Profile</Link>
              <Link to="/orders" className="rounded-full bg-primary px-5 py-3 text-center text-sm font-medium text-white">View Orders</Link>
              {isAdminUser && <Link to="/admin" className="rounded-full border border-black/10 px-5 py-3 text-center text-sm font-medium transition-colors hover:border-primary">Admin Console</Link>}
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  );
};

export default DashboardPage;
