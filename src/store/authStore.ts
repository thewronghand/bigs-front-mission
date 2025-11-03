import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import type { User } from '../types';
import { STORAGE_KEYS } from '../utils';

interface JWTPayload {
  sub: string;
  name: string;
  exp: number;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  showSessionExpired: boolean;

  // 액션
  login: (accessToken: string, refreshToken: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  loadFromStorage: () => void;
  setSessionExpired: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  showSessionExpired: false,

  login: (accessToken, refreshToken) => {
    // JWT 디코딩해서 사용자 정보 추출
    const decoded = jwtDecode<JWTPayload>(accessToken);
    const user: User = {
      username: decoded.sub,
      name: decoded.name,
    };

    // sessionStorage에 토큰 저장 (보안상 더 안전)
    console.log('[Auth] 로그인 처리: sessionStorage에 저장');
    sessionStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    sessionStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    set({ accessToken, refreshToken, user, isAuthenticated: true });
  },

  setTokens: (accessToken, refreshToken) => {
    // 토큰 리프레시 시 sessionStorage 업데이트
    sessionStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    sessionStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    set({ accessToken, refreshToken, isAuthenticated: true });
  },

  setUser: (user) => {
    set({ user });
  },

  logout: () => {
    // localStorage와 sessionStorage 모두에서 제거
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
  },

  loadFromStorage: () => {
    // sessionStorage에서 토큰 로드
    const accessToken = sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const refreshToken = sessionStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

    if (accessToken && refreshToken) {
      console.log('[Auth] sessionStorage에서 토큰 로드 성공');
      try {
        const decoded = jwtDecode<JWTPayload>(accessToken);
        const user: User = {
          username: decoded.sub,
          name: decoded.name,
        };
        set({ accessToken, refreshToken, user, isAuthenticated: true });
      } catch {
        console.log('[Auth] JWT 디코딩 실패, 토큰 삭제');
        // JWT 디코딩 실패 시 sessionStorage에서 제거
        sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        sessionStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      }
    } else {
      console.log('[Auth] sessionStorage에 토큰 없음');
    }
  },

  setSessionExpired: (value) => {
    set({ showSessionExpired: value });
  },
}));
