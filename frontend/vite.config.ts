import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api/auth': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/api/users': {
        target: 'http://localhost:8090',
        changeOrigin: true,
      },
      '/api/products': {
        target: 'http://localhost:8086',
        changeOrigin: true,
      },
      '/api/categories': {
        target: 'http://localhost:8086',
        changeOrigin: true,
      },
      '/api/cart': {
        target: 'http://localhost:8086',
        changeOrigin: true,
      },
      '/api/orders': {
        target: 'http://localhost:8086',
        changeOrigin: true,
      },
      '/api/admin/orders': {
        target: 'http://localhost:8086',
        changeOrigin: true,
      },
      '/api/payments': {
        target: 'http://localhost:8088',
        changeOrigin: true,
      },
      '/api/inventory': {
        target: 'http://localhost:8087',
        changeOrigin: true,
      },
      '/api/notifications': {
        target: 'http://localhost:8089',
        changeOrigin: true,
      },
    },
  },
});