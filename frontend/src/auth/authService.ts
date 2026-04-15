import apiClient from '../api/client';
import type { ApiResponse, LoginRequest, RegisterRequest, TokenResponse, UserInfoDTO } from '../types';
import { authStore } from './authStore';

export const authService = {
  async login(data: LoginRequest): Promise<TokenResponse> {
    const res = await apiClient.post<ApiResponse<TokenResponse>>('/api/auth/login', data);
    const tokens = res.data.data!;
    authStore.setTokens(tokens.access_token, tokens.refresh_token);
    return tokens;
  },

  async register(data: RegisterRequest): Promise<UserInfoDTO> {
    const res = await apiClient.post<ApiResponse<UserInfoDTO>>('/api/auth/register', data);
    return res.data.data!;
  },

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const res = await apiClient.post<ApiResponse<TokenResponse>>('/api/auth/refresh', null, {
      headers: { 'X-Refresh-Token': refreshToken },
    });
    const tokens = res.data.data!;
    authStore.setTokens(tokens.access_token, tokens.refresh_token);
    return tokens;
  },

  async getMe(): Promise<UserInfoDTO> {
    const res = await apiClient.get<ApiResponse<UserInfoDTO>>('/api/auth/me');
    const user = res.data.data!;
    authStore.setUser(user);
    return user;
  },

  logout() {
    authStore.logout();
  },
};