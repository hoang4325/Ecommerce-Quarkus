import apiClient from '../client';
import type { ApiResponse, PagedResponse, OrderDTO, CreateOrderRequest } from '../../types';

export const orderApi = {
  create(data: CreateOrderRequest) {
    return apiClient.post<ApiResponse<OrderDTO>>('/api/orders', data);
  },

  getOrders() {
    return apiClient.get<ApiResponse<OrderDTO[]>>('/api/orders');
  },

  getById(id: string) {
    return apiClient.get<ApiResponse<OrderDTO>>(`/api/orders/${id}`);
  },

  cancel(id: string) {
    return apiClient.put<ApiResponse<OrderDTO>>(`/api/orders/${id}/cancel`);
  },
};

export const orderAdminApi = {
  list(params?: { page?: number; size?: number; status?: string }) {
    return apiClient.get<ApiResponse<PagedResponse<OrderDTO>>>('/api/admin/orders', { params });
  },

  updateStatus(id: string, status: string) {
    return apiClient.put<ApiResponse<OrderDTO>>(`/api/admin/orders/${id}/status`, null, {
      params: { status },
    });
  },
};