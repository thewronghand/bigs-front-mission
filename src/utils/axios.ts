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

    // 🔍 디버깅 로그 1: 모든 에러 감지
    console.log('🔴 [API Error]', {
      status: error.response?.status,
      url: originalRequest?.url,
      method: originalRequest?.method,
      timestamp: new Date().toISOString(),
    });

    // 401 에러이고, 재시도하지 않은 요청인 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('🔑 [401 Detected] Starting token refresh process');
      originalRequest._retry = true;

      try {
        const refreshToken = sessionStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

        // 🔍 디버깅 로그 2: refreshToken 존재 여부
        console.log('🔑 [RefreshToken Check]', {
          hasRefreshToken: !!refreshToken,
          refreshTokenLength: refreshToken?.length || 0,
        });

        if (!refreshToken) {
          // 🔍 디버깅 로그 3: refreshToken 없음 - 로그아웃 진행
          console.log('❌ [No RefreshToken] Starting logout process');

          sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
          sessionStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);

          useAuthStore.getState().setSessionExpired(true);
          console.log('✅ [Overlay] SessionExpired overlay shown');

          // 🔍 디버깅 로그 4: 리다이렉트 예약
          console.log('⏰ [Redirect Scheduled] Will redirect to /signin in 2 seconds');

          setTimeout(() => {
            // 🔍 디버깅 로그 5: 실제 리다이렉트 실행
            console.log('🚀 [Redirecting NOW]', {
              from: window.location.href,
              to: '/signin',
              method: 'window.location.replace',
            });

            try {
              window.location.replace('/signin');
              console.log('✅ [Redirect Called] window.location.replace executed');
            } catch (redirectError) {
              console.error('❌ [Redirect Error]', redirectError);
            }
          }, 2000);

          return Promise.reject(error);
        }

        // 🔍 디버깅 로그 6: 토큰 리프레시 시도
        console.log('🔄 [Refresh API] Calling refresh endpoint');

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        // 🔍 디버깅 로그 7: 리프레시 성공
        console.log('✅ [Refresh Success] Got new tokens');

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        sessionStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        sessionStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // 🔍 디버깅 로그 8: 원래 요청 재시도
        console.log('🔄 [Retry Request] Retrying original request');

        return apiClient(originalRequest);
      } catch (refreshError) {
        // 🔍 디버깅 로그 9: 리프레시 실패
        console.error('❌ [Refresh Failed]', {
          error: refreshError,
          isAxiosError: axios.isAxiosError(refreshError),
          status: axios.isAxiosError(refreshError) ? refreshError.response?.status : 'N/A',
          data: axios.isAxiosError(refreshError) ? refreshError.response?.data : 'N/A',
        });

        sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        sessionStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);

        useAuthStore.getState().setSessionExpired(true);
        console.log('✅ [Overlay] SessionExpired overlay shown');

        // 🔍 디버깅 로그 10: 리프레시 실패 후 리다이렉트
        console.log('⏰ [Redirect Scheduled] Will redirect to /signin in 2 seconds (after refresh failure)');

        setTimeout(() => {
          console.log('🚀 [Redirecting NOW]', {
            from: window.location.href,
            to: '/signin',
            method: 'window.location.replace',
          });

          try {
            window.location.replace('/signin');
            console.log('✅ [Redirect Called] window.location.replace executed');
          } catch (redirectError) {
            console.error('❌ [Redirect Error]', redirectError);
          }
        }, 2000);

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
