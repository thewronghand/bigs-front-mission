interface PostFormApiErrorHandlerOptions {
  setApiError: (message: string) => void;
}

export const handlePostFormApiError = (
  error: unknown,
  { setApiError }: PostFormApiErrorHandlerOptions
): void => {
  console.error('API 요청 실패:', error);

  const axiosError = error as {
    response?: { status: number; data?: { message?: string } };
  };

  // 네트워크 오류 or 서버 응답 없음
  if (!axiosError.response) {
    setApiError('네트워크 연결을 확인해주세요');
    return;
  }

  const status = axiosError.response.status;
  const serverMessage = axiosError.response?.data?.message;

  switch (status) {
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

/**
 * 인증 API 에러 메시지 추출 (회원가입/로그인)
 */
export const extractAuthErrorMessage = (
  error: unknown,
  defaultMessage: string
): string => {
  const typedError = error as {
    response?: {
      data?: {
        message?: string;
        username?: string[];
        password?: string[];
        name?: string[];
      };
    };
  };

  const responseData = typedError.response?.data;

  // 필드별 에러 메시지 우선 (배열 형태)
  if (responseData?.username && responseData.username.length > 0) {
    return responseData.username[0];
  }

  if (responseData?.password && responseData.password.length > 0) {
    return responseData.password[0];
  }

  if (responseData?.name && responseData.name.length > 0) {
    return responseData.name[0];
  }

  // 서버 메시지
  if (responseData?.message) {
    return responseData.message;
  }

  // 기본 메시지
  return defaultMessage;
};
