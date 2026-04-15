import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Truck, RotateCcw, Shield, Headphones } from 'lucide-react';
import { productApi, categoryApi } from '../../api/endpoints/productApi';
import ProductCard from '../../components/product/ProductCard';
import ProductGrid from '../../components/product/ProductGrid';
import { SkeletonCard } from '../../components/ui/LoadingSpinner';
import type { CategoryDTO, ProductDTO } from '../../types';

const FEATURES = [
  { icon: Truck, title: 'Miễn phí vận chuyển', desc: 'Đơn hàng từ 500.000đ' },
  { icon: RotateCcw, title: 'Đổi trả dễ dàng', desc: 'Trong vòng 30 ngày' },
  { icon: Shield, title: 'Hàng chính hãng', desc: '100% đảm bảo chất lượng' },
  { icon: Headphones, title: 'Hỗ trợ 24/7', desc: 'Luôn sẵn sàng phục vụ' },
];

export default function HomePage() {
  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ['products', 0, 8, ''],
    queryFn: async () => {
      const res = await productApi.list({ page: 0, size: 8 });
      return res.data.data;
    },
    staleTime: 60000,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await categoryApi.list();
      return res.data.data as CategoryDTO[];
    },
    staleTime: 300000,
  });

  const products: ProductDTO[] = productsData?.content ?? [];
  const categories: CategoryDTO[] = categoriesData ?? [];

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative bg-primary overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-primary opacity-90" />
        <div className="relative container-shop flex flex-col items-start justify-center py-28 md:py-40">
          <span className="text-accent text-xs font-bold uppercase tracking-[0.3em] mb-4">Bộ sưu tập mới</span>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-none tracking-tight mb-6 max-w-xl">
            Phong cách
            <span className="block text-accent">Tinh tế</span>
          </h1>
          <p className="text-gray-300 text-lg mb-10 max-w-md leading-relaxed">
            Khám phá bộ sưu tập thời trang cao cấp — nơi phong cách gặp gỡ chất lượng.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/products" className="btn-accent px-8 py-4 text-sm">
              Mua ngay
            </Link>
            <Link to="/products" className="btn-outline px-8 py-4 text-sm border-white text-white hover:bg-white hover:text-primary">
              Xem bộ sưu tập <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <section className="border-b border-border bg-white">
        <div className="container-shop">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4 py-6 px-4">
                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                  <Icon size={22} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary">{title}</p>
                  <p className="text-xs text-muted">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="container-shop py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="section-subtitle mb-2">Danh mục</p>
              <h2 className="section-title">Khám phá theo danh mục</h2>
            </div>
            <Link to="/products" className="text-sm font-medium text-primary hover:text-accent transition-colors flex items-center gap-1">
              Xem tất cả <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.slice(0, 6).map((cat: CategoryDTO) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.id}`}
                className="group flex flex-col items-center p-6 border border-border hover:border-primary transition-colors bg-white"
              >
                <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center mb-3 group-hover:bg-primary transition-colors">
                  <span className="text-2xl">👕</span>
                </div>
                <span className="text-sm font-medium text-center group-hover:text-accent transition-colors">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* New Arrivals */}
      <section className="bg-surface py-16">
        <div className="container-shop">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="section-subtitle mb-2">Mới nhất</p>
              <h2 className="section-title">Sản phẩm nổi bật</h2>
            </div>
            <Link to="/products" className="text-sm font-medium text-primary hover:text-accent transition-colors flex items-center gap-1">
              Xem tất cả <ArrowRight size={14} />
            </Link>
          </div>
          {loadingProducts ? (
            <ProductGrid>
              {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
            </ProductGrid>
          ) : (
            <ProductGrid>
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </ProductGrid>
          )}
        </div>
      </section>

      {/* Banner mid */}
      <section className="py-16">
        <div className="container-shop">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="relative bg-gray-100 overflow-hidden group cursor-pointer">
              <div className="aspect-[4/3] p-10 flex flex-col justify-end">
                <p className="text-xs font-bold uppercase tracking-widest text-accent mb-2">Bộ sưu tập</p>
                <h3 className="text-3xl font-black text-primary mb-4">Thời trang nam</h3>
                <Link to="/products?search=nam" className="btn-primary px-6 py-2.5 self-start text-xs">
                  Khám phá
                </Link>
              </div>
            </div>
            <div className="relative bg-gray-900 overflow-hidden group cursor-pointer">
              <div className="aspect-[4/3] p-10 flex flex-col justify-end">
                <p className="text-xs font-bold uppercase tracking-widest text-accent mb-2">Bộ sưu tập</p>
                <h3 className="text-3xl font-black text-white mb-4">Thời trang nữ</h3>
                <Link to="/products?search=nữ" className="btn-accent px-6 py-2.5 self-start text-xs">
                  Khám phá
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
