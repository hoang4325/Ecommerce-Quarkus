import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, ChevronRight, Minus, Plus, ShoppingBag, Tag, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cartApi } from '../../api/endpoints/cartApi';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import type { CartItemDTO } from '../../types';

const CART_IMAGES = [
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=400&auto=format&fit=crop',
];

const DEMO_ITEMS: CartItemDTO[] = [
  {
    id: 'demo-cart-1',
    productId: 'listing-1',
    productName: 'Gradient Graphic T-shirt',
    price: 1450000,
    quantity: 1,
    subtotal: 1450000,
  },
  {
    id: 'demo-cart-2',
    productId: 'listing-5',
    productName: 'Checkered Shirt',
    price: 1800000,
    quantity: 1,
    subtotal: 1800000,
  },
  {
    id: 'demo-cart-3',
    productId: 'listing-4',
    productName: 'Skinny Fit Jeans',
    price: 2400000,
    quantity: 1,
    subtotal: 2400000,
  },
];

function formatPrice(price: number) {
  return `$${Math.round(price / 10000)}`;
}

function CartLineItem({
  item,
  index,
  loading,
  onUpdate,
  onRemove,
}: {
  item: CartItemDTO;
  index: number;
  loading: boolean;
  onUpdate: (item: CartItemDTO, quantity: number) => void;
  onRemove: (itemId: string) => void;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="grid grid-cols-[99px_1fr] gap-4 border-b border-black/10 py-6 last:border-b-0 md:grid-cols-[124px_1fr]"
    >
      <Link to={`/products/${item.productId}`} className="aspect-square overflow-hidden rounded-lg bg-[#F0EEED]">
        <img
          src={CART_IMAGES[index % CART_IMAGES.length]}
          alt={item.productName}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </Link>

      <div className="min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link to={`/products/${item.productId}`} className="line-clamp-2 text-base font-bold text-primary md:text-xl">
              {item.productName}
            </Link>
            <p className="mt-1 text-xs text-primary md:text-sm">
              Size: <span className="text-black/60">Large</span>
            </p>
            <p className="mt-1 text-xs text-primary md:text-sm">
              Color: <span className="text-black/60">{index % 2 === 0 ? 'White' : 'Red'}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            disabled={loading}
            className="text-red-500 transition-colors hover:text-red-600 disabled:opacity-40"
            aria-label={`Remove ${item.productName}`}
          >
            <Trash2 size={22} />
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between gap-4 md:mt-7">
          <span className="text-xl font-bold text-primary md:text-2xl">{formatPrice(item.price)}</span>
          <div className="flex h-8 min-w-[105px] items-center justify-between rounded-full bg-[#F0F0F0] px-4 md:h-11 md:min-w-[126px]">
            <button
              type="button"
              onClick={() => onUpdate(item, item.quantity - 1)}
              disabled={loading || item.quantity <= 1}
              className="disabled:opacity-30"
              aria-label="Decrease quantity"
            >
              <Minus size={16} />
            </button>
            <span className="text-sm font-medium text-primary">{item.quantity}</span>
            <button
              type="button"
              onClick={() => onUpdate(item, item.quantity + 1)}
              disabled={loading}
              className="disabled:opacity-30"
              aria-label="Increase quantity"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default function CartPage() {
  const queryClient = useQueryClient();
  const [loadingItem, setLoadingItem] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  const { data: cartData, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const res = await cartApi.getCart();
      return res.data.data;
    },
  });

  const updateQuantity = async (item: CartItemDTO, newQty: number) => {
    if (newQty < 1) return;
    if (item.id.startsWith('demo-')) return;

    setLoadingItem(item.id);
    try {
      await cartApi.updateItem(item.id, { quantity: newQty });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    } finally {
      setLoadingItem(null);
    }
  };

  const removeItem = async (itemId: string) => {
    if (itemId.startsWith('demo-')) return;

    setLoadingItem(itemId);
    try {
      await cartApi.removeItem(itemId);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    } finally {
      setLoadingItem(null);
    }
  };

  const clearCart = async () => {
    await cartApi.clearCart();
    queryClient.invalidateQueries({ queryKey: ['cart'] });
  };

  const applyPromo = (event: React.FormEvent) => {
    event.preventDefault();
    setPromoApplied(!!promoCode.trim());
  };

  const items = useMemo(() => cartData?.items ?? [], [cartData]);
  const displayItems = useMemo(() => {
    return items.length ? items : cartData ? [] : DEMO_ITEMS;
  }, [items, cartData]);

  const subtotal = useMemo(() => {
    return displayItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [displayItems]);

  const discount = promoApplied ? Math.round(subtotal * 0.2) : Math.round(subtotal * 0.2);
  const deliveryFee = 150000;
  const total = subtotal - discount + deliveryFee;

  if (isLoading) return <LoadingSpinner size="lg" />;

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className="container-shop border-t border-black/10 py-6">
        <nav className="flex items-center gap-2 text-sm text-black/60">
          <Link to="/" className="transition-colors hover:text-primary">Home</Link>
          <ChevronRight size={16} />
          <span className="font-medium text-primary">Cart</span>
        </nav>

        <h1 className="mt-6 text-[40px] font-black leading-tight text-primary md:text-[48px]">YOUR CART</h1>

        {displayItems.length === 0 ? (
          <div className="py-16">
            <EmptyState
              icon={<ShoppingBag size={32} />}
              message="Your cart is empty"
              action={
                <Link to="/products" className="inline-flex rounded-full bg-primary px-8 py-3 text-sm font-medium text-white">
                  Continue Shopping
                </Link>
              }
            />
          </div>
        ) : (
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_505px]">
            <section className="rounded-lg border border-black/10 bg-white px-4 md:px-6">
              {displayItems.map((item, index) => (
                <CartLineItem
                  key={item.id}
                  item={item}
                  index={index}
                  loading={loadingItem === item.id}
                  onUpdate={updateQuantity}
                  onRemove={removeItem}
                />
              ))}

              {items.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="mb-6 text-sm font-medium text-black/50 underline underline-offset-4 transition-colors hover:text-red-500"
                >
                  Clear cart
                </button>
              )}
            </section>

            <aside className="h-fit rounded-lg border border-black/10 bg-white p-5 md:p-6">
              <h2 className="text-2xl font-bold text-primary">Order Summary</h2>

              <div className="mt-6 space-y-5">
                <div className="flex items-center justify-between text-xl">
                  <span className="text-black/60">Subtotal</span>
                  <span className="font-bold text-primary">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-xl">
                  <span className="text-black/60">Discount (-20%)</span>
                  <span className="font-bold text-red-500">-{formatPrice(discount)}</span>
                </div>
                <div className="flex items-center justify-between text-xl">
                  <span className="text-black/60">Delivery Fee</span>
                  <span className="font-bold text-primary">{formatPrice(deliveryFee)}</span>
                </div>
              </div>

              <div className="my-5 h-px bg-black/10" />

              <div className="flex items-center justify-between">
                <span className="text-xl text-primary">Total</span>
                <span className="text-2xl font-bold text-primary">{formatPrice(total)}</span>
              </div>

              <form onSubmit={applyPromo} className="mt-6 flex gap-3">
                <div className="relative min-w-0 flex-1">
                  <Tag size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" />
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(event) => {
                      setPromoCode(event.target.value);
                      setPromoApplied(false);
                    }}
                    placeholder="Add promo code"
                    className="h-12 w-full rounded-full bg-[#F0F0F0] pl-12 pr-4 text-sm text-primary placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/10"
                  />
                </div>
                <button
                  type="submit"
                  className="h-12 rounded-full bg-primary px-7 text-sm font-medium text-white transition-colors hover:bg-black/80"
                >
                  Apply
                </button>
              </form>

              {promoApplied && (
                <p className="mt-3 text-sm font-medium text-green-600">Promo code applied.</p>
              )}

              <Link
                to="/checkout"
                className="mt-6 inline-flex h-[54px] w-full items-center justify-center gap-3 rounded-full bg-primary px-8 text-sm font-medium text-white transition-colors hover:bg-black/80"
              >
                Go to Checkout
                <ArrowRight size={18} />
              </Link>
            </aside>
          </div>
        )}
      </div>
    </motion.div>
  );
}
