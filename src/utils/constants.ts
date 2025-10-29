// 상수 정의

export const API_BASE_URL = 'https://front-mission.bigs.or.kr';

export const ROUTES = {
  HOME: '/',
  SIGN_UP: '/signup',
  SIGN_IN: '/signin',
  BOARDS: '/boards',
  BOARD_DETAIL: '/boards/:id',
  BOARD_NEW: '/boards/new',
  BOARD_EDIT: '/boards/:id/edit',
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
} as const;
