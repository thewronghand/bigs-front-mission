import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SessionExpiredOverlay from './SessionExpiredOverlay';

// Mock react-icons
vi.mock('react-icons/md', () => ({
  MdError: () => <div data-testid="error-icon">⚠</div>,
}));

vi.mock('react-icons/ai', () => ({
  AiOutlineLoading3Quarters: () => <div data-testid="loading-icon">⟳</div>,
}));

describe('SessionExpiredOverlay', () => {
  describe('렌더링', () => {
    it('isVisible이 true일 때 오버레이를 렌더링한다', () => {
      render(<SessionExpiredOverlay isVisible={true} />);

      expect(screen.getByText('로그인이 만료되었습니다')).toBeInTheDocument();
      expect(screen.getByText('로그인 페이지로 이동합니다.')).toBeInTheDocument();
    });

    it('isVisible이 false일 때 null을 반환한다', () => {
      const { container } = render(<SessionExpiredOverlay isVisible={false} />);

      expect(container.firstChild).toBeNull();
    });

    it('에러 아이콘을 렌더링한다', () => {
      render(<SessionExpiredOverlay isVisible={true} />);

      expect(screen.getByTestId('error-icon')).toBeInTheDocument();
    });

    it('로딩 아이콘을 렌더링한다', () => {
      render(<SessionExpiredOverlay isVisible={true} />);

      expect(screen.getByTestId('loading-icon')).toBeInTheDocument();
    });
  });

  describe('스타일링', () => {
    it('배경 오버레이는 어두운 반투명 배경을 가진다', () => {
      const { container } = render(<SessionExpiredOverlay isVisible={true} />);

      const overlay = container.firstChild as HTMLElement;
      expect(overlay.className).toContain('bg-black/30');
      expect(overlay.className).toContain('fixed');
      expect(overlay.className).toContain('inset-0');
    });

    it('카드는 흰색 배경과 그림자를 가진다', () => {
      const { container } = render(<SessionExpiredOverlay isVisible={true} />);

      const card = container.querySelector('.bg-white');
      expect(card).toBeInTheDocument();
      expect(card?.className).toContain('rounded-lg');
      expect(card?.className).toContain('shadow-2xl');
    });

    it('z-index 50을 가진다', () => {
      const { container } = render(<SessionExpiredOverlay isVisible={true} />);

      const overlay = container.firstChild as HTMLElement;
      expect(overlay.className).toContain('z-50');
    });
  });

  describe('애니메이션 클래스', () => {
    it('오버레이는 fadeIn 애니메이션을 가진다', () => {
      const { container } = render(<SessionExpiredOverlay isVisible={true} />);

      const overlay = container.firstChild as HTMLElement;
      expect(overlay.className).toContain('animate-fadeIn');
    });

    it('카드는 scaleIn 애니메이션을 가진다', () => {
      const { container } = render(<SessionExpiredOverlay isVisible={true} />);

      const card = container.querySelector('.bg-white');
      expect(card?.className).toContain('animate-scaleIn');
    });
  });

  describe('텍스트 내용', () => {
    it('제목 텍스트를 렌더링한다', () => {
      render(<SessionExpiredOverlay isVisible={true} />);

      const title = screen.getByText('로그인이 만료되었습니다');
      expect(title.tagName).toBe('H2');
    });

    it('설명 텍스트를 렌더링한다', () => {
      render(<SessionExpiredOverlay isVisible={true} />);

      const description = screen.getByText('로그인 페이지로 이동합니다.');
      expect(description.tagName).toBe('P');
    });

    it('제목은 bold 폰트를 가진다', () => {
      render(<SessionExpiredOverlay isVisible={true} />);

      const title = screen.getByText('로그인이 만료되었습니다');
      expect(title.className).toContain('font-bold');
      expect(title.className).toContain('text-2xl');
    });
  });

  describe('레이아웃', () => {
    it('중앙 정렬된 컨텐츠를 가진다', () => {
      const { container } = render(<SessionExpiredOverlay isVisible={true} />);

      const overlay = container.firstChild as HTMLElement;
      expect(overlay.className).toContain('flex');
      expect(overlay.className).toContain('items-center');
      expect(overlay.className).toContain('justify-center');
    });

    it('카드는 max-width를 가진다', () => {
      const { container } = render(<SessionExpiredOverlay isVisible={true} />);

      const card = container.querySelector('.bg-white');
      expect(card?.className).toContain('max-w-md');
      expect(card?.className).toContain('w-full');
    });

    it('컨텐츠는 중앙 정렬된다', () => {
      const { container } = render(<SessionExpiredOverlay isVisible={true} />);

      const content = container.querySelector('.text-center');
      expect(content).toBeInTheDocument();
    });
  });

  describe('SuccessOverlay와의 차이점', () => {
    it('에러 아이콘을 사용한다 (체크 아이콘이 아님)', () => {
      render(<SessionExpiredOverlay isVisible={true} />);

      expect(screen.getByTestId('error-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('check-icon')).not.toBeInTheDocument();
    });

    it('로그인 만료 메시지를 표시한다', () => {
      render(<SessionExpiredOverlay isVisible={true} />);

      expect(screen.getByText('로그인이 만료되었습니다')).toBeInTheDocument();
      expect(screen.queryByText('회원가입이 완료되었습니다!')).not.toBeInTheDocument();
    });
  });
});
