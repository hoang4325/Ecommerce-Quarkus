import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronRight, Minus, Plus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { productApi } from '../../api/endpoints/productApi';
import { cartApi } from '../../api/endpoints/cartApi';
import { useAuthStore } from '../../auth/authStore';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [addedMsg, setAddedMsg] = useState('');
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await productApi.getById(id!);
      return res.data.data!;
    },
    enabled: !!id,
  });

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const handleAddToCart = async () => {
    if (!isAuthenticated() || !data) return;
    setAdding(true);
    try {
      await cartApi.addItem({ productId: data.id, quantity });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
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
        <div className="aspect-[3/4] bg-surface overflow-hidden">
          {data.imageUrl ? (
            <img src={data.imageUrl} alt={data.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag size={64} className="text-gray-300" />
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
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-black text-accent">{formatPrice(data.price)}</span>
          </div>

          <div className="divider" />

          {/* Description */}
          {data.description && (
            <div className="mb-6">
              <p className="text-sm text-gray-600 leading-relaxed">{data.description}</p>
            </div>
          )}

          {/* Quantity selector */}
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-muted mb-3">Số lượng</p>
            <div className="flex items-center gap-0 w-fit border border-border">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-11 h-11 flex items-center justify-center hover:bg-surface transition-colors"
              >
                <Minus size={14} />
              </button>
              <span className="w-12 h-11 flex items-center justify-center text-sm font-semibold border-x border-border">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-11 h-11 flex items-center justify-center hover:bg-surface transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* CTA */}
          {isAuthenticated() ? (
            <div className="flex flex-col gap-3">
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
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Link to="/login" className="btn-outline py-4 text-sm w-full text-center">
                Đăng nhập để mua hàng
              </Link>
            </div>
          )}

          {addedMsg && (
            <div className={`mt-4 p-3 text-sm text-center font-medium ${addedMsg.includes('lỗi') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
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
            <div className="flex gap-2">
              <span className="font-medium text-primary">Trạng thái:</span>
              <span className={data.active ? 'text-green-600' : 'text-red-500'}>
                {data.active ? 'Còn hàng' : 'Hết hàng'}
              </span>
            </div>
          </div>

          <Link to="/products" className="flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors mt-8">
            <ArrowLeft size={14} /> Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </div>
  );
}