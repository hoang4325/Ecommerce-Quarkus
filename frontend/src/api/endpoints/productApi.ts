import apiClient from '../client';
import type { ApiResponse, PagedResponse, ProductDTO, CreateProductRequest, UpdateProductRequest, CategoryDTO, CreateCategoryRequest } from '../../types';

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