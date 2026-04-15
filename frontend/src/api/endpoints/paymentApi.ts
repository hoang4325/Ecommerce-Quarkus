import apiClient from '../client';
import type { ApiResponse, PaymentDTO } from '../../types';

export const paymentApi = {
  getAll() {
    return apiClient.get<ApiResponse<PaymentDTO[]>>('/api/payments');
  },

  getByOrder(orderId: string) {
    return apiClient.get<ApiResponse<PaymentDTO>>(`/api/payments/order/${orderId}`);
  },
};