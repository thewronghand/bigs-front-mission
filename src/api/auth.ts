import { apiClient } from '../utils/axios';
import type { SignUpRequest, SignInRequest, AuthResponse, RefreshRequest } from '../types/auth';

export const signUp = async (data: SignUpRequest): Promise<void> => {
  await apiClient.post('/auth/signup', data);
};

export const signIn = async (data: SignInRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/signin', data);
  return response.data;
};


export const refreshToken = async (data: RefreshRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/refresh', data);
  return response.data;
};
