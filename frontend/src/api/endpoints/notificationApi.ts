import apiClient from '../client';
import type { ApiResponse, NotificationDTO } from '../../types';

export const notificationApi = {
  getAll() {
    return apiClient.get<ApiResponse<NotificationDTO[]>>('/api/notifications');
  },

  getUnread() {
    return apiClient.get<ApiResponse<NotificationDTO[]>>('/api/notifications/unread');
  },

  markAsRead(id: string) {
    return apiClient.put<ApiResponse<string>>(`/api/notifications/${id}/read`);
  },
};