import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PostCard from './PostCard';
import type { PostListItem } from '../../types/post';

// Mock formatDate
vi.mock('../../utils/dateFormat', () => ({
  formatDate: (date: string) => `포맷된 ${date}`,
}));

// Mock react-icons
vi.mock('react-icons/bs', () => ({
  BsThreeDotsVertical: () => <div data-testid="menu-icon">⋮</div>,
}));

describe('PostCard', () => {
  const mockPost: PostListItem = {
    id: 1,
    title: '테스트 게시글',
    category: 'NOTICE',
    createdAt: '2024-01-01T00:00:00',
  };

  const mockOnClick = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  const defaultProps = {
    post: mockPost,
    onClick: mockOnClick,
    onEdit: mockOnEdit,
    onDelete: mockOnDelete,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('렌더링', () => {
    it('게시글 제목을 렌더링한다', () => {
      render(<PostCard {...defaultProps} />);

      expect(screen.getByText('테스트 게시글')).toBeInTheDocument();
    });

    it('카테고리를 렌더링한다', () => {
      render(<PostCard {...defaultProps} />);

      expect(screen.getByText('NOTICE')).toBeInTheDocument();
    });

    it('포맷된 날짜를 렌더링한다', () => {
      render(<PostCard {...defaultProps} />);

      expect(screen.getByText('포맷된 2024-01-01T00:00:00')).toBeInTheDocument();
    });

    it('메뉴 버튼을 렌더링한다', () => {
      render(<PostCard {...defaultProps} />);

      expect(screen.getByTestId('menu-icon')).toBeInTheDocument();
    });
  });

  describe('클릭 이벤트', () => {
    it('카드 클릭 시 onClick이 호출된다', async () => {
      const user = userEvent.setup();
      render(<PostCard {...defaultProps} />);

      const card = screen.getByText('테스트 게시글').closest('div');
      await user.click(card!);

      expect(mockOnClick).toHaveBeenCalledWith(1);
    });

    it('메뉴 버튼 클릭 시 onClick이 호출되지 않는다', async () => {
      const user = userEvent.setup();
      render(<PostCard {...defaultProps} />);

      const menuButton = screen.getByLabelText('메뉴');
      await user.click(menuButton);

      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe('메뉴 표시/숨김', () => {
    it('초기에는 메뉴가 숨겨져 있다', () => {
      render(<PostCard {...defaultProps} />);

      expect(screen.queryByText('수정')).not.toBeInTheDocument();
      expect(screen.queryByText('삭제')).not.toBeInTheDocument();
    });

    it('메뉴 버튼 클릭 시 메뉴가 표시된다', async () => {
      const user = userEvent.setup();
      render(<PostCard {...defaultProps} />);

      const menuButton = screen.getByLabelText('메뉴');
      await user.click(menuButton);

      expect(screen.getByText('수정')).toBeInTheDocument();
      expect(screen.getByText('삭제')).toBeInTheDocument();
    });

    it('메뉴 버튼을 다시 클릭하면 메뉴가 숨겨진다', async () => {
      const user = userEvent.setup();
      render(<PostCard {...defaultProps} />);

      const menuButton = screen.getByLabelText('메뉴');

      // 메뉴 열기
      await user.click(menuButton);
      expect(screen.getByText('수정')).toBeInTheDocument();

      // 메뉴 닫기
      await user.click(menuButton);
      expect(screen.queryByText('수정')).not.toBeInTheDocument();
    });

    it('외부 클릭 시 메뉴가 닫힌다', async () => {
      const user = userEvent.setup();
      render(<PostCard {...defaultProps} />);

      const menuButton = screen.getByLabelText('메뉴');

      // 메뉴 열기
      await user.click(menuButton);
      expect(screen.getByText('수정')).toBeInTheDocument();

      // 외부 클릭
      fireEvent.mouseDown(document.body);

      expect(screen.queryByText('수정')).not.toBeInTheDocument();
    });
  });

  describe('수정 버튼', () => {
    it('수정 버튼 클릭 시 onEdit이 호출된다', async () => {
      const user = userEvent.setup();
      render(<PostCard {...defaultProps} />);

      const menuButton = screen.getByLabelText('메뉴');
      await user.click(menuButton);

      const editButton = screen.getByText('수정');
      await user.click(editButton);

      expect(mockOnEdit).toHaveBeenCalledWith(1);
    });

    it('수정 버튼 클릭 후 메뉴가 닫힌다', async () => {
      const user = userEvent.setup();
      render(<PostCard {...defaultProps} />);

      const menuButton = screen.getByLabelText('메뉴');
      await user.click(menuButton);

      const editButton = screen.getByText('수정');
      await user.click(editButton);

      expect(screen.queryByText('수정')).not.toBeInTheDocument();
    });

    it('수정 버튼 클릭 시 카드의 onClick이 호출되지 않는다', async () => {
      const user = userEvent.setup();
      render(<PostCard {...defaultProps} />);

      const menuButton = screen.getByLabelText('메뉴');
      await user.click(menuButton);

      const editButton = screen.getByText('수정');
      await user.click(editButton);

      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe('삭제 버튼', () => {
    it('삭제 버튼 클릭 시 onDelete가 호출된다', async () => {
      const user = userEvent.setup();
      render(<PostCard {...defaultProps} />);

      const menuButton = screen.getByLabelText('메뉴');
      await user.click(menuButton);

      const deleteButton = screen.getByText('삭제');
      await user.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledWith(1);
    });

    it('삭제 버튼 클릭 후 메뉴가 닫힌다', async () => {
      const user = userEvent.setup();
      render(<PostCard {...defaultProps} />);

      const menuButton = screen.getByLabelText('메뉴');
      await user.click(menuButton);

      const deleteButton = screen.getByText('삭제');
      await user.click(deleteButton);

      expect(screen.queryByText('삭제')).not.toBeInTheDocument();
    });

    it('삭제 버튼은 빨간색 텍스트다', async () => {
      const user = userEvent.setup();
      render(<PostCard {...defaultProps} />);

      const menuButton = screen.getByLabelText('메뉴');
      await user.click(menuButton);

      const deleteButton = screen.getByText('삭제');
      expect(deleteButton.className).toContain('text-red-600');
    });
  });

  describe('스타일링', () => {
    it('카드는 배경색과 그림자를 가진다', () => {
      const { container } = render(<PostCard {...defaultProps} />);

      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('bg-white');
      expect(card.className).toContain('shadow');
      expect(card.className).toContain('rounded-lg');
    });

    it('카테고리 배지는 파란색이다', () => {
      render(<PostCard {...defaultProps} />);

      const badge = screen.getByText('NOTICE');
      expect(badge.className).toContain('bg-blue-100');
      expect(badge.className).toContain('text-blue-800');
    });

    it('메뉴가 열려있을 때 추가 스타일이 적용된다', async () => {
      const user = userEvent.setup();
      const { container } = render(<PostCard {...defaultProps} />);

      const card = container.firstChild as HTMLElement;
      const menuButton = screen.getByLabelText('메뉴');

      await user.click(menuButton);

      expect(card.className).toContain('shadow-md');
      expect(card.className).toContain('z-30');
    });
  });

  describe('다양한 게시글 데이터', () => {
    it('긴 제목도 렌더링할 수 있다', () => {
      const longTitlePost = {
        ...mockPost,
        title: '매우 긴 제목입니다. '.repeat(10),
      };

      const { container } = render(<PostCard {...defaultProps} post={longTitlePost} />);

      const titleElement = container.querySelector('h3');
      expect(titleElement?.textContent).toBe(longTitlePost.title);
    });

    it('다양한 카테고리를 표시할 수 있다', () => {
      const { rerender } = render(<PostCard {...defaultProps} />);

      expect(screen.getByText('NOTICE')).toBeInTheDocument();

      rerender(
        <PostCard {...defaultProps} post={{ ...mockPost, category: 'FREE' }} />
      );

      expect(screen.getByText('FREE')).toBeInTheDocument();
    });
  });
});
