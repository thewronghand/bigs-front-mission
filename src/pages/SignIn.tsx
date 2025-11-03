import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { signIn } from '../api';
import { useAuthStore } from '../store/authStore';
import { isValidEmail } from '../utils/validation';
import { FormInput, ErrorMessage } from '../components/auth';
import { Button } from '../components';
import type { SignInRequest } from '../types/auth';
import logoSvg from '../assets/logo.svg';

export default function SignIn() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<SignInRequest>({
    mode: 'onChange',
  });

  const [apiError, setApiError] = useState('');

  const username = watch('username', '');
  const password = watch('password', '');

  // 모든 필드가 입력되었는지 확인
  const allFieldsFilled = username && password;
  const isFormValid = allFieldsFilled && isValid;

  const onSubmit = async (data: SignInRequest) => {
    setApiError('');

    // TODO: 테스트용 로그 - 프로덕션 배포 전 반드시 제거!
    console.log('[TEST] 로그인 시도:', {
      username: data.username,
      password: data.password,
    });

    try {
      // 로그인 API 호출
      const response = await signIn(data);

      // Zustand 스토어에 토큰 저장 (JWT 디코딩 포함, sessionStorage 사용)
      login(response.accessToken, response.refreshToken);

      // 게시판 페이지로 이동
      navigate('/boards');
    } catch (error) {
      const typedError = error as {
        response?: {
          data?: {
            message?: string;
          }
        }
      };

      const errorMessage = typedError.response?.data?.message || '로그인에 실패했습니다';

      // TODO: 테스트용 로그 - 프로덕션 배포 전 반드시 제거!
      console.error('[TEST] 로그인 실패:', {
        username: data.username,
        password: data.password,
        error: errorMessage,
        fullError: typedError.response?.data,
      });

      setApiError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        {/* 브랜딩 */}
        <div className="flex flex-col items-center mb-8">
          <img src={logoSvg} alt="BIGS Logo" className="w-16 h-16 mb-3" />
          <h1 className="text-3xl font-bold text-gray-800">BIGS Board</h1>
        </div>

        <h2 className="text-2xl font-bold text-center mb-8">로그인</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 이메일 */}
          <FormInput
            label="이메일"
            id="username"
            type="email"
            placeholder="example@email.com"
            error={errors.username?.message}
            registration={register('username', {
              required: '이메일을 입력해주세요',
              validate: (value) => {
                if (!isValidEmail(value)) {
                  return '올바른 이메일 형식이 아닙니다';
                }
                return true;
              },
            })}
          />

          {/* 비밀번호 */}
          <div>
            <FormInput
              label="비밀번호"
              id="password"
              type="password"
              placeholder="비밀번호를 입력해주세요"
              error={errors.password?.message}
              registration={register('password', {
                required: '비밀번호를 입력해주세요',
              })}
            />
            <p className="text-xs text-gray-500 mt-1">
              8자 이상, 숫자/영문/특수문자(!%*#?&) 포함
            </p>
          </div>

          {/* API 에러 메시지 */}
          <ErrorMessage message={apiError} />

          {/* 제출 버튼 */}
          <Button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            variant="primary"
            size="lg"
            className="w-full font-medium"
          >
            {isSubmitting ? '로그인 중...' : '로그인'}
          </Button>

          {/* 회원가입 링크 */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              계정이 없으신가요?{' '}
              <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                회원가입
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
