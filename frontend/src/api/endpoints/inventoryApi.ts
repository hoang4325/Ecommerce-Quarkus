import apiClient from '../client';
import type { ApiResponse, InventoryDTO, CreateInventoryRequest } from '../../types';

export const inventoryApi = {
  list() {
    return apiClient.get<ApiResponse<InventoryDTO[]>>('/api/inventory');
  },

  getByProduct(productId: string) {
    return apiClient.get<ApiResponse<InventoryDTO>>(`/api/inventory/product/${productId}`);
  },

  create(data: CreateInventoryRequest) {
    return apiClient.post<ApiResponse<InventoryDTO>>('/api/inventory', data);
  },

  updateStock(productId: string, quantity: number) {
    return apiClient.put<ApiResponse<InventoryDTO>>(`/api/inventory/product/${productId}`, null, {
      params: { quantity },
    });
  },
};