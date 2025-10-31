/**
 * 이메일 형식 검증
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 비밀번호 유효성 검증
 * - 8자 이상
 * - 숫자 1개 이상
 * - 영문자 1개 이상
 * - 특수문자(!%*#?&) 1개 이상
 */
export const isValidPassword = (password: string): boolean => {
  if (password.length < 8) return false;

  const hasNumber = /\d/.test(password);
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasSpecialChar = /[!%*#?&]/.test(password);

  return hasNumber && hasLetter && hasSpecialChar;
};

/**
 * 비밀번호 유효성 에러 메시지 생성
 */
export const getPasswordErrorMessage = (password: string): string => {
  if (password.length < 8) {
    return '비밀번호는 8자 이상이어야 합니다';
  }
  if (!/\d/.test(password)) {
    return '비밀번호에 숫자를 1개 이상 포함해야 합니다';
  }
  if (!/[a-zA-Z]/.test(password)) {
    return '비밀번호에 영문자를 1개 이상 포함해야 합니다';
  }
  if (!/[!%*#?&]/.test(password)) {
    return '비밀번호에 특수문자(!%*#?&)를 1개 이상 포함해야 합니다';
  }
  return '';
};

/**
 * 비밀번호 확인 검증 및 에러 메시지 생성
 * - Caps Lock 감지
 * - 한글 입력 감지
 * - 일반 불일치 메시지
 */
export const getPasswordMismatchMessage = (
  confirmPassword: string,
  password: string,
  isCapsLockOn: boolean
): string | true => {
  if (confirmPassword === password) return true;

  const hasKorean = /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(confirmPassword);
  const hasKoreanInPassword = /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(password);

  // 캡스락이 켜져있는지 확인
  if (isCapsLockOn) {
    return '비밀번호가 일치하지 않습니다.\nCaps Lock이 켜져 있는지 확인해주세요.';
  }

  // 한글이 포함되어 있는지 확인
  if (hasKorean || hasKoreanInPassword) {
    return '비밀번호가 일치하지 않습니다.\n한/영 입력 상태를 확인해주세요.';
  }

  return '비밀번호가 일치하지 않습니다';
};
