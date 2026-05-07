import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  ArrowRight,
  CreditCard,
  DollarSign,
  Package,
  ShoppingCart,
  Tag,
  Users,
  Warehouse,
} from 'lucide-react';
import { orderAdminApi } from '../../api/endpoints/orderApi';
import { productApi, categoryApi } from '../../api/endpoints/productApi';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const formatPrice = (price: number) => `$${Math.round(price / 10000)}`;

const StatCard = ({ title, value, icon: Icon, helper }: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  helper: string;
}) => (
  <div className="rounded-lg border border-black/10 bg-white p-6">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-black/50">{title}</p>
        <h3 className="mt-3 text-3xl font-black text-primary">{value}</h3>
        <p className="mt-2 text-xs text-black/45">{helper}</p>
      </div>
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white">
        <Icon size={20} />
      </span>
    </div>
  </div>
);

export default function AdminDashboardPage() {
  const { data: ordersData, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['admin-orders', { page: 0, size: 100 }],
    queryFn: () => orderAdminApi.list({ page: 0, size: 100 }).then(r => r.data.data),
  });

  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['admin-products', { page: 0, size: 1 }],
    queryFn: () => productApi.list({ page: 0, size: 1 }).then(r => r.data.data),
  });

  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => categoryApi.list().then(r => r.data.data),
  });

  if (isLoadingOrders || isLoadingProducts || isLoadingCategories) {
    return (
      <div className="flex h-[55vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const orders = ordersData?.content || [];
  const totalOrders = ordersData?.totalElements || 0;
  const totalProducts = productsData?.totalElements || 0;
  const totalCategories = categoriesData?.length || 0;
  const revenue = orders.filter(o => o.status !== 'CANCELLED').reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingOrders = orders.filter(o => o.status === 'PENDING');

  return (
    <div className="space-y-6">
      <section className="rounded-lg bg-primary p-6 text-white lg:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-white/45">Operations overview</p>
            <h2 className="mt-3 text-4xl font-black leading-tight md:text-5xl">STORE DASHBOARD</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">
              Monitor catalog health, pending orders, inventory readiness, and payment activity from one workspace.
            </p>
          </div>
          <Link to="/admin/orders" className="inline-flex h-12 w-fit items-center gap-2 rounded-full bg-white px-6 text-sm font-medium text-primary">
            Review orders <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Revenue" value={formatPrice(revenue)} icon={DollarSign} helper="Non-cancelled orders" />
        <StatCard title="Orders" value={totalOrders} icon={ShoppingCart} helper={`${pendingOrders.length} pending`} />
        <StatCard title="Products" value={totalProducts} icon={Package} helper="Published catalog items" />
        <StatCard title="Categories" value={totalCategories} icon={Tag} helper="Active merchandising groups" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="rounded-lg border border-black/10 bg-white">
          <div className="flex items-center justify-between border-b border-black/10 p-5">
            <div>
              <h3 className="text-xl font-bold text-primary">Pending Orders</h3>
              <p className="mt-1 text-sm text-black/50">Orders that need an operational action.</p>
            </div>
            <Link to="/admin/orders" className="text-sm font-medium text-primary underline underline-offset-4">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F7F7F7] text-xs uppercase tracking-[0.18em] text-black/45">
                <tr>
                  <th className="px-5 py-4 text-left">Order</th>
                  <th className="px-5 py-4 text-left">Customer</th>
                  <th className="px-5 py-4 text-left">Date</th>
                  <th className="px-5 py-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10">
                {pendingOrders.slice(0, 6).map(order => (
                  <tr key={order.id} className="hover:bg-[#F7F7F7]">
                    <td className="px-5 py-4 font-mono text-xs font-bold text-primary">#{order.id.slice(0, 8).toUpperCase()}</td>
                    <td className="px-5 py-4 text-black/60">{order.userId.slice(0, 8)}...</td>
                    <td className="px-5 py-4 text-black/60">{new Date(order.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}</td>
                    <td className="px-5 py-4 text-right font-bold text-primary">{formatPrice(order.totalAmount)}</td>
                  </tr>
                ))}
                {pendingOrders.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center text-sm text-black/50">No pending orders.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg border border-black/10 bg-white p-6">
          <h3 className="text-xl font-bold text-primary">System Snapshot</h3>
          <div className="mt-6 space-y-4">
            {[
              { icon: Warehouse, label: 'Inventory', value: 'Operational' },
              { icon: CreditCard, label: 'Payments', value: 'Connected' },
              { icon: Users, label: 'Customers', value: 'Active' },
              { icon: Activity, label: 'API Health', value: 'Stable' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-4 rounded-lg bg-[#F7F7F7] p-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
                  <Icon size={18} />
                </span>
                <div>
                  <p className="text-sm font-medium text-black/50">{label}</p>
                  <p className="mt-0.5 font-bold text-primary">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
