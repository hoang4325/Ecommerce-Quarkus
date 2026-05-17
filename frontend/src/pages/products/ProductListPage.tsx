import { useMemo, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronRight, SlidersHorizontal, Star, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { productApi, categoryApi } from '../../api/endpoints/productApi';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import type { CategoryDTO, ProductDTO } from '../../types';

const PAGE_SIZE = 9;
const MIN_PRICE = 0;
const MAX_PRICE = 2000000;

const DEFAULT_CATEGORIES = ['T-shirts', 'Shorts', 'Shirts', 'Hoodie', 'Jeans'];
const COLORS = ['#00C12B', '#F50606', '#F5DD06', '#F57906', '#06CAF5', '#063AF5', '#7D06F5', '#F506A4', '#FFFFFF', '#000000'];
const COLOR_NAMES: Record<string, string> = {
  '#00C12B': 'Xanh lá', '#F50606': 'Đỏ', '#F5DD06': 'Vàng', '#F57906': 'Cam',
  '#06CAF5': 'Xanh dương nhạt', '#063AF5': 'Xanh dương', '#7D06F5': 'Tím',
  '#F506A4': 'Hồng', '#FFFFFF': 'Trắng', '#000000': 'Đen',
};
const SIZES = ['S', 'M', 'L', 'XL', 'XXL', '3XL'];
const STYLES = ['Casual', 'Formal', 'Party', 'Gym'];

// Helper: normalize color filter value — URL stores hex, product.color is hex too
function matchColor(productColor: string | undefined, filter: string) {
  if (!filter) return true;
  if (!productColor) return false;
  return productColor.toLowerCase() === filter.toLowerCase();
}

// Helper: size filter — product.productSize may be comma-separated or single
function matchSize(productSize: string | undefined, filter: string) {
  if (!filter) return true;
  if (!productSize) return false;
  return productSize.split(/[,|/]+/).map(s => s.trim().toUpperCase()).includes(filter.toUpperCase());
}

// Helper: style filter
function matchStyle(productStyle: string | undefined, filter: string) {
  if (!filter) return true;
  if (!productStyle) return false;
  return productStyle.toLowerCase() === filter.toLowerCase();
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
};

function formatPrice(price: number) {
  return `${price.toLocaleString('vi-VN')} đ`;
}

function Rating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1 text-[#FFC633]">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} size={16} fill="currentColor" className={index + 1 > Math.ceil(value) ? 'opacity-30' : ''} />
      ))}
      <span className="ml-1 text-xs text-primary">{value}/5</span>
    </div>
  );
}

function ListingProductCard({ product, index }: { product: ProductDTO; index: number }) {
  const rating = [3.5, 4.5, 4.0, 4.5, 4.5, 3.5, 4.0, 4.5, 4.0][index % 9];
  const oldPrice = index % 3 !== 1 ? Math.round(product.price * (index % 2 === 0 ? 1.67 : 1.2)) : null;
  const discount = oldPrice ? Math.round(((oldPrice - product.price) / oldPrice) * 100) : null;

  return (
    <motion.article variants={cardVariants} className="group">
      <Link to={`/products/${product.id}`} className="block">
        <div className="aspect-square overflow-hidden rounded-lg bg-[#F0EEED]">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>
        <h3 className="mt-4 line-clamp-2 min-h-[48px] text-base font-bold leading-6 text-primary lg:text-xl">
          {product.name}
        </h3>
      </Link>
      <div className="mt-1">
        <Rating value={rating} />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="text-xl font-bold text-primary lg:text-2xl">{formatPrice(product.price)}</span>
        {oldPrice && <span className="text-xl font-bold text-black/40 line-through lg:text-2xl">{formatPrice(oldPrice)}</span>}
        {discount && (
          <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-500">-{discount}%</span>
        )}
      </div>
    </motion.article>
  );
}

// Dual-handle price range slider
function PriceRangeSlider({
  minVal, maxVal, onChange,
}: { minVal: number; maxVal: number; onChange: (min: number, max: number) => void }) {
  const pct = (v: number) => Math.round(((v - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100);

  const handleMin = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), maxVal - 50000);
    onChange(val, maxVal);
  }, [maxVal, onChange]);

  const handleMax = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), minVal + 50000);
    onChange(minVal, val);
  }, [minVal, onChange]);

  return (
    <div>
      <div className="relative mt-7 h-6 select-none">
        {/* Track background */}
        <div className="absolute left-0 right-0 top-2.5 h-1.5 rounded-full bg-[#F0F0F0]" />
        {/* Active range */}
        <div
          className="absolute top-2.5 h-1.5 rounded-full bg-primary"
          style={{ left: `${pct(minVal)}%`, right: `${100 - pct(maxVal)}%` }}
        />
        {/* Min thumb */}
        <input
          type="range" min={MIN_PRICE} max={MAX_PRICE} step={10000}
          value={minVal} onChange={handleMin}
          className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent opacity-0"
          style={{ zIndex: minVal > MAX_PRICE - 100000 ? 5 : 3 }}
        />
        {/* Max thumb */}
        <input
          type="range" min={MIN_PRICE} max={MAX_PRICE} step={10000}
          value={maxVal} onChange={handleMax}
          className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent opacity-0"
          style={{ zIndex: 4 }}
        />
        {/* Min thumb visual */}
        <div
          className="pointer-events-none absolute top-0 h-5 w-5 -translate-x-1/2 rounded-full bg-primary shadow-md"
          style={{ left: `${pct(minVal)}%` }}
        />
        {/* Max thumb visual */}
        <div
          className="pointer-events-none absolute top-0 h-5 w-5 -translate-x-1/2 rounded-full bg-primary shadow-md"
          style={{ left: `${pct(maxVal)}%` }}
        />
      </div>
      <div className="mt-6 flex justify-between text-sm font-medium text-primary">
        <span>{formatPrice(minVal)}</span>
        <span>{formatPrice(maxVal)}</span>
      </div>
    </div>
  );
}

function FilterPanel({
  categories,
  activeCategoryId,
  activeSize,
  activeColor,
  activeStyle,
  priceMin,
  priceMax,
  onCategory,
  onSize,
  onColor,
  onStyle,
  onPriceChange,
  onApply,
}: {
  categories: CategoryDTO[];
  activeCategoryId: string;
  activeSize: string;
  activeColor: string;
  activeStyle: string;
  priceMin: number;
  priceMax: number;
  onCategory: (id: string) => void;
  onSize: (size: string) => void;
  onColor: (color: string) => void;
  onStyle: (style: string) => void;
  onPriceChange: (min: number, max: number) => void;
  onApply: () => void;
}) {
  const categoryItems = categories.length
    ? categories.map((c) => ({ label: c.name, id: c.id }))
    : DEFAULT_CATEGORIES.map((label) => ({ label, id: label.toLowerCase() }));

  return (
    <div className="rounded-lg border border-black/10 bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-primary">Bộ lọc</h2>
        <SlidersHorizontal size={20} className="text-black/40" />
      </div>

      <div className="my-6 h-px bg-black/10" />

      {/* Categories */}
      <div className="space-y-5">
        {categoryItems.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onCategory(category.id)}
            className={`flex w-full items-center justify-between text-base transition-colors ${activeCategoryId === category.id ? 'font-semibold text-primary' : 'text-black/60 hover:text-primary'
              }`}
          >
            {category.label}
            <ChevronRight size={18} />
          </button>
        ))}
      </div>

      <div className="my-6 h-px bg-black/10" />

      {/* Price */}
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-primary">Giá</h3>
          <ChevronDown size={18} className="rotate-180" />
        </div>
        <PriceRangeSlider minVal={priceMin} maxVal={priceMax} onChange={onPriceChange} />
      </div>

      <div className="my-10 h-px bg-black/10" />

      {/* Colors */}
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-primary">Màu sắc</h3>
          <ChevronDown size={18} className="rotate-180" />
        </div>
        <div className="mt-4 flex flex-wrap gap-4">
          {COLORS.map((color) => (
            <button
              key={color}
              type="button"
              title={COLOR_NAMES[color]}
              aria-label={`Màu ${COLOR_NAMES[color]}`}
              onClick={() => onColor(color)}
              className={`h-9 w-9 rounded-full border transition-transform hover:scale-105 ${color === '#FFFFFF' ? 'border-black/20' : 'border-black/10'
                } ${activeColor === color ? 'ring-2 ring-primary ring-offset-2' : ''}`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        {activeColor && (
          <p className="mt-2 text-xs text-black/50">
            Đang lọc: <span className="font-semibold text-primary">{COLOR_NAMES[activeColor]}</span>
          </p>
        )}
      </div>

      <div className="my-6 h-px bg-black/10" />

      {/* Sizes */}
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-primary">Kích cỡ</h3>
          <ChevronDown size={18} className="rotate-180" />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => onSize(size)}
              className={`rounded-full px-5 py-2.5 text-sm transition-colors ${activeSize === size ? 'bg-primary text-white' : 'bg-[#F0F0F0] text-black/60 hover:text-primary'
                }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="my-6 h-px bg-black/10" />

      {/* Styles */}
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-primary">Phong cách</h3>
          <ChevronDown size={18} className="rotate-180" />
        </div>
        <div className="mt-5 space-y-5">
          {STYLES.map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => onStyle(style)}
              className={`flex w-full items-center justify-between text-base transition-colors ${activeStyle === style ? 'font-semibold text-primary' : 'text-black/60 hover:text-primary'
                }`}
            >
              {style}
              <ChevronRight size={18} />
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onApply}
        className="mt-6 h-12 w-full rounded-full bg-primary text-sm font-medium text-white transition-colors hover:bg-black/80"
      >
        Áp dụng
      </button>
    </div>
  );
}

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [priceMin, setPriceMin] = useState(MIN_PRICE);
  const [priceMax, setPriceMax] = useState(MAX_PRICE);

  const page = parseInt(searchParams.get('page') ?? '0');
  const search = searchParams.get('search') ?? '';
  const categoryId = searchParams.get('category') ?? '';
  const selectedSize = searchParams.get('size') ?? '';
  const selectedColor = searchParams.get('color') ?? '';
  const selectedStyle = searchParams.get('style') ?? '';

  // Fetch ALL products for category/search, then filter client-side
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products-all', search, categoryId],
    queryFn: async () => {
      const params: Record<string, string | number> = { page: 0, size: 1000 };
      if (search) params.search = search;
      if (categoryId) params.categoryId = categoryId;
      const res = await productApi.list(params);
      return res.data.data;
    },
    staleTime: 30000,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await categoryApi.list();
      return res.data.data as CategoryDTO[];
    },
    staleTime: 300000,
  });

  const categories = useMemo(() => categoriesData ?? [], [categoriesData]);
  const allProducts = productsData?.content ?? [];

  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      if (product.price < priceMin || product.price > priceMax) return false;
      if (!matchColor(product.color, selectedColor)) return false;
      if (!matchSize(product.productSize, selectedSize)) return false;
      if (!matchStyle(product.dressStyle, selectedStyle)) return false;
      return true;
    });
  }, [allProducts, priceMin, priceMax, selectedColor, selectedSize, selectedStyle]);

  const totalElements = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const products = filteredProducts.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  const activeCategoryName = useMemo(() => {
    return categories.find((c) => c.id === categoryId)?.name ?? search ?? '';
  }, [categories, categoryId, search]);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  const handleCategory = (id: string) => {
    setParam('category', categoryId === id ? '' : id);
  };

  const handleVisualParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (searchParams.get(key) === value) next.delete(key);
    else next.set(key, value);
    next.delete('page');
    setSearchParams(next);
  };

  const handlePriceChange = useCallback((min: number, max: number) => {
    setPriceMin(min);
    setPriceMax(max);
    const next = new URLSearchParams(searchParams);
    next.delete('page');
    setSearchParams(next);
  }, [searchParams, setSearchParams]);

  const clearFilters = () => {
    setPriceMin(MIN_PRICE);
    setPriceMax(MAX_PRICE);
    setSearchParams({});
  };

  const hasActiveFilters = !!(selectedColor || selectedSize || selectedStyle ||
    priceMin > MIN_PRICE || priceMax < MAX_PRICE);

  const filterPanel = (
    <FilterPanel
      categories={categories}
      activeCategoryId={categoryId}
      activeSize={selectedSize}
      activeColor={selectedColor}
      activeStyle={selectedStyle}
      priceMin={priceMin}
      priceMax={priceMax}
      onCategory={handleCategory}
      onSize={(size) => handleVisualParam('size', size)}
      onColor={(color) => handleVisualParam('color', color)}
      onStyle={(style) => handleVisualParam('style', style)}
      onPriceChange={handlePriceChange}
      onApply={() => setSidebarOpen(false)}
    />
  );

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className="container-shop border-t border-black/10 py-6">
        <nav className="flex items-center gap-2 text-sm text-black/60">
          <Link to="/" className="transition-colors hover:text-primary">Trang chủ</Link>
          <ChevronRight size={16} />
          <span className="font-medium text-primary">{activeCategoryName || 'Sản phẩm'}</span>
        </nav>

        <div className="mt-6 grid gap-8 lg:grid-cols-[295px_1fr]">
          <aside className="hidden lg:block">{filterPanel}</aside>

          <section className="min-w-0">
            <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
              <h1 className="text-[32px] font-black leading-none text-primary md:text-[40px]">
                {activeCategoryName || 'Sản phẩm'}
              </h1>
              <div className="flex items-center gap-3">
                <p className="hidden text-sm text-black/60 sm:block">
                  Hiển thị {products.length > 0 ? safePage * PAGE_SIZE + 1 : 0}-{Math.min((safePage + 1) * PAGE_SIZE, totalElements)} trong {totalElements} Sản phẩm
                </p>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F0F0F0] lg:hidden"
                  aria-label="Mở bộ lọc"
                >
                  <SlidersHorizontal size={18} />
                </button>
                <div className="hidden items-center gap-1 text-sm text-black/60 md:flex">
                  Sắp xếp:
                  <button type="button" className="inline-flex items-center gap-1 font-medium text-primary">
                    Phổ biến nhất <ChevronDown size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Active filter chips */}
            {hasActiveFilters && (
              <div className="mb-4 flex flex-wrap gap-2">
                {selectedColor && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-primary">
                    <span className="inline-block h-3 w-3 rounded-full border border-black/10" style={{ backgroundColor: selectedColor }} />
                    {COLOR_NAMES[selectedColor]}
                    <button type="button" onClick={() => handleVisualParam('color', selectedColor)} aria-label="Xóa lọc màu"><X size={12} /></button>
                  </span>
                )}
                {selectedSize && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-primary">
                    {selectedSize}
                    <button type="button" onClick={() => handleVisualParam('size', selectedSize)} aria-label="Xóa lọc kích cỡ"><X size={12} /></button>
                  </span>
                )}
                {selectedStyle && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-primary">
                    {selectedStyle}
                    <button type="button" onClick={() => handleVisualParam('style', selectedStyle)} aria-label="Xóa lọc phong cách"><X size={12} /></button>
                  </span>
                )}
                {(priceMin > MIN_PRICE || priceMax < MAX_PRICE) && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-primary">
                    {formatPrice(priceMin)} – {formatPrice(priceMax)}
                    <button type="button" onClick={() => { setPriceMin(MIN_PRICE); setPriceMax(MAX_PRICE); }} aria-label="Xóa lọc giá"><X size={12} /></button>
                  </span>
                )}
                <button type="button" onClick={clearFilters} className="text-xs text-black/50 underline hover:text-primary">
                  Xóa tất cả
                </button>
              </div>
            )}

            {isLoading ? (
              <div className="grid grid-cols-2 gap-x-5 gap-y-9 xl:grid-cols-3">
                {Array.from({ length: PAGE_SIZE }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="aspect-square rounded-lg bg-[#F0EEED]" />
                    <div className="mt-4 h-5 w-3/4 rounded bg-[#F0EEED]" />
                    <div className="mt-3 h-5 w-1/2 rounded bg-[#F0EEED]" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <EmptyState
                message="Không tìm thấy sản phẩm nào phù hợp với bộ lọc"
                action={
                  <button type="button" onClick={clearFilters} className="rounded-full border border-black/10 px-6 py-2.5 text-sm font-medium">
                    Xóa bộ lọc
                  </button>
                }
              />
            ) : (
              <>
                <motion.div
                  variants={{ visible: { opacity: 1, transition: { staggerChildren: 0.07 } }, hidden: { opacity: 0 } }}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-2 gap-x-5 gap-y-9 xl:grid-cols-3"
                >
                  {products.map((product, index) => (
                    <ListingProductCard key={product.id} product={product} index={index} />
                  ))}
                </motion.div>
                <div className="mt-12 pb-12 flex justify-center">
                  <Pagination
                    page={safePage}
                    totalPages={totalPages}
                    onPageChange={(nextPage) => {
                      const next = new URLSearchParams(searchParams);
                      next.set('page', String(nextPage));
                      setSearchParams(next);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
                </div>
              </>
            )}
          </section>
        </div>
      </div>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[88vh] overflow-y-auto rounded-t-[20px] bg-white p-4 lg:hidden"
            >
              <div className="mb-4 flex items-center justify-between px-1">
                <h2 className="text-xl font-bold text-primary">Bộ lọc</h2>
                <button type="button" onClick={() => setSidebarOpen(false)} aria-label="Đóng bộ lọc">
                  <X size={24} className="text-black/50" />
                </button>
              </div>
              {filterPanel}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
