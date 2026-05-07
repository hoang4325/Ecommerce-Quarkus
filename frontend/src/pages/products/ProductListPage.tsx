import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronRight, SlidersHorizontal, Star, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { productApi, categoryApi } from '../../api/endpoints/productApi';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import type { CategoryDTO, ProductDTO } from '../../types';

const PAGE_SIZE = 9;

const FALLBACK_PRODUCTS: ProductDTO[] = [];

const DEFAULT_CATEGORIES = ['T-shirts', 'Shorts', 'Shirts', 'Hoodie', 'Jeans'];
const COLORS = ['#00C12B', '#F50606', '#F5DD06', '#F57906', '#06CAF5', '#063AF5', '#7D06F5', '#F506A4', '#FFFFFF', '#000000'];
const SIZES = ['XX-Small', 'X-Small', 'Small', 'Medium', 'Large', 'X-Large', 'XX-Large', '3X-Large', '4X-Large'];
const STYLES = ['Casual', 'Formal', 'Party', 'Gym'];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
};

function formatPrice(price: number) {
  return `$${Math.round(price / 10000)}`;
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

function FilterPanel({
  categories,
  activeCategoryId,
  activeSize,
  activeColor,
  activeStyle,
  onCategory,
  onSize,
  onColor,
  onStyle,
  onApply,
}: {
  categories: CategoryDTO[];
  activeCategoryId: string;
  activeSize: string;
  activeColor: string;
  activeStyle: string;
  onCategory: (id: string) => void;
  onSize: (size: string) => void;
  onColor: (color: string) => void;
  onStyle: (style: string) => void;
  onApply: () => void;
}) {
  const categoryItems = categories.length
    ? categories.map((category) => ({ label: category.name, id: category.id }))
    : DEFAULT_CATEGORIES.map((label) => ({ label, id: label.toLowerCase() }));

  return (
    <div className="rounded-lg border border-black/10 bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-primary">Bộ lọc</h2>
        <SlidersHorizontal size={20} className="text-black/40" />
      </div>

      <div className="my-6 h-px bg-black/10" />

      <div className="space-y-5">
        {categoryItems.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onCategory(category.id)}
            className={`flex w-full items-center justify-between text-base transition-colors ${
              activeCategoryId === category.id ? 'font-semibold text-primary' : 'text-black/60 hover:text-primary'
            }`}
          >
            {category.label}
            <ChevronRight size={18} />
          </button>
        ))}
      </div>

      <div className="my-6 h-px bg-black/10" />

      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-primary">Giá</h3>
          <ChevronDown size={18} className="rotate-180" />
        </div>
        <div className="relative mt-7 h-6">
          <div className="absolute left-0 right-0 top-2.5 h-1.5 rounded-full bg-[#F0F0F0]" />
          <div className="absolute left-[12%] right-[9%] top-2.5 h-1.5 rounded-full bg-primary" />
          <div className="absolute left-[11%] top-0 h-5 w-5 rounded-full bg-primary" />
          <div className="absolute right-[8%] top-0 h-5 w-5 rounded-full bg-primary" />
          <span className="absolute left-[9%] top-6 text-sm font-medium text-primary">$50</span>
          <span className="absolute right-[4%] top-6 text-sm font-medium text-primary">$200</span>
        </div>
      </div>

      <div className="my-10 h-px bg-black/10" />

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
              aria-label={`Color ${color}`}
              onClick={() => onColor(color)}
              className={`h-9 w-9 rounded-full border transition-transform hover:scale-105 ${
                color === '#FFFFFF' ? 'border-black/20' : 'border-black/10'
              } ${activeColor === color ? 'ring-2 ring-primary ring-offset-2' : ''}`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <div className="my-6 h-px bg-black/10" />

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
              className={`rounded-full px-5 py-2.5 text-sm transition-colors ${
                activeSize === size ? 'bg-primary text-white' : 'bg-[#F0F0F0] text-black/60 hover:text-primary'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="my-6 h-px bg-black/10" />

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
              className={`flex w-full items-center justify-between text-base transition-colors ${
                activeStyle === style ? 'font-semibold text-primary' : 'text-black/60 hover:text-primary'
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

  const page = parseInt(searchParams.get('page') ?? '0');
  const search = searchParams.get('search') ?? '';
  const categoryId = searchParams.get('category') ?? '';
  const selectedSize = searchParams.get('size') ?? '';
  const selectedColor = searchParams.get('color') ?? '';
  const selectedStyle = searchParams.get('style') ?? '';

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', page, PAGE_SIZE, search, categoryId, selectedSize, selectedColor, selectedStyle],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, size: PAGE_SIZE };
      if (search) params.search = search;
      if (categoryId) params.categoryId = categoryId;
      if (selectedSize) params.productSize = selectedSize;
      if (selectedColor) params.color = selectedColor;
      if (selectedStyle) params.dressStyle = selectedStyle;
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
  const apiProducts = productsData?.content ?? [];
  const products = apiProducts.length ? apiProducts : FALLBACK_PRODUCTS;
  const totalPages = productsData?.totalPages ?? 1;
  const totalElements = productsData?.totalElements ?? products.length;

  const activeCategoryName = useMemo(() => {
    return categories.find((category) => category.id === categoryId)?.name ?? search ?? selectedStyle ?? 'Casual';
  }, [categories, categoryId, search, selectedStyle]);

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

  const clearFilters = () => {
    setSearchParams({});
  };

  const filterPanel = (
    <FilterPanel
      categories={categories}
      activeCategoryId={categoryId}
      activeSize={selectedSize}
      activeColor={selectedColor}
      activeStyle={selectedStyle}
      onCategory={handleCategory}
      onSize={(size) => handleVisualParam('size', size)}
      onColor={(color) => handleVisualParam('color', color)}
      onStyle={(style) => handleVisualParam('style', style)}
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
                  Hiển thị 1-{Math.min(products.length, PAGE_SIZE)} trong {totalElements} Sản phẩm
                </p>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F0F0F0] lg:hidden"
                  aria-label="Open filters"
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
                message="Không tìm thấy sản phẩm nào"
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
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={(nextPage) => {
                    const next = new URLSearchParams(searchParams);
                    next.set('page', String(nextPage));
                    setSearchParams(next);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </>
            )}
          </section>
        </div>
      </div>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[88vh] overflow-y-auto rounded-t-[20px] bg-white p-4 lg:hidden"
            >
              <div className="mb-4 flex items-center justify-between px-1">
                <h2 className="text-xl font-bold text-primary">Bộ lọc</h2>
                <button type="button" onClick={() => setSidebarOpen(false)} aria-label="Close filters">
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
