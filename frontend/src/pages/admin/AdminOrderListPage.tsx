import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Filter } from 'lucide-react';
import { orderAdminApi } from '../../api/endpoints/orderApi';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Pagination from '../../components/ui/Pagination';
import { OrderStatus } from '../../types';
import type { OrderDTO } from '../../types';

const STATUS_OPTIONS = Object.values(OrderStatus);
const PAGE_SIZE = 20;
const formatPrice = (price: number) => `${price.toLocaleString('vi-VN')} đ`;

export default function AdminOrderListPage() {
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', page, statusFilter],
    queryFn: async () => {
      const res = await orderAdminApi.list({ page, size: PAGE_SIZE, status: statusFilter || undefined });
      return res.data.data;
    },
  });

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      await orderAdminApi.updateStatus(id, status);
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    } finally {
      setUpdatingId(null);
    }
  };

  const orders: OrderDTO[] = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-black/10 bg-white p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-primary">Order Management</h2>
            <p className="mt-1 text-sm text-black/50">{isLoading ? 'Loading orders...' : `${data?.totalElements ?? 0} orders in this view`}</p>
          </div>
          <label className="flex w-full items-center gap-2 rounded-full bg-[#F0F0F0] px-4 md:w-auto">
            <Filter size={17} className="text-black/40" />
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
              className="h-11 bg-transparent text-sm text-primary focus:outline-none"
            >
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map(status => <option key={status} value={status}>{status}</option>)}
            </select>
          </label>
        </div>
      </section>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="overflow-hidden rounded-lg border border-black/10 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F7F7F7] text-xs uppercase tracking-[0.18em] text-black/45">
                <tr>
                  <th className="px-5 py-4 text-left">Order</th>
                  <th className="px-5 py-4 text-left">Date</th>
                  <th className="px-5 py-4 text-left">Customer</th>
                  <th className="px-5 py-4 text-right">Total</th>
                  <th className="px-5 py-4 text-center">Status</th>
                  <th className="px-5 py-4 text-center">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-[#F7F7F7]">
                    <td className="px-5 py-4 font-mono text-xs font-bold text-primary">#{order.id.slice(0, 8).toUpperCase()}</td>
                    <td className="px-5 py-4 text-xs text-black/60">{new Date(order.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}</td>
                    <td className="px-5 py-4 text-xs text-black/60">{order.userId?.slice(0, 8)}...</td>
                    <td className="px-5 py-4 text-right font-bold text-primary">{formatPrice(order.totalAmount)}</td>
                    <td className="px-5 py-4 text-center"><StatusBadge status={order.status} /></td>
                    <td className="px-5 py-4 text-center">
                      <select
                        value={order.status}
                        disabled={updatingId === order.id || order.status === 'CONFIRMED' || order.status === 'CANCELLED'}
                        onChange={e => updateStatus(order.id, e.target.value)}
                        className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-black/10 disabled:opacity-50"
                      >
                        {STATUS_OPTIONS.map(status => <option key={status} value={status}>{status}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && <div className="py-12 text-center text-sm text-black/50">No orders found.</div>}
          </div>
        </div>
      )}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
