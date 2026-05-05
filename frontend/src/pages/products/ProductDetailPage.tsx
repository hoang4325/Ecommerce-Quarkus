import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronRight, Minus, Plus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { productApi } from '../../api/endpoints/productApi';
import { cartApi } from '../../api/endpoints/cartApi';
import { inventoryApi } from '../../api/endpoints/inventoryApi';
import { useAuthStore } from '../../auth/authStore';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [addedMsg, setAddedMsg] = useState('');
  const { isAuthenticated, isAdmin } = useAuthStore();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await productApi.getById(id!);
      return res.data.data!;
    },
    enabled: !!id,
  });

  // Fetch inventory:
  // - Logged in users: call full endpoint (returns InventoryDTO)
  // - Guests / not logged in: call public /available endpoint
  const { data: inventory } = useQuery({
    queryKey: ['inventory-product', id, isAuthenticated()],
    queryFn: async () => {
      try {
        if (isAuthenticated()) {
          const res = await inventoryApi.getByProduct(id!);
          return res.data.data ?? null;
        } else {
          // Public endpoint — returns { productId, available }
          const res = await inventoryApi.getAvailable(id!);
          const avail = (res.data.data as { available: number } | null)?.available ?? -1;
          return avail >= 0 ? { productId: id, productName: '', quantity: avail, reservedQuantity: 0, available: avail } : null;
        }
      } catch {
        return null;
      }
    },
    enabled: !!id,
    staleTime: 15000,
    refetchInterval: 30000,
  });

  const available = inventory?.available ?? null;
  const outOfStock = available !== null && available <= 0;
  const maxQty = available !== null ? Math.max(1, available) : 99;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  // Mock logic to show sale UI
  const isSale = data ? data.price > 500000 : false;
  const originalPrice = isSale && data ? data.price * 1.3 : null; // 30% off mock
  const formattedOriginalPrice = originalPrice 
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(originalPrice)
    : null;

  const handleAddToCart = async () => {
    if (!isAuthenticated() || !data) return;
    if (outOfStock) {
      setAddedMsg('Sản phẩm đã hết hàng!');
      setTimeout(() => setAddedMsg(''), 3000);
      return;
    }
    if (available !== null && quantity > available) {
      setAddedMsg(`Chỉ còn ${available} sản phẩm trong kho!`);
      setTimeout(() => setAddedMsg(''), 3000);
      return;
    }
    setAdding(true);
    try {
      await cartApi.addItem({ productId: data.id, quantity });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-product', id] });
      setAddedMsg('Đã thêm vào giỏ hàng!');
      setTimeout(() => setAddedMsg(''), 3000);
    } catch {
      setAddedMsg('Có lỗi, vui lòng thử lại.');
      setTimeout(() => setAddedMsg(''), 3000);
    } finally {
      setAdding(false);
    }
  };

  if (isLoading) return <LoadingSpinner size="lg" />;
  if (isError || !data) return (
    <div className="container-shop py-20 text-center">
      <p className="text-muted">Không tìm thấy sản phẩm</p>
      <Link to="/products" className="btn-outline mt-6 px-6 py-2.5 text-sm inline-flex">Quay lại</Link>
    </div>
  );

  return (
    <div className="container-shop py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted mb-8">
        <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
        <ChevronRight size={14} />
        <Link to="/products" className="hover:text-primary transition-colors">Sản phẩm</Link>
        {data.categoryName && (
          <>
            <ChevronRight size={14} />
            <Link to={`/products?category=${data.categoryId}`} className="hover:text-primary transition-colors">
              {data.categoryName}
            </Link>
          </>
        )}
        <ChevronRight size={14} />
        <span className="text-primary font-medium truncate max-w-[200px]">{data.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
        {/* Image */}
        <div className="aspect-[3/4] bg-surface overflow-hidden relative">
          {data.imageUrl ? (
            <img src={data.imageUrl} alt={data.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag size={64} className="text-gray-300" />
            </div>
          )}
          {/* Out of stock overlay */}
          {outOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-red-600 font-bold text-lg px-6 py-2 tracking-widest uppercase">
                Hết hàng
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          {data.categoryName && (
            <span className="text-xs font-bold uppercase tracking-widest text-muted mb-3">{data.categoryName}</span>
          )}
          <h1 className="text-3xl font-bold text-primary leading-tight mb-4">{data.name}</h1>

          {/* Price */}
          <div className="flex items-end gap-4 mb-6">
            <span className="text-4xl font-black text-accent">{formatPrice(data.price)}</span>
            {formattedOriginalPrice && (
              <span className="text-xl text-gray-400 line-through font-medium mb-1">{formattedOriginalPrice}</span>
            )}
            {isSale && (
              <span className="bg-accent text-white text-xs font-bold px-2 py-1 mb-2 uppercase tracking-widest">-30%</span>
            )}
          </div>

          <div className="divider" />

          {/* Description */}
          {data.description && (
            <div className="mb-6">
              <p className="text-sm text-gray-600 leading-relaxed">{data.description}</p>
            </div>
          )}

          {/* Quantity selector */}
          {!outOfStock && (
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-widest text-muted mb-3">Số lượng</p>
              <div className="flex items-center gap-0 w-fit border border-border">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-11 h-11 flex items-center justify-center hover:bg-surface transition-colors disabled:opacity-40"
                  disabled={quantity <= 1}
                >
                  <Minus size={14} />
                </button>
                <span className="w-12 h-11 flex items-center justify-center text-sm font-semibold border-x border-border">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
                  className="w-11 h-11 flex items-center justify-center hover:bg-surface transition-colors disabled:opacity-40"
                  disabled={quantity >= maxQty}
                >
                  <Plus size={14} />
                </button>
              </div>
              {available !== null && available <= 10 && available > 0 && (
                <p className="text-xs text-orange-500 font-medium mt-2">
                  ⚠ Chỉ còn {available} sản phẩm — đặt hàng ngay!
                </p>
              )}
            </div>
          )}

          {/* CTA */}
          {isAuthenticated() ? (
            <div className="flex flex-col gap-3">
              {outOfStock ? (
                <button
                  disabled
                  className="py-4 text-sm w-full border border-gray-300 text-gray-400 cursor-not-allowed uppercase tracking-widest font-bold"
                >
                  Hết hàng
                </button>
              ) : (
                <>
                  <button
                    onClick={handleAddToCart}
                    disabled={adding}
                    className="btn-outline-accent py-4 text-sm w-full"
                  >
                    <ShoppingBag size={16} className="mr-2" />
                    {adding ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
                  </button>
                  <Link to="/cart" className="btn-accent py-4 text-sm w-full text-center">
                    Mua ngay
                  </Link>
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Link to="/login" className="btn-outline py-4 text-sm w-full text-center">
                Đăng nhập để mua hàng
              </Link>
            </div>
          )}

          {addedMsg && (
            <div className={`mt-4 p-3 text-sm text-center font-medium ${addedMsg.includes('lỗi') || addedMsg.includes('hết') || addedMsg.includes('Chỉ') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {addedMsg}
            </div>
          )}

          <div className="divider" />

          {/* Meta */}
          <div className="space-y-2 text-sm text-muted">
            <div className="flex gap-2">
              <span className="font-medium text-primary">Danh mục:</span>
              <span>{data.categoryName || '—'}</span>
            </div>
            <div className="flex gap-2 items-center">
              <span className="font-medium text-primary">Trạng thái:</span>
              {outOfStock ? (
                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 uppercase tracking-wide">Hết hàng</span>
              ) : available !== null && available <= 10 ? (
                <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-0.5 uppercase tracking-wide">Sắp hết — còn {available}</span>
              ) : (
                <span className="bg-green-100 text-green-600 text-xs font-bold px-2 py-0.5 uppercase tracking-wide">Còn hàng</span>
              )}
            </div>
            {isAdmin() && available !== null && (
              <div className="flex gap-2">
                <span className="font-medium text-primary">Tồn kho:</span>
                <span className="text-gray-700">{inventory?.quantity} (đã đặt: {inventory?.reservedQuantity}, khả dụng: {available})</span>
              </div>
            )}
          </div>

          <Link to="/products" className="flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors mt-8">
            <ArrowLeft size={14} /> Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </div>
  );
}