import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { signUp } from '../api';
import { isValidEmail, isValidPassword, getPasswordErrorMessage, getPasswordMismatchMessage } from '../utils/validation';
import { extractAuthErrorMessage } from '../utils/errorHandlers';
import { FormInput, PasswordRequirements, SuccessOverlay, ErrorMessage, BrandingSection } from '../components/auth';
import { Button } from '../components';
import type { SignUpRequest } from '../types/auth';
import logoSvg from '../assets/logo.svg'; // 모바일용

export default function SignUp() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<SignUpRequest>({
    mode: 'onChange',
  });

  const [apiError, setApiError] = useState('');
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);

  const password = watch('password', '');
  const username = watch('username', '');
  const name = watch('name', '');
  const confirmPassword = watch('confirmPassword', '');

  // 모든 필드가 입력되었는지 확인
  const allFieldsFilled = username && name && password && confirmPassword;
  const isFormValid = allFieldsFilled && isValid;

  // 비밀번호 입력 후 0.3초 대기 후 요구사항 표시
  useEffect(() => {
    if (!passwordTouched) {
      return;
    }

    if (password.length === 0) {
      setShowPasswordRequirements(false);
      return;
    }

    const timer = setTimeout(() => {
      setShowPasswordRequirements(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [password, passwordTouched]);

  const onSubmit = async (data: SignUpRequest) => {
    setApiError('');

    try {
      // 회원가입
      await signUp(data);

      // 성공 UI 표시
      setIsSuccess(true);

      // 1.5초 후 로그인 페이지로 이동
      setTimeout(() => {
        navigate('/signin');
      }, 1500);
    } catch (error) {
      const errorMessage = extractAuthErrorMessage(error, '회원가입에 실패했습니다');
      setApiError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 relative">
      <SuccessOverlay isVisible={isSuccess} />

      {/* 데스크탑 브랜딩 영역 (md 이상에서만 표시) */}
      <BrandingSection />

      {/* 회원가입 폼 영역 */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center p-4 xs:p-6 sm:p-8">
        <div className="max-w-md w-full bg-white md:bg-transparent rounded-lg md:rounded-none shadow-md md:shadow-none p-6 xs:p-8">
        {/* 브랜딩 (모바일/태블릿만) */}
        <div className="flex flex-col items-center mb-8 md:hidden">
          <img src={logoSvg} alt="BIGS Logo" className="w-16 h-16 mb-3" />
          <h1 className="text-3xl font-bold text-gray-800">BIGS Board</h1>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8 text-gray-800">회원가입</h2>

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

          {/* 이름 */}
          <FormInput
            label="이름"
            id="name"
            type="text"
            placeholder="홍길동"
            error={errors.name?.message}
            registration={register('name', {
              required: '이름을 입력해주세요',
              maxLength: { value: 8, message: '이름은 8자 이하여야 합니다' },
            })}
          />

          {/* 비밀번호 */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호
            </label>
            <input
              type="password"
              id="password"
              {...register('password', {
                required: '비밀번호를 입력해주세요',
                validate: (value) => {
                  if (!isValidPassword(value)) {
                    return getPasswordErrorMessage(value);
                  }
                  return true;
                },
              })}
              onFocus={() => setPasswordTouched(true)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                errors.password
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="8자 이상, 숫자/영문/특수문자 포함"
            />
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                errors.password ? 'max-h-10 opacity-100 mt-1' : 'max-h-0 opacity-0 mt-0'
              }`}
            >
              <p className="text-sm text-red-500">{errors.password?.message}</p>
            </div>

            {/* 비밀번호 요구사항 표시 */}
            <PasswordRequirements
              password={password}
              showRequirements={showPasswordRequirements}
            />
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호 확인
            </label>
            <input
              type="password"
              id="confirmPassword"
              {...register('confirmPassword', {
                required: '비밀번호 확인을 입력해주세요',
                validate: (value) => getPasswordMismatchMessage(value, password, isCapsLockOn),
              })}
              onKeyDown={(e) => {
                setIsCapsLockOn(e.getModifierState('CapsLock'));
              }}
              onKeyUp={(e) => {
                setIsCapsLockOn(e.getModifierState('CapsLock'));
              }}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                errors.confirmPassword
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="비밀번호를 다시 입력해주세요"
            />
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                errors.confirmPassword ? 'max-h-20 opacity-100 mt-1' : 'max-h-0 opacity-0 mt-0'
              }`}
            >
              <p className="text-sm text-red-500 whitespace-pre-line">{errors.confirmPassword?.message}</p>
            </div>
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
            {isSubmitting ? '처리 중...' : '회원가입'}
          </Button>

          {/* 로그인 링크 */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              이미 계정이 있으신가요?{' '}
              <Link to="/signin" className="text-blue-600 hover:text-blue-700 font-medium">
                로그인
              </Link>
            </p>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
