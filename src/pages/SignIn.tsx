import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { signIn } from '../api';
import { useAuthStore } from '../store/authStore';
import { isValidEmail } from '../utils/validation';
import { extractAuthErrorMessage } from '../utils/errorHandlers';
import { FormInput, ErrorMessage, BrandingSection } from '../components/auth';
import { Button } from '../components';
import type { SignInRequest } from '../types/auth';
import logoSvg from '../assets/logo.svg'; // 모바일용

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

    try {
      // 로그인 API 호출
      const response = await signIn(data);

      // Zustand 스토어에 토큰 저장 (JWT 디코딩 포함, sessionStorage 사용)
      login(response.accessToken, response.refreshToken);

      // 게시판 페이지로 이동
      navigate('/boards');
    } catch (error) {
      const errorMessage = extractAuthErrorMessage(error, '로그인에 실패했습니다');
      setApiError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {/* 데스크탑 브랜딩 영역 (md 이상에서만 표시) */}
      <BrandingSection />

      {/* 로그인 폼 영역 */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center p-4 xs:p-6 sm:p-8">
        <div className="max-w-md w-full bg-white md:bg-transparent rounded-lg md:rounded-none shadow-md md:shadow-none p-6 xs:p-8">
          {/* 브랜딩 (모바일/태블릿만) */}
          <div className="flex flex-col items-center mb-8 md:hidden">
            <img src={logoSvg} alt="BIGS Logo" className="w-16 h-16 mb-3" />
            <h1 className="text-3xl font-bold text-gray-800">BIGS Board</h1>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8 text-gray-800">
            로그인
          </h2>

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
                <Link
                  to="/signup"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  회원가입
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
