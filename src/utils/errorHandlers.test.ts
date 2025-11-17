import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handlePostFormApiError, extractAuthErrorMessage } from './errorHandlers';

describe('errorHandlers', () => {
  describe('handlePostFormApiError', () => {
    let mockSetApiError: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      mockSetApiError = vi.fn();
      // console.error mock to suppress error logs in tests
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('네트워크 오류 시 적절한 메시지를 설정한다', () => {
      const error = { message: 'Network Error' };

      handlePostFormApiError(error, { setApiError: mockSetApiError });

      expect(mockSetApiError).toHaveBeenCalledWith('네트워크 연결을 확인해주세요');
    });

    it('403 에러 시 권한 없음 메시지를 설정한다', () => {
      const error = {
        response: {
          status: 403,
        },
      };

      handlePostFormApiError(error, { setApiError: mockSetApiError });

      expect(mockSetApiError).toHaveBeenCalledWith('권한이 없습니다');
    });

    it('413 에러 시 파일 크기 초과 메시지를 설정한다', () => {
      const error = {
        response: {
          status: 413,
        },
      };

      handlePostFormApiError(error, { setApiError: mockSetApiError });

      expect(mockSetApiError).toHaveBeenCalledWith('파일 크기가 너무 큽니다');
    });

    it('500 에러 시 서버 오류 메시지를 설정한다', () => {
      const error = {
        response: {
          status: 500,
        },
      };

      handlePostFormApiError(error, { setApiError: mockSetApiError });

      expect(mockSetApiError).toHaveBeenCalledWith(
        '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요'
      );
    });

    it('서버 메시지가 있으면 우선적으로 표시한다', () => {
      const error = {
        response: {
          status: 400,
          data: {
            message: '잘못된 요청입니다',
          },
        },
      };

      handlePostFormApiError(error, { setApiError: mockSetApiError });

      expect(mockSetApiError).toHaveBeenCalledWith('잘못된 요청입니다');
    });

    it('기본 에러 메시지를 설정한다 (알 수 없는 상태 코드)', () => {
      const error = {
        response: {
          status: 418, // I'm a teapot
        },
      };

      handlePostFormApiError(error, { setApiError: mockSetApiError });

      expect(mockSetApiError).toHaveBeenCalledWith('요청에 실패했습니다');
    });

    it('상태 코드는 알 수 없지만 서버 메시지가 있으면 서버 메시지를 사용한다', () => {
      const error = {
        response: {
          status: 418,
          data: {
            message: '커스텀 에러 메시지',
          },
        },
      };

      handlePostFormApiError(error, { setApiError: mockSetApiError });

      expect(mockSetApiError).toHaveBeenCalledWith('커스텀 에러 메시지');
    });
  });

  describe('extractAuthErrorMessage', () => {
    it('username 필드 에러를 추출한다', () => {
      const error = {
        response: {
          data: {
            username: ['이메일 형식이 올바르지 않습니다'],
          },
        },
      };

      const result = extractAuthErrorMessage(error, '기본 메시지');

      expect(result).toBe('이메일 형식이 올바르지 않습니다');
    });

    it('password 필드 에러를 추출한다', () => {
      const error = {
        response: {
          data: {
            password: ['비밀번호는 8자 이상이어야 합니다'],
          },
        },
      };

      const result = extractAuthErrorMessage(error, '기본 메시지');

      expect(result).toBe('비밀번호는 8자 이상이어야 합니다');
    });

    it('name 필드 에러를 추출한다', () => {
      const error = {
        response: {
          data: {
            name: ['이름은 필수입니다'],
          },
        },
      };

      const result = extractAuthErrorMessage(error, '기본 메시지');

      expect(result).toBe('이름은 필수입니다');
    });

    it('필드 에러가 배열의 첫 번째 메시지만 추출한다', () => {
      const error = {
        response: {
          data: {
            username: ['첫 번째 에러', '두 번째 에러', '세 번째 에러'],
          },
        },
      };

      const result = extractAuthErrorMessage(error, '기본 메시지');

      expect(result).toBe('첫 번째 에러');
    });

    it('필드 에러가 없으면 서버 message를 반환한다', () => {
      const error = {
        response: {
          data: {
            message: '사용자를 찾을 수 없습니다',
          },
        },
      };

      const result = extractAuthErrorMessage(error, '기본 메시지');

      expect(result).toBe('사용자를 찾을 수 없습니다');
    });

    it('에러 데이터가 없으면 기본 메시지를 반환한다', () => {
      const error = {
        response: {},
      };

      const result = extractAuthErrorMessage(error, '로그인에 실패했습니다');

      expect(result).toBe('로그인에 실패했습니다');
    });

    it('response가 없으면 기본 메시지를 반환한다', () => {
      const error = {};

      const result = extractAuthErrorMessage(error, '네트워크 오류');

      expect(result).toBe('네트워크 오류');
    });

    it('필드 에러 우선순위: username > password > name > message > default', () => {
      const error1 = {
        response: {
          data: {
            username: ['username 에러'],
            password: ['password 에러'],
            name: ['name 에러'],
            message: 'message 에러',
          },
        },
      };

      expect(extractAuthErrorMessage(error1, '기본')).toBe('username 에러');

      const error2 = {
        response: {
          data: {
            password: ['password 에러'],
            name: ['name 에러'],
            message: 'message 에러',
          },
        },
      };

      expect(extractAuthErrorMessage(error2, '기본')).toBe('password 에러');

      const error3 = {
        response: {
          data: {
            name: ['name 에러'],
            message: 'message 에러',
          },
        },
      };

      expect(extractAuthErrorMessage(error3, '기본')).toBe('name 에러');

      const error4 = {
        response: {
          data: {
            message: 'message 에러',
          },
        },
      };

      expect(extractAuthErrorMessage(error4, '기본')).toBe('message 에러');
    });

    it('빈 배열인 필드 에러는 무시한다', () => {
      const error = {
        response: {
          data: {
            username: [], // 빈 배열
            password: ['password 에러'],
          },
        },
      };

      const result = extractAuthErrorMessage(error, '기본 메시지');

      expect(result).toBe('password 에러');
    });
  });
});
