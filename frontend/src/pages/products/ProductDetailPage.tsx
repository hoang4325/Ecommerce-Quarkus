import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, ChevronRight, Minus, Plus, ShoppingCart, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { productApi } from '../../api/endpoints/productApi';
import { cartApi } from '../../api/endpoints/cartApi';
import { inventoryApi } from '../../api/endpoints/inventoryApi';
import { useAuthStore } from '../../auth/authStore';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import type { ProductDTO } from '../../types';

const FALLBACK_PRODUCTS: ProductDTO[] = [
  {
    id: 'listing-1',
    name: 'Gradient Graphic T-shirt',
    slug: 'gradient-graphic-t-shirt',
    description: 'A soft everyday graphic tee with a clean gradient print, made for easy pairing with denim, shorts, or layered streetwear.',
    price: 1450000,
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=900&auto=format&fit=crop',
    categoryId: 'tshirts',
    categoryName: 'T-shirts',
    active: true,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'listing-2',
    name: 'Polo with Tipping Details',
    slug: 'polo-with-tipping-details',
    description: 'A sharp polo shirt with contrast tipping details and a breathable cotton feel.',
    price: 1800000,
    imageUrl: 'https://images.unsplash.com/photo-1622445275576-721325763afe?q=80&w=900&auto=format&fit=crop',
    categoryId: 'shirts',
    categoryName: 'Shirts',
    active: true,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'listing-3',
    name: 'Black Striped T-shirt',
    slug: 'black-striped-t-shirt',
    description: 'A relaxed striped tee with a bold casual profile and easy all-day comfort.',
    price: 1200000,
    imageUrl: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=900&auto=format&fit=crop',
    categoryId: 'tshirts',
    categoryName: 'T-shirts',
    active: true,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'listing-4',
    name: 'Skinny Fit Jeans',
    slug: 'skinny-fit-jeans',
    description: 'A modern skinny jean with a clean wash, structured fit, and enough stretch for daily movement.',
    price: 2400000,
    imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=900&auto=format&fit=crop',
    categoryId: 'jeans',
    categoryName: 'Jeans',
    active: true,
    createdAt: '',
    updatedAt: '',
  },
];

const COLORS = [
  { name: 'Olive', value: '#4F4631' },
  { name: 'Forest', value: '#314F4A' },
  { name: 'Navy', value: '#31344F' },
];

const SIZES = ['Small', 'Medium', 'Large', 'X-Large'];

const REVIEWS = [
  {
    name: 'Sarah M.',
    text: "Chất lượng tốt hơn tôi mong đợi. Vải có cảm giác chắc chắn mà không quá nặng, và phom dáng giống hệt như trên ảnh sản phẩm.",
  },
  {
    name: 'Alex K.',
    text: 'Món đồ này phù hợp với hầu hết mọi thứ trong tủ đồ của tôi. Nó mang lại cảm giác thoải mái, nhưng vẫn đủ lịch sự để mặc ra ngoài.',
  },
  {
    name: 'James L.',
    text: 'Thiết kế đơn giản, vừa vặn thoải mái, và không bị co rút sau khi giặt. Tôi chắc chắn sẽ mua thêm một màu khác.',
  },
];

function formatPrice(price: number) {
  return `$${Math.round(price / 10000)}`;
}

function Rating({ value = 4.5, size = 22 }: { value?: number; size?: number }) {
  return (
    <div className="flex items-center gap-1 text-[#FFC633]">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} size={size} fill="currentColor" className={index + 1 > Math.ceil(value) ? 'opacity-30' : ''} />
      ))}
      <span className="ml-2 text-sm text-primary">{value}/5</span>
    </div>
  );
}

function RelatedProductCard({ product, index }: { product: ProductDTO; index: number }) {
  const oldPrice = index % 2 === 0 ? Math.round(product.price * 1.3) : null;
  return (
    <article className="group">
      <Link to={`/products/${product.id}`} className="block">
        <div className="aspect-square overflow-hidden rounded-lg bg-[#F0EEED]">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>
        <h3 className="mt-4 line-clamp-2 min-h-[48px] text-lg font-bold leading-6 text-primary">{product.name}</h3>
      </Link>
      <div className="mt-1">
        <Rating value={index % 2 === 0 ? 4.5 : 4.0} size={18} />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="text-2xl font-bold text-primary">{formatPrice(product.price)}</span>
        {oldPrice && <span className="text-2xl font-bold text-black/40 line-through">{formatPrice(oldPrice)}</span>}
      </div>
    </article>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [addedMsg, setAddedMsg] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value);
  const [selectedSize, setSelectedSize] = useState('Large');
  const [selectedImage, setSelectedImage] = useState(0);
  const { isAuthenticated, isAdmin } = useAuthStore();
  const queryClient = useQueryClient();

  const fallbackProduct = FALLBACK_PRODUCTS.find((product) => product.id === id);

  const { data, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (fallbackProduct) return fallbackProduct;
      try {
        const res = await productApi.getById(id!);
        return res.data.data ?? null;
      } catch {
        return null;
      }
    },
    enabled: !!id,
  });

  const { data: relatedData } = useQuery({
    queryKey: ['products-related', data?.categoryId],
    queryFn: async () => {
      const res = await productApi.list({ page: 0, size: 4, categoryId: data?.categoryId ?? '' });
      return res.data.data;
    },
    enabled: !!data && !fallbackProduct,
    staleTime: 60000,
  });

  const { data: inventory } = useQuery({
    queryKey: ['inventory-product', id, isAuthenticated()],
    queryFn: async () => {
      if (fallbackProduct) return { productId: id, productName: fallbackProduct.name, quantity: 24, reservedQuantity: 0, available: 24 };
      try {
        if (isAuthenticated()) {
          const res = await inventoryApi.getByProduct(id!);
          return res.data.data ?? null;
        }
        const res = await inventoryApi.getAvailable(id!);
        const available = (res.data.data as { available: number } | null)?.available ?? -1;
        return available >= 0 ? { productId: id, productName: '', quantity: available, reservedQuantity: 0, available } : null;
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

  const relatedProducts = relatedData?.content?.length ? relatedData.content.slice(0, 4) : FALLBACK_PRODUCTS;
  const oldPrice = data ? Math.round(data.price * 1.32) : null;
  const galleryImages = useMemo(() => {
    if (!data) return [];
    return [
      data.imageUrl,
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=900&auto=format&fit=crop',
    ];
  }, [data]);

  const handleAddToCart = async () => {
    if (!data) return;
    if (!isAuthenticated() && !fallbackProduct) {
      setAddedMsg('Vui lòng đăng nhập để thêm sản phẩm này vào giỏ hàng.');
      setTimeout(() => setAddedMsg(''), 3000);
      return;
    }
    if (outOfStock) {
      setAddedMsg('Sản phẩm này đã hết hàng.');
      setTimeout(() => setAddedMsg(''), 3000);
      return;
    }
    if (available !== null && quantity > available) {
      setAddedMsg(`Chỉ còn ${available} sản phẩm.`);
      setTimeout(() => setAddedMsg(''), 3000);
      return;
    }

    setAdding(true);
    try {
      if (!fallbackProduct) {
        await cartApi.addItem({ productId: data.id, quantity });
        queryClient.invalidateQueries({ queryKey: ['cart'] });
        queryClient.invalidateQueries({ queryKey: ['inventory-product', id] });
      }
      setAddedMsg('Đã thêm vào giỏ hàng.');
      setTimeout(() => setAddedMsg(''), 3000);
    } catch {
      setAddedMsg('Có lỗi xảy ra. Vui lòng thử lại.');
      setTimeout(() => setAddedMsg(''), 3000);
    } finally {
      setAdding(false);
    }
  };

  if (isLoading) return <LoadingSpinner size="lg" />;
  if (!data) {
    return (
      <div className="container-shop py-20 text-center">
        <p className="text-black/60">Không tìm thấy sản phẩm</p>
        <Link to="/products" className="mt-6 inline-flex rounded-full border border-black/10 px-6 py-2.5 text-sm font-medium">
          Quay lại cửa hàng
        </Link>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className="container-shop border-t border-black/10 py-6">
        <nav className="flex items-center gap-2 text-sm text-black/60">
          <Link to="/" className="transition-colors hover:text-primary">Trang chủ</Link>
          <ChevronRight size={16} />
          <Link to="/products" className="transition-colors hover:text-primary">Sản phẩm</Link>
          {data.categoryName && (
            <>
              <ChevronRight size={16} />
              <Link to={`/products?category=${data.categoryId}`} className="transition-colors hover:text-primary">
                {data.categoryName}
              </Link>
            </>
          )}
        </nav>

        <section className="mt-8 grid gap-10 lg:grid-cols-[610px_1fr]">
          <div className="grid gap-4 sm:grid-cols-[152px_1fr]">
            <div className="order-2 grid grid-cols-3 gap-3 sm:order-1 sm:grid-cols-1">
              {galleryImages.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square overflow-hidden rounded-lg bg-[#F0EEED] ${
                    selectedImage === index ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <img src={image} alt={`${data.name} view ${index + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
            <div className="order-1 aspect-square overflow-hidden rounded-lg bg-[#F0EEED] sm:order-2 lg:aspect-[444/530]">
              <img src={galleryImages[selectedImage] ?? data.imageUrl} alt={data.name} className="h-full w-full object-cover" />
            </div>
          </div>

          <div>
            <h1 className="text-[34px] font-black leading-tight text-primary lg:text-[40px]">{data.name.toUpperCase()}</h1>
            <div className="mt-3">
              <Rating value={4.5} />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="text-[32px] font-bold leading-none text-primary">{formatPrice(data.price)}</span>
              {oldPrice && <span className="text-[32px] font-bold leading-none text-black/30 line-through">{formatPrice(oldPrice)}</span>}
              <span className="rounded-full bg-red-500/10 px-3.5 py-1.5 text-sm font-medium text-red-500">-40%</span>
            </div>
            <p className="mt-5 max-w-[590px] text-base leading-6 text-black/60">
              {data.description || 'Sản phẩm này được thiết kế hướng đến sự thoải mái, chất lượng và phong cách mặc hàng ngày.'}
            </p>

            <div className="my-6 h-px bg-black/10" />

            <div>
              <p className="text-base text-black/60">Chọn màu sắc</p>
              <div className="mt-4 flex gap-4">
                {COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setSelectedColor(color.value)}
                    aria-label={color.name}
                    className={`flex h-9 w-9 items-center justify-center rounded-full border border-black/10 ${
                      selectedColor === color.value ? 'ring-2 ring-primary ring-offset-2' : ''
                    }`}
                    style={{ backgroundColor: color.value }}
                  >
                    {selectedColor === color.value && <CheckCircle size={18} className="text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="my-6 h-px bg-black/10" />

            <div>
              <p className="text-base text-black/60">Chọn kích cỡ</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`rounded-full px-6 py-3 text-sm transition-colors ${
                      selectedSize === size ? 'bg-primary text-white' : 'bg-[#F0F0F0] text-black/60 hover:text-primary'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="my-6 h-px bg-black/10" />

            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex h-[52px] items-center justify-between rounded-full bg-[#F0F0F0] px-5 sm:w-[170px]">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="disabled:opacity-30"
                  aria-label="Decrease quantity"
                >
                  <Minus size={18} />
                </button>
                <span className="font-medium text-primary">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
                  disabled={quantity >= maxQty}
                  className="disabled:opacity-30"
                  aria-label="Increase quantity"
                >
                  <Plus size={18} />
                </button>
              </div>
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={adding || outOfStock}
                className="inline-flex h-[52px] flex-1 items-center justify-center gap-2 rounded-full bg-primary px-8 text-sm font-medium text-white transition-colors hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingCart size={18} />
                {outOfStock ? 'Hết hàng' : adding ? 'Đang thêm...' : 'Thêm vào giỏ'}
              </button>
            </div>

            {available !== null && available <= 10 && available > 0 && (
              <p className="mt-3 text-sm font-medium text-orange-600">Chỉ còn {available} sản phẩm trong kho.</p>
            )}

            {addedMsg && (
              <div className={`mt-4 rounded-lg p-3 text-center text-sm font-medium ${
                addedMsg.includes('Added') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {addedMsg}
              </div>
            )}

            {isAdmin() && available !== null && (
              <p className="mt-4 text-xs text-black/50">
                Admin inventory: {inventory?.quantity} total, {inventory?.reservedQuantity} reserved, {available} available.
              </p>
            )}
          </div>
        </section>

        <section className="mt-20">
          <div className="grid grid-cols-3 border-b border-black/10 text-center text-base text-black/60">
            {['Chi tiết sản phẩm', 'Đánh giá & Nhận xét', 'Câu hỏi thường gặp'].map((tab, index) => (
              <button
                key={tab}
                type="button"
                className={`pb-5 ${index === 1 ? 'border-b-2 border-primary font-medium text-primary' : ''}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-primary">Tất cả nhận xét</h2>
              <p className="mt-1 text-sm text-black/60">451 đánh giá đã xác minh</p>
            </div>
            <button type="button" className="h-12 rounded-full bg-primary px-8 text-sm font-medium text-white">
              Viết nhận xét
            </button>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {REVIEWS.map((review) => (
              <article key={review.name} className="rounded-lg border border-black/10 p-7">
                <Rating value={5} size={20} />
                <h3 className="mt-4 flex items-center gap-1 text-xl font-bold text-primary">
                  {review.name}
                  <CheckCircle size={18} fill="#01AB31" className="text-white" />
                </h3>
                <p className="mt-3 text-sm leading-6 text-black/60">{review.text}</p>
                <p className="mt-6 text-sm font-medium text-black/60">Đăng vào ngày 7 tháng 5, 2026</p>
              </article>
            ))}
          </div>
        </section>

        <section className="py-20">
          <h2 className="text-center text-4xl font-black leading-tight text-primary md:text-5xl">CÓ THỂ BẠN CŨNG THÍCH</h2>
          <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
            {relatedProducts.slice(0, 4).map((product, index) => (
              <RelatedProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </section>
      </div>
    </motion.div>
  );
}
