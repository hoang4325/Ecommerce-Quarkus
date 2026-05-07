import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronRight, CreditCard, MapPin, Package, ShoppingBag, Truck, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { orderApi } from '../../api/endpoints/orderApi';
import { paymentApi } from '../../api/endpoints/paymentApi';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const CART_IMAGES = [
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=400&auto=format&fit=crop',
];

function formatPrice(price: number) {
  return `$${Math.round(price / 10000)}`;
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [cancelling, setCancelling] = useState(false);

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const res = await orderApi.getById(id!);
      return res.data.data!;
    },
    enabled: !!id,
  });

  const { data: payment } = useQuery({
    queryKey: ['payment-order', id],
    queryFn: async () => {
      const res = await paymentApi.getByOrder(id!);
      return res.data.data;
    },
    enabled: !!id,
  });

  const handleCancel = async () => {
    if (!order || !confirm('Bạn có chắc chắn muốn huỷ đơn hàng này?')) return;
    setCancelling(true);
    try {
      await orderApi.cancel(order.id);
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    } finally {
      setCancelling(false);
    }
  };

  if (isLoading) return <LoadingSpinner size="lg" />;
  if (!order) {
    return (
      <div className="container-shop border-t border-black/10 py-20 text-center">
        <p className="text-black/60">Order not found</p>
        <Link to="/orders" className="mt-6 inline-flex rounded-full border border-black/10 px-6 py-2.5 text-sm font-medium">
          Back to orders
        </Link>
      </div>
    );
  }

  const discount = Math.round(order.totalAmount * 0.2);
  const subtotal = order.totalAmount + discount;

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className="container-shop border-t border-black/10 py-6">
        <nav className="flex items-center gap-2 text-sm text-black/60">
          <Link to="/" className="transition-colors hover:text-primary">Home</Link>
          <ChevronRight size={16} />
          <Link to="/orders" className="transition-colors hover:text-primary">Orders</Link>
          <ChevronRight size={16} />
          <span className="font-medium text-primary">#{order.id.slice(0, 8).toUpperCase()}</span>
        </nav>

        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-[34px] font-black leading-tight text-primary md:text-[44px]">
                ORDER #{order.id.slice(0, 8).toUpperCase()}
              </h1>
              <StatusBadge status={order.status} />
            </div>
            <p className="mt-2 text-sm text-black/60">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { dateStyle: 'long' })}
            </p>
          </div>
          {order.status === 'PENDING' && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={cancelling}
              className="inline-flex h-12 w-fit items-center justify-center gap-2 rounded-full bg-red-50 px-6 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
            >
              <XCircle size={18} />
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_390px]">
          <section className="space-y-5">
            <div className="rounded-lg border border-black/10 bg-white">
              <div className="flex items-center gap-3 border-b border-black/10 p-5 md:p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
                  <ShoppingBag size={20} />
                </span>
                <h2 className="text-2xl font-bold text-primary">Ordered Items</h2>
              </div>
              <div className="divide-y divide-black/10 px-5 md:px-6">
                {order.items?.map((item, index) => (
                  <div key={item.id} className="flex gap-4 py-5">
                    <Link to={`/products/${item.productId}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-[#F0EEED]">
                      <img src={CART_IMAGES[index % CART_IMAGES.length]} alt={item.productName} className="h-full w-full object-cover" loading="lazy" />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link to={`/products/${item.productId}`} className="line-clamp-2 text-base font-bold text-primary">
                        {item.productName}
                      </Link>
                      <p className="mt-1 text-sm text-black/60">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                      <p className="mt-3 text-xl font-bold text-primary">{formatPrice(item.subtotal)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {payment && (
              <div className="rounded-lg border border-black/10 bg-white p-5 md:p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
                    <CreditCard size={20} />
                  </span>
                  <h2 className="text-2xl font-bold text-primary">Payment</h2>
                </div>
                <div className="mt-5 grid gap-4 text-sm md:grid-cols-3">
                  <div className="rounded-lg bg-[#F7F7F7] p-4">
                    <p className="text-black/50">Status</p>
                    <p className={`mt-1 font-bold ${payment.status === 'SUCCESS' ? 'text-green-600' : 'text-red-600'}`}>
                      {payment.status === 'SUCCESS' ? 'Success' : 'Failed'}
                    </p>
                  </div>
                  <div className="rounded-lg bg-[#F7F7F7] p-4">
                    <p className="text-black/50">Amount</p>
                    <p className="mt-1 font-bold text-primary">{formatPrice(payment.amount)}</p>
                  </div>
                  <div className="rounded-lg bg-[#F7F7F7] p-4">
                    <p className="text-black/50">Transaction</p>
                    <p className="mt-1 truncate font-mono text-xs text-primary">{payment.transactionId || 'Pending'}</p>
                  </div>
                </div>
              </div>
            )}
          </section>

          <aside className="space-y-5">
            <div className="rounded-lg border border-black/10 bg-white p-5 md:p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
                  <Package size={20} />
                </span>
                <h2 className="text-2xl font-bold text-primary">Summary</h2>
              </div>
              <div className="mt-6 space-y-4">
                <div className="flex justify-between text-base">
                  <span className="text-black/60">Subtotal</span>
                  <span className="font-bold text-primary">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-black/60">Discount (-20%)</span>
                  <span className="font-bold text-red-500">-{formatPrice(discount)}</span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-black/60">Delivery Fee</span>
                  <span className="font-bold text-primary">$0</span>
                </div>
                <div className="flex justify-between border-t border-black/10 pt-5">
                  <span className="text-xl text-primary">Total</span>
                  <span className="text-2xl font-bold text-primary">{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-black/10 bg-white p-5 md:p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
                  <Truck size={20} />
                </span>
                <h2 className="text-2xl font-bold text-primary">Delivery</h2>
              </div>
              <div className="mt-5 flex items-start gap-3 rounded-lg bg-[#F7F7F7] p-4 text-sm leading-6 text-black/60">
                <MapPin size={18} className="mt-1 shrink-0 text-primary" />
                <span>{order.shippingAddress}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </motion.div>
  );
}
