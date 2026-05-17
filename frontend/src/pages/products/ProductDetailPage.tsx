import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { CheckCircle, ChevronRight, Minus, Plus, ShoppingCart, Star, Send, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  { name: 'Xanh lá', value: '#00C12B' },
  { name: 'Đỏ', value: '#F50606' },
  { name: 'Vàng', value: '#F5DD06' },
  { name: 'Cam', value: '#F57906' },
  { name: 'Xanh lam nhạt', value: '#06CAF5' },
  { name: 'Xanh dương', value: '#063AF5' },
  { name: 'Tím', value: '#7D06F5' },
  { name: 'Hồng', value: '#F506A4' },
  { name: 'Trắng', value: '#FFFFFF' },
  { name: 'Đen', value: '#000000' },
];

const SIZES = ['S', 'M', 'L', 'XL', 'XXL', '3XL'];

// Chọn 4 màu cố định (nhất quán) cho từng sản phẩm dựa theo id
function hashCode(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function getProductColors(id: string) {
  const h = hashCode(id);
  // Pick 4 distinct indices from COLORS using the hash
  const picked: typeof COLORS = [];
  const used = new Set<number>();
  let seed = h;
  while (picked.length < 4) {
    const idx = seed % COLORS.length;
    if (!used.has(idx)) {
      used.add(idx);
      picked.push(COLORS[idx]);
    }
    // LCG-style next step
    seed = (seed * 1664525 + 1013904223) & 0x7fffffff;
  }
  return picked;
}

const REVIEWS_PAGE_SIZE = 6;

function ReviewStarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="text-[#FFC633] transition-transform hover:scale-110"
          aria-label={`${star} sao`}
        >
          <Star size={28} fill={(hovered || value) >= star ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  );
}

function RatingBar({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-12 text-right text-black/60">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/10">
        <div className="h-full rounded-full bg-[#FFC633] transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-black/40">{pct}%</span>
    </div>
  );
}

function formatPrice(price: number) {
  return `${price.toLocaleString('vi-VN')} đ`;
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

// ─── ReviewSection ──────────────────────────────────────────────────────────
function ReviewSection({ productId, isAuthenticated }: { productId: string; isAuthenticated: boolean }) {
  const queryClient = useQueryClient();

  const [reviewPage, setReviewPage] = useState(0);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { data: summary } = useQuery({
    queryKey: ['rating-summary', productId],
    queryFn: () => productApi.getRatingSummary(productId).then((r) => r.data.data),
    enabled: !!productId,
    staleTime: 30000,
  });

  const { data: reviewsData, isLoading: loadingReviews } = useQuery<import('../../types').PagedResponse<import('../../types').ProductReviewDTO> | undefined>({
    queryKey: ['reviews', productId, reviewPage],
    queryFn: () => productApi.getReviews(productId, { page: reviewPage, size: REVIEWS_PAGE_SIZE }).then((r) => r.data.data),
    enabled: !!productId,
    staleTime: 15000,
  });

  const submitMutation = useMutation({
    mutationFn: () => productApi.createReview(productId, { rating: reviewRating, comment: reviewComment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['rating-summary', productId] });
      setReviewComment('');
      setReviewRating(5);
      setFormOpen(false);
      setSubmitMsg({ type: 'success', text: 'Cảm ơn bạn đã gửi đánh giá! 🎉' });
      setTimeout(() => setSubmitMsg(null), 4000);
    },
    onError: () => {
      setSubmitMsg({ type: 'error', text: 'Có lỗi xảy ra. Vui lòng thử lại.' });
      setTimeout(() => setSubmitMsg(null), 4000);
    },
  });

  const reviews = reviewsData?.content ?? [];
  const totalPages = reviewsData?.totalPages ?? 0;
  const totalElements = reviewsData?.totalElements ?? 0;
  const avg = summary?.averageRating ?? 0;
  const ratingCounts = summary?.ratingCounts ?? {};

  function formatDate(iso: string) {
    try {
      return new Date(iso).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return iso;
    }
  }

  return (
    <section className="mt-20">
      {/* Tab bar */}
      <div className="grid grid-cols-3 border-b border-black/10 text-center text-base text-black/60">
        {(['Chi tiết sản phẩm', 'Đánh giá & Nhận xét', 'Câu hỏi thường gặp'] as const).map((tab, i) => (
          <button
            key={tab}
            type="button"
            className={`pb-5 transition-colors ${i === 1 ? 'border-b-2 border-primary font-medium text-primary' : 'hover:text-primary'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Rating summary */}
      {summary && (
        <div className="mt-10 grid gap-8 lg:grid-cols-[220px_1fr]">
          {/* Big score */}
          <div className="flex flex-col items-center justify-center rounded-2xl bg-[#F8F8F8] px-6 py-8">
            <span className="text-6xl font-black text-primary">{avg.toFixed(1)}</span>
            <div className="mt-2 flex gap-1 text-[#FFC633]">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={18} fill={s <= Math.round(avg) ? 'currentColor' : 'none'} />
              ))}
            </div>
            <p className="mt-2 text-sm text-black/50">{totalElements} đánh giá</p>
          </div>
          {/* Bars */}
          <div className="flex flex-col justify-center gap-3 py-4">
            {[5, 4, 3, 2, 1].map((star) => (
              <RatingBar
                key={star}
                label={`${star} ★`}
                count={Number(ratingCounts[String(star)] ?? 0)}
                total={summary.reviewCount}
              />
            ))}
          </div>
        </div>
      )}

      {/* Header row */}
      <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-primary">
          Tất cả nhận xét <span className="text-base font-normal text-black/40">({totalElements})</span>
        </h2>
        {isAuthenticated ? (
          <button
            type="button"
            onClick={() => setFormOpen((v) => !v)}
            className="h-12 rounded-full bg-primary px-8 text-sm font-medium text-white transition-colors hover:bg-black/80"
          >
            {formOpen ? 'Đóng form' : 'Viết nhận xét'}
          </button>
        ) : (
          <Link
            to="/login"
            className="inline-flex h-12 items-center rounded-full border border-black/20 px-8 text-sm font-medium text-primary transition-colors hover:bg-black/5"
          >
            Đăng nhập để đánh giá
          </Link>
        )}
      </div>

      {/* Feedback message */}
      <AnimatePresence>
        {submitMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mt-4 rounded-lg px-5 py-3 text-sm font-medium ${submitMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}
          >
            {submitMsg.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Write review form */}
      <AnimatePresence>
        {formOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-6 rounded-2xl border border-black/10 bg-[#FAFAFA] p-6"
          >
            <h3 className="text-lg font-bold text-primary">Viết nhận xét của bạn</h3>
            <div className="mt-4">
              <p className="mb-2 text-sm text-black/60">Chọn số sao</p>
              <ReviewStarPicker value={reviewRating} onChange={setReviewRating} />
            </div>
            <div className="mt-4">
              <p className="mb-2 text-sm text-black/60">Nhận xét của bạn</p>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                rows={4}
                className="w-full resize-none rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-primary placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button
              type="button"
              onClick={() => submitMutation.mutate()}
              disabled={submitMutation.isPending}
              className="mt-4 inline-flex h-12 items-center gap-2 rounded-full bg-primary px-8 text-sm font-medium text-white transition-colors hover:bg-black/80 disabled:opacity-50"
            >
              <Send size={16} />
              {submitMutation.isPending ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review cards */}
      {loadingReviews ? (
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-black/10 p-7">
              <div className="h-4 w-24 rounded bg-[#F0EEED]" />
              <div className="mt-4 h-5 w-32 rounded bg-[#F0EEED]" />
              <div className="mt-3 h-16 rounded bg-[#F0EEED]" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-black/15 py-16 text-center">
          <Star size={36} className="mx-auto mb-4 text-[#FFC633] opacity-50" />
          <p className="text-lg font-medium text-primary">Chưa có đánh giá nào</p>
          <p className="mt-2 text-sm text-black/50">Hãy là người đầu tiên chia sẻ trải nghiệm!</p>
        </div>
      ) : (
        <motion.div
          className="mt-8 grid gap-5 md:grid-cols-2"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: '-50px' }}
          variants={{ visible: { opacity: 1, transition: { staggerChildren: 0.06 } }, hidden: { opacity: 0 } }}
        >
          {reviews.map((review: import('../../types').ProductReviewDTO) => (
            <motion.article
              key={review.id}
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
              className="rounded-2xl border border-black/10 bg-white p-7 shadow-sm"
            >
              {/* Stars */}
              <div className="flex gap-0.5 text-[#FFC633]">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={18} fill={s <= review.rating ? 'currentColor' : 'none'} />
                ))}
              </div>
              {/* Name */}
              <h3 className="mt-3 flex items-center gap-1.5 text-base font-bold text-primary">
                {review.userName}
                <CheckCircle size={16} fill="#01AB31" className="text-white" />
              </h3>
              {/* Comment */}
              {review.comment && (
                <p className="mt-3 text-sm leading-6 text-black/60">{review.comment}</p>
              )}
              {/* Date */}
              <p className="mt-5 text-xs text-black/35">{formatDate(review.createdAt)}</p>
            </motion.article>
          ))}
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setReviewPage((p) => Math.max(0, p - 1))}
            disabled={reviewPage === 0}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 transition-colors hover:bg-black/5 disabled:opacity-30"
          >
            <ChevronLeft size={18} />
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setReviewPage(i)}
              className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-colors ${reviewPage === i ? 'bg-primary text-white' : 'border border-black/10 hover:bg-black/5'
                }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setReviewPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={reviewPage >= totalPages - 1}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 transition-colors hover:bg-black/5 disabled:opacity-30"
          >
            <ChevronRightIcon size={18} />
          </button>
        </div>
      )}
    </section>
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
  const productColors = useMemo(() => getProductColors(id ?? 'default'), [id]);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [addedMsg, setAddedMsg] = useState('');
  const [selectedColor, setSelectedColor] = useState(() => getProductColors(id ?? 'default')[0].value);
  const [selectedSize, setSelectedSize] = useState('L');
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
    if (data.images && data.images.length > 0) return data.images;
    return [data.imageUrl];
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
                  className={`aspect-square overflow-hidden rounded-lg bg-[#F0EEED] ${selectedImage === index ? 'ring-2 ring-primary' : ''
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
              <div className="mt-4 flex flex-wrap gap-3">
                {productColors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setSelectedColor(color.value)}
                    aria-label={color.name}
                    title={color.name}
                    className={`flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-110 ${color.value === '#FFFFFF' ? 'border border-black/20' : 'border border-transparent'
                      } ${selectedColor === color.value ? 'ring-2 ring-primary ring-offset-2' : ''
                      }`}
                    style={{ backgroundColor: color.value }}
                  >
                    {selectedColor === color.value && (
                      <CheckCircle size={16} className={color.value === '#FFFFFF' || color.value === '#F5DD06' ? 'text-black/60' : 'text-white'} />
                    )}
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
                    className={`rounded-full px-6 py-3 text-sm transition-colors ${selectedSize === size ? 'bg-primary text-white' : 'bg-[#F0F0F0] text-black/60 hover:text-primary'
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
              <div className={`mt-4 rounded-lg p-3 text-center text-sm font-medium ${addedMsg.includes('Added') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
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

        <ReviewSection productId={id!} isAuthenticated={isAuthenticated()} />

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
