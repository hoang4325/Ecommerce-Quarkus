import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { productApi, categoryApi } from '../../api/endpoints/productApi';
import ProductCard from '../../components/product/ProductCard';
import ProductGrid from '../../components/product/ProductGrid';
import Pagination from '../../components/ui/Pagination';
import { SkeletonCard } from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import type { CategoryDTO } from '../../types';

const PAGE_SIZE = 12;

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const page = parseInt(searchParams.get('page') ?? '0');
  const search = searchParams.get('search') ?? '';
  const categoryId = searchParams.get('category') ?? '';
  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => { setSearchInput(search); }, [search]);

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', page, PAGE_SIZE, search, categoryId],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, size: PAGE_SIZE };
      if (search) params.search = search;
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

  const products = productsData?.content ?? [];
  const totalPages = productsData?.totalPages ?? 0;
  const totalElements = productsData?.totalElements ?? 0;
  const categories: CategoryDTO[] = categoriesData ?? [];

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setParam('search', searchInput.trim());
  };

  const handleCategory = (id: string) => {
    setParam('category', categoryId === id ? '' : id);
  };

  const clearFilters = () => {
    setSearchParams({});
    setSearchInput('');
  };

  const hasFilters = !!(search || categoryId);
  const activeCategoryName = categories.find(c => c.id === categoryId)?.name;

  return (
    <div className="container-shop py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted mb-6">
        <span>Trang chủ</span>
        <span>/</span>
        <span className="text-primary font-medium">
          {activeCategoryName ?? (search ? `Kết quả: "${search}"` : 'Tất cả sản phẩm')}
        </span>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl p-6 overflow-y-auto transform transition-transform duration-300 lg:relative lg:inset-auto lg:z-auto lg:w-60 lg:shadow-none lg:p-0 lg:translate-x-0 lg:flex-shrink-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <span className="font-semibold">Bộ lọc</span>
            <button onClick={() => setSidebarOpen(false)}><X size={20} /></button>
          </div>

          {/* Search */}
          <div className="mb-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-4">Tìm kiếm</h3>
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Tên sản phẩm..."
                className="input flex-1"
              />
              <button type="submit" className="btn-primary px-3 py-3">
                <Search size={14} />
              </button>
            </form>
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-4">Danh mục</h3>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => setParam('category', '')}
                    className={`w-full text-left text-sm py-2 px-3 transition-colors ${!categoryId ? 'bg-primary text-white' : 'hover:bg-surface text-primary'}`}
                  >
                    Tất cả sản phẩm
                  </button>
                </li>
                {categories.map(cat => (
                  <li key={cat.id}>
                    <button
                      onClick={() => handleCategory(cat.id)}
                      className={`w-full text-left text-sm py-2 px-3 transition-colors ${categoryId === cat.id ? 'bg-primary text-white' : 'hover:bg-surface text-primary'}`}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {hasFilters && (
            <button onClick={clearFilters} className="text-sm text-accent underline">
              Xoá bộ lọc
            </button>
          )}
        </aside>

        {/* Sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex items-center gap-2 text-sm font-medium border border-border px-4 py-2.5 hover:border-primary transition-colors lg:hidden"
              >
                <SlidersHorizontal size={14} />
                Bộ lọc
              </button>
              <span className="text-sm text-muted">
                {isLoading ? 'Đang tải...' : `${totalElements} sản phẩm`}
              </span>
              {hasFilters && (
                <button onClick={clearFilters} className="text-xs text-accent flex items-center gap-1">
                  <X size={12} /> Xoá lọc
                </button>
              )}
            </div>
          </div>

          {isLoading ? (
            <ProductGrid cols={3}>
              {Array(PAGE_SIZE).fill(0).map((_, i) => <SkeletonCard key={i} />)}
            </ProductGrid>
          ) : products.length === 0 ? (
            <EmptyState
              message="Không tìm thấy sản phẩm nào"
              action={
                hasFilters ? (
                  <button onClick={clearFilters} className="btn-outline px-6 py-2.5 text-sm">
                    Xoá bộ lọc
                  </button>
                ) : undefined
              }
            />
          ) : (
            <>
              <ProductGrid cols={3}>
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </ProductGrid>
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={(p) => {
                  const next = new URLSearchParams(searchParams);
                  next.set('page', String(p));
                  setSearchParams(next);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}