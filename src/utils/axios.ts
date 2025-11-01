import axios from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from './constants';

// Axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request 인터셉터: accessToken 자동 추가
apiClient.interceptors.request.use(
  (config) => {
    // localStorage 우선, 없으면 sessionStorage 확인
    const accessToken =
      localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) ||
      sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response 인터셉터: 401 에러 시 토큰 리프레시 처리
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 401 에러이고, 재시도하지 않은 요청인 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // localStorage 우선, 없으면 sessionStorage 확인
        const refreshToken =
          localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) ||
          sessionStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

        if (!refreshToken) {
          // refreshToken이 없으면 로그아웃 처리
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
          sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
          sessionStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
          window.location.href = '/signin';
          return Promise.reject(error);
        }

        // 토큰 리프레시 요청
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // 새 토큰을 원래 저장소에 저장 (localStorage 우선)
        const storage = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
          ? localStorage
          : sessionStorage;
        storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);

        // 원래 요청에 새 토큰 적용 후 재시도
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // 리프레시 실패 시 로그아웃
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        sessionStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        window.location.href = '/signin';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
