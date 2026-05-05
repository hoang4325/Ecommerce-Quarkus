import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ProductDTO } from '../../types';
import { cartApi } from '../../api/endpoints/cartApi';
import { useAuthStore } from '../../auth/authStore';
import { useQueryClient } from '@tanstack/react-query';

interface ProductCardProps {
  product: ProductDTO;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } }
};

export default function ProductCard({ product }: ProductCardProps) {
  const [adding, setAdding] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated()) return;
    setAdding(true);
    try {
      await cartApi.addItem({ productId: product.id, quantity: 1 });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    } catch {
      // silently fail – user will see error on product detail
    } finally {
      setAdding(false);
    }
  };

  const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price);

  // Mock logic to show sale UI
  const isSale = product.price > 500000;
  const originalPrice = isSale ? product.price * 1.3 : null; // 30% off mock
  const formattedOriginalPrice = originalPrice
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(originalPrice)
    : null;

  return (
    <motion.div variants={itemVariants} className="group relative bg-white flex flex-col h-full border border-transparent hover:border-gray-200 transition-colors p-2 pb-4">
      {/* Image Container */}
      <div className="relative overflow-hidden aspect-[3/4] bg-surface block mb-3">
        {isSale && (
          <div className="absolute top-2 left-2 z-10 bg-accent text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest">
            -30%
          </div>
        )}
        <Link to={`/products/${product.id}`} className="block w-full h-full">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <ShoppingBag size={40} className="text-gray-300" />
            </div>
          )}
        </Link>

        {/* Overlay actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-end justify-center gap-2 p-3 opacity-0 group-hover:opacity-100 pointer-events-none">
          {isAuthenticated() && (
            <button
              onClick={handleAddToCart}
              disabled={adding}
              className="flex-1 bg-white text-primary text-xs font-bold uppercase tracking-wide py-3 hover:bg-primary hover:text-white transition-colors duration-300 flex items-center justify-center gap-2 pointer-events-auto shadow-lg"
            >
              <ShoppingBag size={14} />
              {adding ? 'Đang thêm...' : 'Thêm vào giỏ'}
            </button>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 px-1 text-center">
        {product.categoryName && (
          <p className="text-[10px] text-muted uppercase tracking-[0.2em] mb-1.5">{product.categoryName}</p>
        )}
        <Link to={`/products/${product.id}`} className="block mb-2">
          <h3 className="text-sm font-semibold text-primary leading-snug hover:text-accent transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <div className="mt-auto flex flex-col items-center justify-center gap-1">
          <span className="text-price text-sm font-black">{formattedPrice}</span>
          {formattedOriginalPrice && (
            <span className="text-price-old text-xs text-gray-400 font-medium">{formattedOriginalPrice}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
