import apiClient from '../client';
import type { ApiResponse, UserProfileDTO, UpdateProfileRequest } from '../../types';

export const userApi = {
  getMyProfile() {
    return apiClient.get<ApiResponse<UserProfileDTO>>('/api/users/me');
  },

  updateProfile(data: UpdateProfileRequest) {
    return apiClient.put<ApiResponse<UserProfileDTO>>('/api/users/me', data);
  },

  getById(userId: string) {
    return apiClient.get<ApiResponse<UserProfileDTO>>(`/api/users/${userId}`);
  },
};