// 상수 정의

export const API_BASE_URL = '/api';

export const ROUTES = {
  HOME: '/',
  SIGN_UP: '/signup',
  SIGN_IN: '/signin',
  BOARD: '/boards',
  POST_DETAIL: '/boards/:id',
  POST_NEW: '/boards/new',
  POST_EDIT: '/boards/:id/edit',
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
} as const;
