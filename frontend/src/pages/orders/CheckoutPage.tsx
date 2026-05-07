import { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, CheckCircle, ChevronRight, CreditCard, Landmark, MapPin, ShieldCheck, ShoppingBag, Truck } from 'lucide-react';
import { motion } from 'framer-motion';
import { cartApi } from '../../api/endpoints/cartApi';
import { orderApi } from '../../api/endpoints/orderApi';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import type { CartItemDTO } from '../../types';

const PAYMENT_METHODS = [
  {
    id: 'card',
    title: 'Credit / Debit Card',
    desc: 'Visa, Mastercard, JCB',
    icon: CreditCard,
  },
  {
    id: 'bank',
    title: 'Bank Transfer',
    desc: 'Manual transfer after order creation',
    icon: Landmark,
  },
  {
    id: 'cod',
    title: 'Cash on Delivery',
    desc: 'Pay when your package arrives',
    icon: Truck,
  },
];

const CART_IMAGES = [
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=400&auto=format&fit=crop',
];

export default function CheckoutPage() {
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: cartData, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const res = await cartApi.getCart();
      return res.data.data;
    },
  });

  const formatPrice = (price: number) => `$${Math.round(price / 10000)}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingAddress.trim()) {
      setError('Vui lòng nhập địa chỉ giao hàng');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await orderApi.create({ shippingAddress: shippingAddress.trim() });
      const orderId = res.data.data?.id;
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      navigate(orderId ? `/orders/${orderId}` : '/orders');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message ?? 'Đặt hàng thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const items = cartData?.items ?? [];
  const subtotal = cartData?.totalAmount ?? 0;
  const discount = Math.round(subtotal * 0.2);
  const deliveryFee = subtotal > 0 ? 150000 : 0;
  const total = useMemo(() => subtotal - discount + deliveryFee, [subtotal, discount, deliveryFee]);

  if (isLoading) return <LoadingSpinner size="lg" />;

  if (items.length === 0) {
    return (
      <div className="container-shop border-t border-black/10 py-20">
        <EmptyState
          icon={<ShoppingBag size={32} />}
          message="Giỏ hàng của bạn đang trống"
          action={
            <Link to="/products" className="inline-flex rounded-full bg-primary px-8 py-3 text-sm font-medium text-white">
              Continue Shopping
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className="container-shop border-t border-black/10 py-6">
        <nav className="flex items-center gap-2 text-sm text-black/60">
          <Link to="/" className="transition-colors hover:text-primary">Home</Link>
          <ChevronRight size={16} />
          <Link to="/cart" className="transition-colors hover:text-primary">Cart</Link>
          <ChevronRight size={16} />
          <span className="font-medium text-primary">Payment</span>
        </nav>

        <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-[40px] font-black leading-tight text-primary md:text-[48px]">PAYMENT</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-black/60">
              Complete your shipping details and choose how you want to pay for this order.
            </p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
            <ShieldCheck size={17} />
            Secure checkout
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-5 lg:grid-cols-[1fr_455px]">
          <section className="space-y-5">
            <div className="rounded-lg border border-black/10 bg-white p-5 md:p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
                  <MapPin size={20} />
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-primary">Shipping Address</h2>
                  <p className="text-sm text-black/60">Where should we deliver your order?</p>
                </div>
              </div>

              <label htmlFor="shippingAddress" className="mt-6 block text-sm font-medium text-primary">
                Delivery address <span className="text-red-500">*</span>
              </label>
              <textarea
                id="shippingAddress"
                value={shippingAddress}
                onChange={e => setShippingAddress(e.target.value)}
                rows={5}
                placeholder="House number, street, ward, district, city..."
                className="mt-2 w-full resize-none rounded-lg bg-[#F0F0F0] px-4 py-4 text-sm text-primary placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/10"
                required
              />

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {['Standard delivery', '2-5 business days', 'Tracking included'].map((item) => (
                  <div key={item} className="rounded-lg bg-[#F7F7F7] px-4 py-3 text-sm font-medium text-black/60">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-black/10 bg-white p-5 md:p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
                  <CreditCard size={20} />
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-primary">Payment Method</h2>
                  <p className="text-sm text-black/60">Select a payment option for this checkout.</p>
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                {PAYMENT_METHODS.map(({ id, title, desc, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPaymentMethod(id)}
                    className={`flex items-center justify-between rounded-lg border p-4 text-left transition-colors ${
                      paymentMethod === id ? 'border-primary bg-[#F7F7F7]' : 'border-black/10 hover:border-black/30'
                    }`}
                  >
                    <span className="flex items-center gap-4">
                      <span className={`flex h-11 w-11 items-center justify-center rounded-full ${
                        paymentMethod === id ? 'bg-primary text-white' : 'bg-[#F0F0F0] text-primary'
                      }`}>
                        <Icon size={20} />
                      </span>
                      <span>
                        <span className="block font-bold text-primary">{title}</span>
                        <span className="mt-0.5 block text-sm text-black/60">{desc}</span>
                      </span>
                    </span>
                    {paymentMethod === id && <CheckCircle size={22} fill="#01AB31" className="text-white" />}
                  </button>
                ))}
              </div>

              <div className="mt-5 rounded-lg bg-[#F0F0F0] p-4 text-sm leading-6 text-black/60">
                Payment records are created after the order is placed. You can review status from your order detail page.
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}
          </section>

          <aside className="h-fit rounded-lg border border-black/10 bg-white p-5 md:p-6 lg:sticky lg:top-28">
            <h2 className="text-2xl font-bold text-primary">Order Summary</h2>
            <div className="mt-6 divide-y divide-black/10">
              {items.map((item: CartItemDTO, index) => (
                <div key={item.id} className="flex gap-4 py-4 first:pt-0">
                  <Link to={`/products/${item.productId}`} className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-[#F0EEED]">
                    <img
                      src={CART_IMAGES[index % CART_IMAGES.length]}
                      alt={item.productName}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link to={`/products/${item.productId}`} className="line-clamp-2 text-sm font-bold text-primary">
                      {item.productName}
                    </Link>
                    <p className="mt-1 text-xs text-black/60">Qty: {item.quantity}</p>
                    <p className="mt-2 text-base font-bold text-primary">{formatPrice(item.subtotal)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-2 space-y-4 border-t border-black/10 pt-5">
              <div className="flex items-center justify-between text-base">
                <span className="text-black/60">Subtotal</span>
                <span className="font-bold text-primary">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-base">
                <span className="text-black/60">Discount (-20%)</span>
                <span className="font-bold text-red-500">-{formatPrice(discount)}</span>
              </div>
              <div className="flex items-center justify-between text-base">
                <span className="text-black/60">Delivery Fee</span>
                <span className="font-bold text-primary">{formatPrice(deliveryFee)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-black/10 pt-5">
                <span className="text-xl text-primary">Total</span>
                <span className="text-2xl font-bold text-primary">{formatPrice(total)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 inline-flex h-[54px] w-full items-center justify-center gap-3 rounded-full bg-primary px-8 text-sm font-medium text-white transition-colors hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? 'Processing...' : 'Place Order'}
              <ArrowRight size={18} />
            </button>

            <Link to="/cart" className="mt-4 inline-flex w-full justify-center text-sm font-medium text-black/60 underline underline-offset-4 transition-colors hover:text-primary">
              Back to cart
            </Link>
          </aside>
        </form>
      </div>
    </motion.div>
  );
}
