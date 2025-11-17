import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Header from './Header';

describe('Header', () => {
  const mockOnLogout = vi.fn();
  const mockOnLogoClick = vi.fn();
  const mockActionButtonClick = vi.fn();

  const mockUser = {
    name: '홍길동',
    username: 'hong@example.com',
  };

  const defaultProps = {
    user: mockUser,
    onLogout: mockOnLogout,
    onLogoClick: mockOnLogoClick,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('렌더링', () => {
    it('헤더를 렌더링한다', () => {
      const { container } = render(<Header {...defaultProps} />);

      const header = container.querySelector('header');
      expect(header).toBeInTheDocument();
    });

    it('로고를 렌더링한다', () => {
      render(<Header {...defaultProps} />);

      const logo = screen.getByAltText('BIGS Board');
      expect(logo).toBeInTheDocument();
      expect(logo.tagName).toBe('IMG');
    });

    it('로그아웃 버튼을 렌더링한다', () => {
      render(<Header {...defaultProps} />);

      expect(screen.getByText('로그아웃')).toBeInTheDocument();
    });

    it('로고 버튼은 aria-label을 가진다', () => {
      render(<Header {...defaultProps} />);

      const logoButton = screen.getByLabelText('게시판 홈으로 이동');
      expect(logoButton).toBeInTheDocument();
    });
  });

  describe('사용자 정보', () => {
    it('로그인한 사용자 이름을 표시한다', () => {
      render(<Header {...defaultProps} />);

      expect(screen.getByText('홍길동')).toBeInTheDocument();
      expect(screen.getByText('님', { exact: false })).toBeInTheDocument();
    });

    it('사용자가 null이면 이름을 표시하지 않는다', () => {
      render(<Header {...defaultProps} user={null} />);

      expect(screen.queryByText('홍길동')).not.toBeInTheDocument();
      expect(screen.queryByText('님', { exact: false })).not.toBeInTheDocument();
    });

    it('사용자 이름은 font-medium이다', () => {
      render(<Header {...defaultProps} />);

      const nameElement = screen.getByText('홍길동');
      expect(nameElement.className).toContain('font-medium');
    });
  });

  describe('클릭 이벤트', () => {
    it('로고 클릭 시 onLogoClick이 호출된다', async () => {
      const user = userEvent.setup();
      render(<Header {...defaultProps} />);

      const logoButton = screen.getByLabelText('게시판 홈으로 이동');
      await user.click(logoButton);

      expect(mockOnLogoClick).toHaveBeenCalledTimes(1);
    });

    it('로그아웃 버튼 클릭 시 onLogout이 호출된다', async () => {
      const user = userEvent.setup();
      render(<Header {...defaultProps} />);

      const logoutButton = screen.getByText('로그아웃');
      await user.click(logoutButton);

      expect(mockOnLogout).toHaveBeenCalledTimes(1);
    });
  });

  describe('액션 버튼', () => {
    const actionButton = {
      label: '글쓰기',
      onClick: mockActionButtonClick,
    };

    it('actionButton이 있으면 렌더링한다', () => {
      render(<Header {...defaultProps} actionButton={actionButton} />);

      expect(screen.getByText('글쓰기')).toBeInTheDocument();
    });

    it('actionButton이 없으면 렌더링하지 않는다', () => {
      render(<Header {...defaultProps} />);

      expect(screen.queryByText('글쓰기')).not.toBeInTheDocument();
    });

    it('액션 버튼 클릭 시 onClick이 호출된다', async () => {
      const user = userEvent.setup();
      render(<Header {...defaultProps} actionButton={actionButton} />);

      const button = screen.getByText('글쓰기');
      await user.click(button);

      expect(mockActionButtonClick).toHaveBeenCalledTimes(1);
    });

    it('variant를 지정하지 않으면 primary가 기본값이다', () => {
      render(<Header {...defaultProps} actionButton={actionButton} />);

      const button = screen.getByText('글쓰기');
      expect(button.className).toContain('bg-blue-600');
    });

    it('variant를 secondary로 지정할 수 있다', () => {
      const secondaryAction = { ...actionButton, variant: 'secondary' as const };
      render(<Header {...defaultProps} actionButton={secondaryAction} />);

      const button = screen.getByText('글쓰기');
      expect(button.className).toContain('bg-gray-200');
    });

    it('액션 버튼은 모바일에서 숨겨진다', () => {
      render(<Header {...defaultProps} actionButton={actionButton} />);

      const button = screen.getByText('글쓰기');
      expect(button.className).toContain('hidden');
      expect(button.className).toContain('xs:inline-flex');
    });
  });

  describe('스타일링', () => {
    it('헤더는 흰색 배경과 그림자를 가진다', () => {
      const { container } = render(<Header {...defaultProps} />);

      const header = container.querySelector('header');
      expect(header?.className).toContain('bg-white');
      expect(header?.className).toContain('shadow-sm');
    });

    it('컨텐츠는 max-w-4xl로 제한된다', () => {
      const { container } = render(<Header {...defaultProps} />);

      const content = container.querySelector('.max-w-4xl');
      expect(content).toBeInTheDocument();
    });

    it('로고 버튼은 호버 효과를 가진다', () => {
      render(<Header {...defaultProps} />);

      const logoButton = screen.getByLabelText('게시판 홈으로 이동');
      expect(logoButton.className).toContain('hover:opacity-80');
      expect(logoButton.className).toContain('transition-opacity');
    });

    it('로그아웃 버튼은 secondary 스타일이다', () => {
      render(<Header {...defaultProps} />);

      const logoutButton = screen.getByText('로그아웃');
      expect(logoutButton.className).toContain('bg-gray-200');
    });
  });

  describe('레이아웃', () => {
    it('로고와 버튼 그룹을 좌우로 배치한다', () => {
      const { container } = render(<Header {...defaultProps} />);

      const content = container.querySelector('.max-w-4xl');
      expect(content?.className).toContain('flex');
      expect(content?.className).toContain('justify-between');
      expect(content?.className).toContain('items-center');
    });

    it('우측 버튼들은 flex로 배치된다', () => {
      const { container } = render(<Header {...defaultProps} />);

      const buttonGroup = container.querySelector('.items-center.gap-2');
      expect(buttonGroup).toBeInTheDocument();
    });

    it('로고는 shrink-0을 가진다', () => {
      render(<Header {...defaultProps} />);

      const logoButton = screen.getByLabelText('게시판 홈으로 이동');
      expect(logoButton.className).toContain('shrink-0');
    });
  });

  describe('반응형', () => {
    it('컨테이너는 반응형 패딩을 가진다', () => {
      const { container } = render(<Header {...defaultProps} />);

      const content = container.querySelector('.max-w-4xl');
      expect(content?.className).toContain('px-3');
      expect(content?.className).toContain('xs:px-4');
      expect(content?.className).toContain('py-3');
      expect(content?.className).toContain('xs:py-4');
    });

    it('로고는 반응형 높이를 가진다', () => {
      render(<Header {...defaultProps} />);

      const logo = screen.getByAltText('BIGS Board');
      expect(logo.className).toContain('h-6');
      expect(logo.className).toContain('xs:h-7');
      expect(logo.className).toContain('sm:h-8');
    });

    it('사용자 이름은 반응형 텍스트 크기를 가진다', () => {
      const { container } = render(<Header {...defaultProps} />);

      const userInfo = container.querySelector('.text-gray-600');
      expect(userInfo?.className).toContain('text-xs');
      expect(userInfo?.className).toContain('xs:text-sm');
    });

    it('버튼들은 반응형 패딩을 가진다', () => {
      render(<Header {...defaultProps} />);

      const logoutButton = screen.getByText('로그아웃');
      expect(logoutButton.className).toContain('px-2');
      expect(logoutButton.className).toContain('xs:px-3');
      expect(logoutButton.className).toContain('sm:px-4');
    });

    it('버튼 그룹은 반응형 gap을 가진다', () => {
      const { container } = render(<Header {...defaultProps} />);

      const buttonGroup = container.querySelector('.gap-2.xs\\:gap-3');
      expect(buttonGroup).toBeInTheDocument();
    });
  });

  describe('다양한 시나리오', () => {
    it('사용자와 액션 버튼이 모두 있을 때 올바르게 렌더링된다', () => {
      const actionButton = {
        label: '글쓰기',
        onClick: mockActionButtonClick,
      };

      render(<Header {...defaultProps} actionButton={actionButton} />);

      expect(screen.getByText('홍길동')).toBeInTheDocument();
      expect(screen.getByText('글쓰기')).toBeInTheDocument();
      expect(screen.getByText('로그아웃')).toBeInTheDocument();
    });

    it('사용자 없이도 헤더를 렌더링할 수 있다', () => {
      render(<Header {...defaultProps} user={null} />);

      expect(screen.getByAltText('BIGS Board')).toBeInTheDocument();
      expect(screen.getByText('로그아웃')).toBeInTheDocument();
    });

    it('긴 사용자 이름도 처리할 수 있다', () => {
      const longNameUser = {
        name: '매우긴사용자이름입니다',
        username: 'long@example.com',
      };

      render(<Header {...defaultProps} user={longNameUser} />);

      expect(screen.getByText('매우긴사용자이름입니다')).toBeInTheDocument();
    });
  });
});
