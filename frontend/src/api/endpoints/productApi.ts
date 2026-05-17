import apiClient from '../client';
import type {
  ApiResponse,
  PagedResponse,
  ProductDTO,
  CreateProductRequest,
  UpdateProductRequest,
  ProductReviewDTO,
  ProductRatingSummaryDTO,
  CreateProductReviewRequest,
  UpdateProductReviewRequest,
  CategoryDTO,
  CreateCategoryRequest,
} from '../../types';

export const productApi = {
  list(params?: Record<string, string | number | undefined>) {
    return apiClient.get<ApiResponse<PagedResponse<ProductDTO>>>('/api/products', { params });
  },

  getById(id: string) {
    return apiClient.get<ApiResponse<ProductDTO>>(`/api/products/${id}`);
  },

  create(data: CreateProductRequest) {
    return apiClient.post<ApiResponse<ProductDTO>>('/api/products', data);
  },

  update(id: string, data: UpdateProductRequest) {
    return apiClient.put<ApiResponse<ProductDTO>>(`/api/products/${id}`, data);
  },

  delete(id: string) {
    return apiClient.delete(`/api/products/${id}`);
  },

  getReviews(id: string, params?: { page?: number; size?: number }) {
    return apiClient.get<ApiResponse<PagedResponse<ProductReviewDTO>>>(`/api/products/${id}/reviews`, { params });
  },

  getRatingSummary(id: string) {
    return apiClient.get<ApiResponse<ProductRatingSummaryDTO>>(`/api/products/${id}/rating-summary`);
  },

  createReview(id: string, data: CreateProductReviewRequest) {
    return apiClient.post<ApiResponse<ProductReviewDTO>>(`/api/products/${id}/reviews`, data);
  },

  updateReview(id: string, reviewId: string, data: UpdateProductReviewRequest) {
    return apiClient.put<ApiResponse<ProductReviewDTO>>(`/api/products/${id}/reviews/${reviewId}`, data);
  },

  deleteReview(id: string, reviewId: string) {
    return apiClient.delete(`/api/products/${id}/reviews/${reviewId}`);
  },
};

export const categoryApi = {
  list() {
    return apiClient.get<ApiResponse<CategoryDTO[]>>('/api/categories');
  },

  getById(id: string) {
    return apiClient.get<ApiResponse<CategoryDTO>>(`/api/categories/${id}`);
  },

  create(data: CreateCategoryRequest) {
    return apiClient.post<ApiResponse<CategoryDTO>>('/api/categories', data);
  },
};
