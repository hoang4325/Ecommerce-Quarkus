import apiClient from '../client';
import type { ApiResponse, CartDTO, AddCartItemRequest, UpdateCartItemRequest } from '../../types';

export const cartApi = {
  getCart() {
    return apiClient.get<ApiResponse<CartDTO>>('/api/cart');
  },

  addItem(data: AddCartItemRequest) {
    return apiClient.post<ApiResponse<CartDTO>>('/api/cart/items', data);
  },

  updateItem(itemId: string, data: UpdateCartItemRequest) {
    return apiClient.put<ApiResponse<CartDTO>>(`/api/cart/items/${itemId}`, data);
  },

  removeItem(itemId: string) {
    return apiClient.delete<ApiResponse<CartDTO>>(`/api/cart/items/${itemId}`);
  },

  clearCart() {
    return apiClient.delete('/api/cart');
  },
};