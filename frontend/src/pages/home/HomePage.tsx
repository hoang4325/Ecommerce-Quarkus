import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, CheckCircle, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { productApi } from '../../api/endpoints/productApi';
import type { ProductDTO } from '../../types';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop';

const STATS = [
  { value: '200+', label: 'International Brands' },
  { value: '2,000+', label: 'High-Quality Products' },
  { value: '30,000+', label: 'Happy Customers' },
];

const BRAND_LOGOS = ['VERSACE', 'ZARA', 'GUCCI', 'PRADA', 'Calvin Klein'];

const FALLBACK_PRODUCTS: ProductDTO[] = [];

const DRESS_STYLES = [
  {
    name: 'Casual',
    query: 'casual',
    image: 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?q=80&w=900&auto=format&fit=crop',
    wide: false,
  },
  {
    name: 'Formal',
    query: 'formal',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1100&auto=format&fit=crop',
    wide: true,
  },
  {
    name: 'Party',
    query: 'party',
    image: 'https://images.unsplash.com/photo-1506629905607-d9bf04a9fbb8?q=80&w=1100&auto=format&fit=crop',
    wide: true,
  },
  {
    name: 'Gym',
    query: 'gym',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=900&auto=format&fit=crop',
    wide: false,
  },
];

const REVIEWS = [
  {
    name: 'Sarah M.',
    text: "I'm blown away by the quality and style of the clothes I received from SHOP.CO. Every piece feels thoughtfully made and easy to wear.",
  },
  {
    name: 'Alex K.',
    text: "Finding clothes that align with my personal style used to be a challenge. This store made the whole experience simple and sharp.",
  },
  {
    name: 'James L.',
    text: "The range is impressive, from casual essentials to smart pieces. I always find something that fits the exact mood I want.",
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: 'easeOut' as const } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

function formatPrice(price: number) {
  return `$${Math.round(price / 10000)}`;
}

function Rating({ value = 4.5 }: { value?: number }) {
  return (
    <div className="flex items-center gap-1 text-[#FFC633]">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} size={18} fill="currentColor" className={index + 1 > Math.ceil(value) ? 'opacity-30' : ''} />
      ))}
      <span className="ml-2 text-sm text-primary">{value}/5</span>
    </div>
  );
}

function ShopProductCard({ product, index }: { product: ProductDTO; index: number }) {
  const oldPrice = index % 3 === 1 ? Math.round(product.price * 1.25) : null;
  const discount = oldPrice ? Math.round(((oldPrice - product.price) / oldPrice) * 100) : null;

  return (
    <motion.article variants={fadeInUp} className="group">
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
      <div className="mt-2">
        <Rating value={index % 2 === 0 ? 4.5 : 4.0} />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="text-2xl font-bold text-primary">{formatPrice(product.price)}</span>
        {oldPrice && <span className="text-2xl font-bold text-black/40 line-through">{formatPrice(oldPrice)}</span>}
        {discount && (
          <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-500">-{discount}%</span>
        )}
      </div>
    </motion.article>
  );
}

function ProductSection({
  title,
  products,
}: {
  title: string;
  products: ProductDTO[];
}) {
  return (
    <section className="container-shop border-b border-black/10 py-16 last:border-0">
      <motion.h2
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="text-center text-4xl font-black leading-tight text-primary md:text-5xl"
      >
        {title}
      </motion.h2>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4"
      >
        {products.map((product, index) => (
          <ShopProductCard key={`${title}-${product.id}`} product={product} index={index} />
        ))}
      </motion.div>
      <div className="mt-9 flex justify-center">
        <Link
          to="/products"
          className="inline-flex h-[52px] min-w-[218px] items-center justify-center rounded-full border border-black/10 px-8 text-sm font-medium transition-colors hover:border-primary"
        >
          View All
        </Link>
      </div>
    </section>
  );
}

export default function HomePage() {
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', 0, 8, ''],
    queryFn: async () => {
      const res = await productApi.list({ page: 0, size: 8 });
      return res.data.data;
    },
    staleTime: 60000,
  });

  const apiProducts: ProductDTO[] = productsData?.content ?? [];
  const products = apiProducts.length >= 4 ? apiProducts : FALLBACK_PRODUCTS;
  const newArrivals = products.slice(0, 4);
  const topSelling = products.slice(4, 8).length === 4 ? products.slice(4, 8) : FALLBACK_PRODUCTS.slice(4, 8);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45 }}>
      <section className="relative overflow-hidden bg-[#F2F0F1]">
        <div className="container-shop grid min-h-[520px] items-center gap-8 py-10 md:grid-cols-[0.95fr_1.05fr] md:py-0">
          <motion.div
            className="relative z-10 max-w-[610px]"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.h1 variants={fadeInUp} className="max-w-[580px] text-[42px] font-black leading-[0.95] tracking-normal text-primary sm:text-6xl lg:text-[64px]">
              FIND CLOTHES
              <br />
              THAT MATCHES
              <br />
              YOUR STYLE
            </motion.h1>
            <motion.p variants={fadeInUp} className="mt-6 max-w-[545px] text-sm leading-6 text-black/60">
              Browse through our diverse range of meticulously crafted garments, designed
              to bring out your individuality and cater to your sense of style.
            </motion.p>
            <motion.div variants={fadeInUp}>
              <Link to="/products" className="mt-7 inline-flex h-[52px] min-w-[210px] items-center justify-center rounded-full bg-primary px-9 py-4 text-sm font-semibold text-white transition-colors hover:bg-black/80">
                Shop Now
              </Link>
            </motion.div>
            <motion.div variants={fadeInUp} className="mt-10 grid max-w-[610px] grid-cols-3 divide-x divide-black/10">
              {STATS.map((item) => (
                <div key={item.label} className="px-4 first:pl-0">
                  <p className="text-2xl font-bold leading-none text-primary sm:text-[40px]">{item.value}</p>
                  <p className="mt-2 text-xs text-black/60 sm:text-base">{item.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            className="relative min-h-[390px] self-end md:min-h-[520px]"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <img
              src={HERO_IMAGE}
              alt="Fashion models wearing contemporary streetwear"
              className="absolute bottom-0 left-1/2 h-full w-[115%] max-w-none -translate-x-1/2 object-cover object-[50%_20%] mix-blend-multiply md:w-full"
            />
            <span className="absolute right-[8%] top-[12%] h-20 w-20 rotate-45 bg-primary [clip-path:polygon(50%_0,62%_38%,100%_50%,62%_62%,50%_100%,38%_62%,0_50%,38%_38%)] md:h-24 md:w-24" />
            <span className="absolute left-[8%] top-[42%] h-10 w-10 rotate-45 bg-primary [clip-path:polygon(50%_0,62%_38%,100%_50%,62%_62%,50%_100%,38%_62%,0_50%,38%_38%)] md:h-12 md:w-12" />
          </motion.div>
        </div>
      </section>

      <section className="bg-primary">
        <div className="container-shop flex min-h-[92px] flex-wrap items-center justify-center gap-x-14 gap-y-5 py-5 text-white lg:justify-between">
          {BRAND_LOGOS.map((brand) => (
            <span key={brand} className="font-serif text-2xl font-bold leading-none tracking-tight sm:text-3xl lg:text-[34px]">
              {brand}
            </span>
          ))}
        </div>
      </section>

      {isLoading ? (
        <section className="container-shop py-16">
          <div className="h-[420px] animate-pulse rounded-lg bg-[#F0EEED]" />
        </section>
      ) : (
        <>
          <ProductSection title="NEW ARRIVALS" products={newArrivals} />
          <ProductSection title="TOP SELLING" products={topSelling} />
        </>
      )}

      <section className="container-shop py-16">
        <div className="rounded-lg bg-[#F0F0F0] px-6 py-10 md:px-16 md:py-16">
          <motion.h2
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="text-center text-4xl font-black leading-tight text-primary md:text-5xl"
          >
            BROWSE BY DRESS STYLE
          </motion.h2>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="mt-10 grid auto-rows-[190px] grid-cols-1 gap-5 md:grid-cols-3 lg:auto-rows-[250px]"
          >
            {DRESS_STYLES.map((style) => (
              <motion.div key={style.name} variants={fadeInUp} className={style.wide ? 'md:col-span-2' : ''}>
                <Link
                  to={`/products?search=${style.query}`}
                  className="group relative block h-full overflow-hidden rounded-lg bg-white"
                >
                  <img
                    src={style.image}
                    alt={`${style.name} style`}
                    className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/45 to-transparent" />
                  <span className="relative z-10 block p-8 text-3xl font-bold text-primary">{style.name}</span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="container-shop pb-20">
        <div className="flex items-end justify-between gap-6">
          <h2 className="text-4xl font-black leading-tight text-primary md:text-5xl">OUR HAPPY CUSTOMERS</h2>
          <Link to="/products" className="hidden items-center gap-2 text-sm font-semibold md:inline-flex">
            Shop collection <ArrowRight size={18} />
          </Link>
        </div>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mt-10 grid gap-5 md:grid-cols-3"
        >
          {REVIEWS.map((review) => (
            <motion.article key={review.name} variants={fadeInUp} className="rounded-lg border border-black/10 bg-white p-7">
              <div className="flex gap-1 text-[#FFC633]">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} size={20} fill="currentColor" />
                ))}
              </div>
              <h3 className="mt-4 flex items-center gap-1 text-xl font-bold text-primary">
                {review.name}
                <CheckCircle size={18} fill="#01AB31" className="text-white" />
              </h3>
              <p className="mt-3 text-sm leading-6 text-black/60">{review.text}</p>
            </motion.article>
          ))}
        </motion.div>
      </section>
    </motion.div>
  );
}
