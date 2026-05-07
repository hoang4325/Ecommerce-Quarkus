import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, Package, ShoppingBag, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { orderApi } from '../../api/endpoints/orderApi';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import type { OrderDTO } from '../../types';

function formatPrice(price: number) {
  return `$${Math.round(price / 10000)}`;
}

export default function OrderListPage() {
  const queryClient = useQueryClient();
  const [cancelling, setCancelling] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await orderApi.getOrders();
      return res.data.data as OrderDTO[];
    },
  });

  const handleCancel = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn huỷ đơn hàng này?')) return;
    setCancelling(id);
    try {
      await orderApi.cancel(id);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    } finally {
      setCancelling(null);
    }
  };

  const orders = data ?? [];

  if (isLoading) return <LoadingSpinner size="lg" />;

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className="container-shop border-t border-black/10 py-6">
        <nav className="flex items-center gap-2 text-sm text-black/60">
          <Link to="/" className="transition-colors hover:text-primary">Trang chủ</Link>
          <ChevronRight size={16} />
          <span className="font-medium text-primary">Đơn hàng</span>
        </nav>

        <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-[40px] font-black leading-tight text-primary md:text-[48px]">ĐƠN HÀNG CỦA TÔI</h1>
            <p className="mt-2 text-sm text-black/60">Theo dõi mua hàng, xem trạng thái thanh toán và quản lý các đơn hàng đang chờ xử lý.</p>
          </div>
          <Link to="/products" className="inline-flex h-12 w-fit items-center justify-center rounded-full bg-primary px-7 text-sm font-medium text-white transition-colors hover:bg-black/80">
            Tiếp tục mua sắm
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="py-16">
            <EmptyState
              icon={<ShoppingBag size={32} />}
              message="Bạn chưa có đơn hàng nào"
              action={<Link to="/products" className="inline-flex rounded-full bg-primary px-8 py-3 text-sm font-medium text-white">Mua ngay</Link>}
            />
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {orders.map((order) => (
              <motion.article
                key={order.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="rounded-lg border border-black/10 bg-white p-5 md:p-6"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#F0F0F0]">
                      <Package size={24} className="text-primary" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="font-mono text-sm font-bold text-primary">#{order.id.slice(0, 8).toUpperCase()}</h2>
                        <StatusBadge status={order.status} />
                      </div>
                      <p className="mt-1 text-sm text-black/60">
                        Đặt ngày {new Date(order.createdAt).toLocaleDateString('vi-VN', { dateStyle: 'medium' })}
                      </p>
                      {order.items?.length > 0 && (
                        <p className="mt-3 line-clamp-2 text-sm text-black/60">
                          {order.items.slice(0, 3).map(item => `${item.productName} x${item.quantity}`).join(', ')}
                          {order.items.length > 3 ? `, +${order.items.length - 3} sản phẩm khác` : ''}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                    <span className="text-2xl font-bold text-primary">{formatPrice(order.totalAmount)}</span>
                    <Link to={`/orders/${order.id}`} className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-black/10 px-5 text-sm font-medium transition-colors hover:border-primary">
                      Chi tiết <ArrowRight size={16} />
                    </Link>
                    {order.status === 'PENDING' && (
                      <button
                        type="button"
                        onClick={() => handleCancel(order.id)}
                        disabled={cancelling === order.id}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-red-50 px-5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
                      >
                        <XCircle size={16} />
                        {cancelling === order.id ? 'Đang huỷ...' : 'Huỷ'}
                      </button>
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
