import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { orderAdminApi } from '../../api/endpoints/orderApi';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Pagination from '../../components/ui/Pagination';
import { OrderStatus } from '../../types';
import type { OrderDTO } from '../../types';

const STATUS_OPTIONS = Object.values(OrderStatus);
const PAGE_SIZE = 20;

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

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

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
    <div>
      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
          className="border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
        >
          <option value="">Tất cả trạng thái</option>
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <span className="text-sm text-muted">
          {isLoading ? '...' : `${data?.totalElements ?? 0} đơn hàng`}
        </span>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-white border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface text-xs uppercase tracking-widest text-muted">
                <th className="text-left px-4 py-3">ID</th>
                <th className="text-left px-4 py-3">Ngày đặt</th>
                <th className="text-left px-4 py-3">Khách hàng</th>
                <th className="text-right px-4 py-3">Tổng tiền</th>
                <th className="text-center px-4 py-3">Trạng thái</th>
                <th className="text-center px-4 py-3">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-surface transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-muted">{order.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-4 py-3 text-xs">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td className="px-4 py-3 text-xs text-muted">{order.userId?.slice(0, 8)}...</td>
                  <td className="px-4 py-3 text-right font-bold text-accent">{formatPrice(order.totalAmount)}</td>
                  <td className="px-4 py-3 text-center"><StatusBadge status={order.status} /></td>
                  <td className="px-4 py-3 text-center">
                    <select
                      value={order.status}
                      disabled={updatingId === order.id || order.status === 'CONFIRMED' || order.status === 'CANCELLED'}
                      onChange={e => updateStatus(order.id, e.target.value)}
                      className="text-xs border border-border px-2 py-1 focus:outline-none focus:border-primary disabled:opacity-50"
                    >
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <div className="text-center py-12 text-muted text-sm">Không có đơn hàng nào</div>
          )}
        </div>
      )}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}