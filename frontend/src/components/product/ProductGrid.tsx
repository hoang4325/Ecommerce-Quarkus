import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ProductGridProps {
  children: ReactNode;
  cols?: 2 | 3 | 4;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function ProductGrid({ children, cols = 4 }: ProductGridProps) {
  const colClass = {
    2: 'grid-cols-2 sm:grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  }[cols];

  return (
    <motion.div 
      className={`grid ${colClass} gap-x-4 gap-y-8`}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
    >
      {children}
    </motion.div>
  );
}
