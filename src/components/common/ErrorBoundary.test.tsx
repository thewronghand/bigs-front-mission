import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorBoundary from './ErrorBoundary';

// 에러를 발생시키는 컴포넌트
const ThrowError = ({ shouldThrow }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// console.error를 모킹하여 테스트 중 에러 로그 숨기기
const originalError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});

afterEach(() => {
  console.error = originalError;
});

describe('ErrorBoundary', () => {
  describe('정상 동작', () => {
    it('에러가 없으면 children을 렌더링한다', () => {
      render(
        <ErrorBoundary>
          <div>Test content</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('여러 children을 렌더링한다', () => {
      render(
        <ErrorBoundary>
          <div>Child 1</div>
          <div>Child 2</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
    });
  });

  describe('에러 발생 시', () => {
    it('기본 에러 UI를 렌더링한다', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>
      );

      expect(screen.getByText('문제가 발생했습니다')).toBeInTheDocument();
      expect(
        screen.getByText(/예상치 못한 오류가 발생했습니다/)
      ).toBeInTheDocument();
    });

    it('다시 시도 버튼을 렌더링한다', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>
      );

      expect(screen.getByText('다시 시도')).toBeInTheDocument();
    });

    it('홈으로 이동 버튼을 렌더링한다', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>
      );

      expect(screen.getByText('홈으로 이동')).toBeInTheDocument();
    });

    it('에러 아이콘을 렌더링한다', () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>
      );

      const icon = container.querySelector('.bg-red-100');
      expect(icon).toBeInTheDocument();
    });

    it('console.error를 호출한다', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>
      );

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('다시 시도 기능', () => {
    it('다시 시도 버튼이 활성화되어 있다', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>
      );

      // 에러 UI 표시 확인
      expect(screen.getByText('문제가 발생했습니다')).toBeInTheDocument();

      // 다시 시도 버튼이 활성화되어 있음
      const retryButton = screen.getByText('다시 시도');
      expect(retryButton).toBeEnabled();
      expect(retryButton).toBeInTheDocument();
    });
  });

  describe('커스텀 fallback', () => {
    it('커스텀 fallback을 사용할 수 있다', () => {
      const customFallback = (error: Error) => (
        <div>Custom error: {error.message}</div>
      );

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow />
        </ErrorBoundary>
      );

      expect(screen.getByText('Custom error: Test error')).toBeInTheDocument();
    });

    it('커스텀 fallback에서 resetError 함수를 받을 수 있다', async () => {
      const user = userEvent.setup();
      const mockResetError = vi.fn();

      const customFallback = (_error: Error, resetError: () => void) => (
        <button onClick={() => { resetError(); mockResetError(); }}>Reset</button>
      );

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow />
        </ErrorBoundary>
      );

      expect(screen.getByText('Reset')).toBeInTheDocument();

      const resetButton = screen.getByText('Reset');
      await user.click(resetButton);

      // resetError 함수가 호출됨
      expect(mockResetError).toHaveBeenCalled();
    });
  });

  describe('스타일링', () => {
    it('중앙 정렬 레이아웃을 가진다', () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>
      );

      const layout = container.querySelector('.min-h-screen');
      expect(layout?.className).toContain('flex');
      expect(layout?.className).toContain('items-center');
      expect(layout?.className).toContain('justify-center');
    });

    it('흰색 카드 배경을 가진다', () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>
      );

      const card = container.querySelector('.bg-white');
      expect(card).toBeInTheDocument();
      expect(card?.className).toContain('rounded-lg');
      expect(card?.className).toContain('shadow-lg');
    });

    it('빨간색 에러 아이콘을 가진다', () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>
      );

      const iconBg = container.querySelector('.bg-red-100');
      expect(iconBg).toBeInTheDocument();

      const icon = container.querySelector('.text-red-600');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('반응형', () => {
    it('반응형 패딩을 가진다', () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>
      );

      const card = container.querySelector('.bg-white');
      expect(card?.className).toContain('p-6');
      expect(card?.className).toContain('xs:p-8');
    });

    it('반응형 텍스트 크기를 가진다', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>
      );

      const title = screen.getByText('문제가 발생했습니다');
      expect(title.className).toContain('text-xl');
      expect(title.className).toContain('xs:text-2xl');
    });

    it('반응형 버튼 레이아웃을 가진다', () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>
      );

      const buttonContainer = container.querySelector('.flex-col');
      expect(buttonContainer?.className).toContain('xs:flex-row');
    });
  });

  describe('개발/프로덕션 환경', () => {
    it('개발 환경에서는 에러 메시지를 표시한다', () => {
      const originalDev = import.meta.env.DEV;
      vi.stubEnv('DEV', true);

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>
      );

      expect(screen.getByText('Test error')).toBeInTheDocument();

      vi.stubEnv('DEV', originalDev);
    });

    it('프로덕션 환경에서는 에러 메시지를 숨긴다', () => {
      const originalDev = import.meta.env.DEV;
      vi.stubEnv('DEV', false);

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>
      );

      expect(screen.queryByText('Test error')).not.toBeInTheDocument();

      vi.stubEnv('DEV', originalDev);
    });
  });
});
