import { useState } from 'react';
import Button from './common/Button';

/**
 * ErrorBoundary 테스트용 컴포넌트
 * 개발 환경에서만 사용하세요!
 */
export default function ErrorTester() {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    throw new Error('ErrorBoundary 테스트: 의도적으로 발생시킨 에러입니다');
  }

  // 개발 환경에서만 렌더링
  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Button
        variant="danger"
        onClick={() => setShouldThrow(true)}
        className="shadow-lg"
      >
        🧪 에러 발생시키기
      </Button>
    </div>
  );
}
