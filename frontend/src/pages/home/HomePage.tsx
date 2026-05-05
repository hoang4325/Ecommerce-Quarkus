import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Truck, RotateCcw, CreditCard, Headphones } from 'lucide-react';
import { motion } from 'framer-motion';
import { productApi, categoryApi } from '../../api/endpoints/productApi';
import ProductCard from '../../components/product/ProductCard';
import ProductGrid from '../../components/product/ProductGrid';
import { SkeletonCard } from '../../components/ui/LoadingSpinner';
import type { ProductDTO, CategoryDTO } from '../../types';

const FEATURES = [
  { icon: Truck, title: 'Miễn phí vận chuyển', desc: 'Đơn hàng từ 500.000đ' },
  { icon: RotateCcw, title: 'Đổi hàng dễ dàng', desc: 'Trong vòng 30 ngày' },
  { icon: CreditCard, title: 'Thanh toán đa dạng', desc: 'COD, Thẻ, VNPay, Momo' },
  { icon: Headphones, title: 'Hỗ trợ nhanh', desc: 'Tư vấn 24/7' },
];

const CATEGORY_IMAGES = [
  'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=500&q=80',
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80',
  'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&q=80',
  'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&q=80',
  'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&q=80',
  'https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=500&q=80',
];

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero Banner */}
      <section className="relative bg-primary overflow-hidden h-[80vh] min-h-[600px] flex items-center">
        <motion.div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=1920&auto=format&fit=crop')" }}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <motion.div
          className="relative container-shop flex flex-col items-start justify-center w-full"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.span variants={fadeInUp} className="text-accent text-sm font-bold uppercase tracking-[0.4em] mb-4">Bộ sưu tập Xuân Hè 2026</motion.span>
          <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[1.1] tracking-tighter mb-6 max-w-2xl">
            PHONG CÁCH <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-500">ĐÀN ÔNG</span>
          </motion.h1>
          <motion.p variants={fadeInUp} className="text-gray-300 text-lg md:text-xl mb-10 max-w-md leading-relaxed font-light">
            Sự kết hợp hoàn hảo giữa nét lịch lãm cổ điển và sự năng động của thời trang đương đại.
          </motion.p>
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4">
            <Link to="/products" className="bg-white text-primary px-10 py-4 text-sm font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors">
              Mua ngay
            </Link>
            <Link to="/products?search=bộ+sưu+tập" className="border border-white text-white px-10 py-4 text-sm font-bold uppercase tracking-widest hover:bg-white hover:text-primary transition-colors flex items-center justify-center">
              Khám phá <ArrowRight size={16} className="ml-2" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Feature strip */}
      <section className="border-b border-border bg-white">
        <div className="container-shop">
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-border"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <motion.div variants={fadeInUp} key={title} className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 sm:gap-4 py-8 px-4">
                <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center flex-shrink-0">
                  <Icon size={24} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-primary uppercase tracking-wide mb-1">{title}</p>
                  <p className="text-xs text-muted font-medium">{desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Categories */}
      {categories.length > 0 && (
        <section className="container-shop py-20">
          <motion.div
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl font-black text-primary uppercase tracking-widest">Danh mục nổi bật</h2>
            <div className="w-16 h-1 bg-accent mx-auto mt-4"></div>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {categories.slice(0, 6).map((cat, index) => (
              <motion.div variants={fadeInUp} key={cat.id}>
                <Link
                  to={`/products?category=${cat.id}`}
                  className="group relative block aspect-[3/4] overflow-hidden bg-gray-100 h-full"
                >
                  <img
                    src={CATEGORY_IMAGES[index % CATEGORY_IMAGES.length]}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                    <span className="text-white font-bold text-sm uppercase tracking-widest text-center group-hover:text-accent transition-colors">
                      {cat.name}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      {/* New Arrivals */}
      <section className="bg-surface py-20">
        <div className="container-shop">
          <motion.div
            className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <div>
              <h2 className="text-3xl font-black text-primary uppercase tracking-widest">Sản phẩm mới</h2>
              <div className="w-16 h-1 bg-accent mt-4"></div>
            </div>
            <Link to="/products" className="text-sm font-bold text-primary hover:text-accent transition-colors uppercase tracking-widest flex items-center gap-2 border-b-2 border-primary hover:border-accent pb-1">
              Xem tất cả <ArrowRight size={16} />
            </Link>
          </motion.div>

          {loadingProducts ? (
            <ProductGrid cols={4}>
              {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
            </ProductGrid>
          ) : (
            <ProductGrid cols={4}>
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </ProductGrid>
          )}
        </div>
      </section>

      {/* Mid Banners */}
      <section className="container-shop py-20">
        <motion.div
          className="grid md:grid-cols-2 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div variants={fadeInUp}>
            <Link to="/products?search=công+sở" className="group relative overflow-hidden aspect-[4/3] md:aspect-[3/2] block bg-gray-900">
              <img
                src="https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800&q=80"
                alt="Thời trang công sở"
                className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-105 group-hover:opacity-60 transition-all duration-700"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                <span className="text-white font-bold text-3xl md:text-4xl uppercase tracking-widest mb-4">Lịch lãm</span>
                <span className="text-sm font-medium text-white uppercase tracking-[0.3em] border border-white px-6 py-2 group-hover:bg-white group-hover:text-primary transition-colors">
                  Thời trang công sở
                </span>
              </div>
            </Link>
          </motion.div>
          <motion.div variants={fadeInUp}>
            <Link to="/products?search=casual" className="group relative overflow-hidden aspect-[4/3] md:aspect-[3/2] block bg-gray-900">
              <img
                src="https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=800&q=80"
                alt="Thời trang dạo phố"
                className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-105 group-hover:opacity-60 transition-all duration-700"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                <span className="text-white font-bold text-3xl md:text-4xl uppercase tracking-widest mb-4">Năng động</span>
                <span className="text-sm font-medium text-white uppercase tracking-[0.3em] border border-white px-6 py-2 group-hover:bg-white group-hover:text-primary transition-colors">
                  Phong cách dạo phố
                </span>
              </div>
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </motion.div>
  );
}
