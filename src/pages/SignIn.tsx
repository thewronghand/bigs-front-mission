import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { signIn } from '../api';
import { useAuthStore } from '../store/authStore';
import { isValidEmail } from '../utils/validation';
import { FormInput, ErrorMessage } from '../components/auth';
import type { SignInRequest } from '../types/auth';

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
  const [rememberMe, setRememberMe] = useState(false);

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

      // Zustand 스토어에 토큰 저장 (JWT 디코딩 포함)
      login(response.accessToken, response.refreshToken, rememberMe);

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
      setApiError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-8">로그인</h1>

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

          {/* 로그인 상태 유지 체크박스 */}
          <div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700">
                로그인 상태 유지
              </label>
            </div>
            {/* 체크 시 안내 메시지 */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                rememberMe ? 'max-h-20 opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'
              }`}
            >
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  🔒 안전을 위해 개인 기기에서만 사용해주세요
                </p>
              </div>
            </div>
          </div>

          {/* API 에러 메시지 */}
          <ErrorMessage message={apiError} />

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all ${
              !isFormValid || isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer'
            }`}
          >
            {isSubmitting ? '로그인 중...' : '로그인'}
          </button>

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
