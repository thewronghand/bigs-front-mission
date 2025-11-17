import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DraftsList from './DraftsList';
import type { PostCategory } from '../../types/post';

interface PostDraft {
  title: string;
  content: string;
  category: PostCategory;
  timestamp: number;
}

describe('DraftsList', () => {
  const mockOnToggle = vi.fn();
  const mockOnLoadDraft = vi.fn();
  const mockOnDeleteDraft = vi.fn();

  const mockDrafts: PostDraft[] = [
    {
      title: '첫 번째 임시저장',
      content: '첫 번째 내용입니다.',
      category: 'NOTICE',
      timestamp: Date.now() - 1000,
    },
    {
      title: '두 번째 임시저장',
      content: '두 번째 내용입니다.',
      category: 'FREE',
      timestamp: Date.now() - 2000,
    },
  ];

  const defaultProps = {
    drafts: mockDrafts,
    isExpanded: false,
    onToggle: mockOnToggle,
    onLoadDraft: mockOnLoadDraft,
    onDeleteDraft: mockOnDeleteDraft,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('렌더링', () => {
    it('drafts가 비어있으면 null을 반환한다', () => {
      const { container } = render(<DraftsList {...defaultProps} drafts={[]} />);

      expect(container.firstChild).toBeNull();
    });

    it('drafts가 있으면 헤더를 렌더링한다', () => {
      render(<DraftsList {...defaultProps} />);

      expect(screen.getByText(/임시 저장된 글/)).toBeInTheDocument();
    });

    it('drafts 개수를 표시한다', () => {
      render(<DraftsList {...defaultProps} />);

      expect(screen.getByText('임시 저장된 글 (2)')).toBeInTheDocument();
    });

    it('화살표 아이콘을 렌더링한다', () => {
      render(<DraftsList {...defaultProps} />);

      expect(screen.getByText('▶')).toBeInTheDocument();
    });
  });

  describe('확장/축소', () => {
    it('초기에는 축소된 상태다', () => {
      const { container } = render(<DraftsList {...defaultProps} isExpanded={false} />);

      const expandableArea = container.querySelector('.max-h-0');
      expect(expandableArea).toBeInTheDocument();
      expect(expandableArea?.className).toContain('opacity-0');
    });

    it('확장되면 max-h-[600px]를 가진다', () => {
      const { container } = render(<DraftsList {...defaultProps} isExpanded={true} />);

      const expandableArea = container.querySelector('.max-h-\\[600px\\]');
      expect(expandableArea).toBeInTheDocument();
      expect(expandableArea?.className).toContain('opacity-100');
    });

    it('헤더 클릭 시 onToggle이 호출된다', async () => {
      const user = userEvent.setup();
      render(<DraftsList {...defaultProps} />);

      const header = screen.getByText(/임시 저장된 글/).closest('div');
      await user.click(header!);

      expect(mockOnToggle).toHaveBeenCalledTimes(1);
    });

    it('확장 시 화살표가 90도 회전한다', () => {
      const { container } = render(<DraftsList {...defaultProps} isExpanded={true} />);

      const arrow = screen.getByText('▶');
      expect(arrow.className).toContain('rotate-90');
    });

    it('축소 시 화살표가 0도다', () => {
      const { container } = render(<DraftsList {...defaultProps} isExpanded={false} />);

      const arrow = screen.getByText('▶');
      expect(arrow.className).toContain('rotate-0');
    });
  });

  describe('draft 카드', () => {
    it('확장되면 모든 drafts를 렌더링한다', () => {
      render(<DraftsList {...defaultProps} isExpanded={true} />);

      expect(screen.getByText('첫 번째 임시저장')).toBeInTheDocument();
      expect(screen.getByText('두 번째 임시저장')).toBeInTheDocument();
    });

    it('제목이 없으면 "(제목 없음)"을 표시한다', () => {
      const draftsWithoutTitle = [
        { ...mockDrafts[0], title: '' },
      ];
      render(<DraftsList {...defaultProps} drafts={draftsWithoutTitle} isExpanded={true} />);

      expect(screen.getByText('(제목 없음)')).toBeInTheDocument();
    });

    it('카테고리를 표시한다', () => {
      render(<DraftsList {...defaultProps} isExpanded={true} />);

      expect(screen.getByText(/NOTICE/)).toBeInTheDocument();
      expect(screen.getByText(/FREE/)).toBeInTheDocument();
    });

    it('타임스탬프를 한국어 형식으로 표시한다', () => {
      const { container } = render(<DraftsList {...defaultProps} isExpanded={true} />);

      const timestampElements = container.querySelectorAll('.text-gray-500');
      // 각 draft마다 타임스탬프가 있어야 함
      expect(timestampElements.length).toBeGreaterThanOrEqual(2);
    });

    it('각 draft마다 삭제 버튼을 렌더링한다', () => {
      render(<DraftsList {...defaultProps} isExpanded={true} />);

      const deleteButtons = screen.getAllByText('삭제');
      expect(deleteButtons).toHaveLength(2);
    });
  });

  describe('draft 로드', () => {
    it('draft 카드 클릭 시 onLoadDraft가 호출된다', async () => {
      const user = userEvent.setup();
      render(<DraftsList {...defaultProps} isExpanded={true} />);

      const draftCard = screen.getByText('첫 번째 임시저장');
      await user.click(draftCard);

      expect(mockOnLoadDraft).toHaveBeenCalledTimes(1);
      expect(mockOnLoadDraft).toHaveBeenCalledWith(mockDrafts[0]);
    });

    it('draft 내용 영역 클릭 시 onLoadDraft가 호출된다', async () => {
      const user = userEvent.setup();
      render(<DraftsList {...defaultProps} isExpanded={true} />);

      // 제목 요소를 클릭
      const title = screen.getByText('첫 번째 임시저장');
      await user.click(title);

      expect(mockOnLoadDraft).toHaveBeenCalledWith(mockDrafts[0]);
    });
  });

  describe('draft 삭제', () => {
    it('삭제 버튼 클릭 시 onDeleteDraft가 호출된다', async () => {
      const user = userEvent.setup();
      render(<DraftsList {...defaultProps} isExpanded={true} />);

      const deleteButtons = screen.getAllByText('삭제');
      await user.click(deleteButtons[0]);

      expect(mockOnDeleteDraft).toHaveBeenCalledTimes(1);
      expect(mockOnDeleteDraft).toHaveBeenCalledWith(mockDrafts[0].timestamp);
    });

    it('삭제 버튼은 danger 스타일이다', () => {
      render(<DraftsList {...defaultProps} isExpanded={true} />);

      const deleteButtons = screen.getAllByText('삭제');
      deleteButtons.forEach((button) => {
        expect(button.className).toContain('bg-red-400');
      });
    });

    it('삭제 버튼은 sm 사이즈다', () => {
      render(<DraftsList {...defaultProps} isExpanded={true} />);

      const deleteButtons = screen.getAllByText('삭제');
      deleteButtons.forEach((button) => {
        expect(button.className).toContain('text-sm');
      });
    });
  });

  describe('스타일링', () => {
    it('파란색 배경과 테두리를 가진다', () => {
      const { container } = render(<DraftsList {...defaultProps} />);

      const wrapper = container.querySelector('.bg-blue-50');
      expect(wrapper).toBeInTheDocument();
      expect(wrapper?.className).toContain('border-blue-200');
    });

    it('헤더는 호버 효과를 가진다', () => {
      const { container } = render(<DraftsList {...defaultProps} />);

      const header = screen.getByText(/임시 저장된 글/).closest('div');
      expect(header?.className).toContain('cursor-pointer');
      expect(header?.className).toContain('hover:bg-blue-100');
    });

    it('카드는 흰색 배경을 가진다', () => {
      const { container } = render(<DraftsList {...defaultProps} isExpanded={true} />);

      const cards = container.querySelectorAll('.bg-white');
      expect(cards.length).toBeGreaterThanOrEqual(2);
    });

    it('확장/축소 애니메이션을 가진다', () => {
      const { container } = render(<DraftsList {...defaultProps} />);

      const expandableArea = container.querySelector('.transition-all');
      expect(expandableArea).toBeInTheDocument();
      expect(expandableArea?.className).toContain('duration-300');
      expect(expandableArea?.className).toContain('ease-in-out');
    });

    it('화살표는 회전 애니메이션을 가진다', () => {
      render(<DraftsList {...defaultProps} />);

      const arrow = screen.getByText('▶');
      expect(arrow.className).toContain('transition-transform');
      expect(arrow.className).toContain('duration-200');
    });
  });

  describe('그리드 레이아웃', () => {
    it('그리드 레이아웃을 사용한다', () => {
      const { container } = render(<DraftsList {...defaultProps} isExpanded={true} />);

      const grid = container.querySelector('.grid');
      expect(grid).toBeInTheDocument();
    });

    it('모바일에서 1열 레이아웃이다', () => {
      const { container } = render(<DraftsList {...defaultProps} isExpanded={true} />);

      const grid = container.querySelector('.grid');
      expect(grid?.className).toContain('grid-cols-1');
    });

    it('sm에서 2열 레이아웃이다', () => {
      const { container } = render(<DraftsList {...defaultProps} isExpanded={true} />);

      const grid = container.querySelector('.grid');
      expect(grid?.className).toContain('sm:grid-cols-2');
    });

    it('lg에서 3열 레이아웃이다', () => {
      const { container } = render(<DraftsList {...defaultProps} isExpanded={true} />);

      const grid = container.querySelector('.grid');
      expect(grid?.className).toContain('lg:grid-cols-3');
    });
  });

  describe('반응형', () => {
    it('헤더는 반응형 패딩을 가진다', () => {
      const { container } = render(<DraftsList {...defaultProps} />);

      const header = screen.getByText(/임시 저장된 글/).closest('div');
      expect(header?.className).toContain('p-3');
      expect(header?.className).toContain('xs:p-4');
    });

    it('제목은 반응형 텍스트 크기를 가진다', () => {
      render(<DraftsList {...defaultProps} />);

      const title = screen.getByText(/임시 저장된 글/);
      expect(title.className).toContain('text-xs');
      expect(title.className).toContain('xs:text-sm');
    });
  });

  describe('여러 drafts', () => {
    it('많은 drafts를 렌더링할 수 있다', () => {
      const manyDrafts = Array.from({ length: 10 }, (_, i) => ({
        title: `Draft ${i + 1}`,
        content: `Content ${i + 1}`,
        category: 'NOTICE' as PostCategory,
        timestamp: Date.now() - i * 1000,
      }));

      render(<DraftsList {...defaultProps} drafts={manyDrafts} isExpanded={true} />);

      expect(screen.getByText('임시 저장된 글 (10)')).toBeInTheDocument();
      expect(screen.getByText('Draft 1')).toBeInTheDocument();
      expect(screen.getByText('Draft 10')).toBeInTheDocument();
    });
  });

  describe('내용 미리보기', () => {
    it('태블릿/데스크톱에서만 내용 미리보기를 표시한다', () => {
      const { container } = render(<DraftsList {...defaultProps} isExpanded={true} />);

      // hidden sm:line-clamp-1 클래스를 가진 요소 확인
      const previews = container.querySelectorAll('.sm\\:line-clamp-1');
      expect(previews.length).toBeGreaterThan(0);
    });

    it('내용이 없으면 "내용 없음"을 표시한다', () => {
      const draftsWithoutContent = [
        { ...mockDrafts[0], content: '' },
      ];
      render(<DraftsList {...defaultProps} drafts={draftsWithoutContent} isExpanded={true} />);

      expect(screen.getByText('내용 없음')).toBeInTheDocument();
    });
  });
});
