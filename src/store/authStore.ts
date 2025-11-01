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

  // 액션
  login: (accessToken: string, refreshToken: string, rememberMe?: boolean) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,

  login: (accessToken, refreshToken, rememberMe = false) => {
    // JWT 디코딩해서 사용자 정보 추출
    const decoded = jwtDecode<JWTPayload>(accessToken);
    const user: User = {
      username: decoded.sub,
      name: decoded.name,
    };

    // 자동 로그인 여부에 따라 저장소 선택
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    set({ accessToken, refreshToken, user, isAuthenticated: true });
  },

  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
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
    // localStorage 우선 체크 (자동 로그인)
    let accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    let refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

    // localStorage에 없으면 sessionStorage 체크
    if (!accessToken || !refreshToken) {
      accessToken = sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      refreshToken = sessionStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    }

    if (accessToken && refreshToken) {
      try {
        const decoded = jwtDecode<JWTPayload>(accessToken);
        const user: User = {
          username: decoded.sub,
          name: decoded.name,
        };
        set({ accessToken, refreshToken, user, isAuthenticated: true });
      } catch {
        // JWT 디코딩 실패 시 모든 저장소에서 제거
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        sessionStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      }
    }
  },
}));
