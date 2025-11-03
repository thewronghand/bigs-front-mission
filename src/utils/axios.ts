import axios from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from './constants';
import { useAuthStore } from '../store/authStore';

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
    // sessionStorage에서 accessToken 가져오기
    const accessToken = sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

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
      console.log('[Auth] 401 에러 발생, 토큰 리프레시 시도');
      originalRequest._retry = true;

      try {
        // sessionStorage에서 refreshToken 가져오기
        const refreshToken = sessionStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

        if (!refreshToken) {
          console.log('[Auth] refreshToken 없음, 로그인 페이지로 이동');
          // refreshToken이 없으면 로그아웃 처리
          sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
          sessionStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);

          // 세션 만료 오버레이 표시
          useAuthStore.getState().setSessionExpired(true);

          // 2초 후 로그인 페이지로 이동
          setTimeout(() => {
            window.location.href = '/signin';
          }, 2000);
          return Promise.reject(error);
        }

        console.log('[Auth] refreshToken 발견, 리프레시 API 호출');
        // 토큰 리프레시 요청
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        console.log('[Auth] 토큰 리프레시 성공');
        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // sessionStorage에 새 토큰 저장
        sessionStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        sessionStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);

        // 원래 요청에 새 토큰 적용 후 재시도
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error('[Auth] 토큰 리프레시 실패:', refreshError);
        if (axios.isAxiosError(refreshError) && refreshError.response) {
          console.error('[Auth] 리프레시 API 응답:', {
            status: refreshError.response.status,
            data: refreshError.response.data,
          });
        }
        // 리프레시 실패 시 로그아웃 및 로그인 페이지로 이동
        sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        sessionStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);

        // 세션 만료 오버레이 표시
        useAuthStore.getState().setSessionExpired(true);

        // 2초 후 로그인 페이지로 이동
        setTimeout(() => {
          window.location.href = '/signin';
        }, 2000);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
