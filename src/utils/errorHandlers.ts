import toast from 'react-hot-toast';
import type { NavigateFunction } from 'react-router-dom';

interface PostFormApiErrorHandlerOptions {
  logout: () => void;
  navigate: NavigateFunction;
  setApiError: (message: string) => void;
}

export const handlePostFormApiError = (
  error: unknown,
  { logout, navigate, setApiError }: PostFormApiErrorHandlerOptions
): void => {
  console.error('API 요청 실패:', error);

  const axiosError = error as { response?: { status: number; data?: { message?: string } } };

  // 네트워크 오류 or 서버 응답 없음
  if (!axiosError.response) {
    setApiError('네트워크 연결을 확인해주세요');
    return;
  }

  const status = axiosError.response.status;
  const serverMessage = axiosError.response?.data?.message;

  switch (status) {
    case 401:
      // 인증 만료 - Toast + 로그아웃 + 로그인 페이지 이동
      console.log('[DEBUG] 401 에러 - 3초 후 로그인 페이지로 이동');
      toast.error('로그인이 만료되었습니다. 다시 로그인해주세요.');
      logout();
      setTimeout(() => {
        console.log('[DEBUG] 지금 리다이렉트 실행');
        navigate('/signin');
      }, 3000);
      break;

    case 403:
      setApiError('권한이 없습니다');
      break;

    case 413:
      setApiError('파일 크기가 너무 큽니다');
      break;

    case 500:
      setApiError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요');
      break;

    default:
      // 서버가 메시지를 보낸 경우 우선 사용
      setApiError(serverMessage || '요청에 실패했습니다');
  }
};
