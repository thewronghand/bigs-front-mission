import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Pagination from './Pagination';

// Mock react-icons
vi.mock('react-icons/md', () => ({
  MdFirstPage: () => <span>«</span>,
  MdLastPage: () => <span>»</span>,
  MdNavigateBefore: () => <span>‹</span>,
  MdNavigateNext: () => <span>›</span>,
}));

describe('Pagination', () => {
  const mockOnPageChange = vi.fn();

  const defaultProps = {
    currentPage: 0,
    totalPages: 10,
    onPageChange: mockOnPageChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('렌더링', () => {
    it('페이지 번호 버튼들을 렌더링한다', () => {
      render(<Pagination {...defaultProps} />);

      // 페이지 버튼 표시 확인 (컨테이너 너비에 따라 7개 또는 9개)
      expect(screen.getByText('1')).toBeInTheDocument();
      // 최소 7개는 표시되므로 7은 항상 있어야 함
      expect(screen.getByText('7')).toBeInTheDocument();
    });

    it('현재 페이지를 하이라이트한다', () => {
      const { container } = render(<Pagination {...defaultProps} currentPage={5} />);

      const buttons = container.querySelectorAll('button');
      const currentButton = Array.from(buttons).find((btn) => btn.textContent === '6'); // 5+1

      expect(currentButton?.className).toContain('bg-blue-200');
      expect(currentButton?.className).toContain('text-blue-500');
    });

    it('총 페이지가 9개 이하일 때 모든 페이지를 표시한다', () => {
      const { container } = render(<Pagination {...defaultProps} totalPages={5} />);

      const pageButtons = container.querySelectorAll('button');
      const pageNumbers = Array.from(pageButtons)
        .map((btn) => btn.textContent)
        .filter((text) => /^\d+$/.test(text || ''));

      expect(pageNumbers).toHaveLength(5);
      expect(pageNumbers).toEqual(['1', '2', '3', '4', '5']);
    });
  });

  describe('페이지 클릭', () => {
    it('페이지 번호 클릭 시 onPageChange가 호출된다', async () => {
      const user = userEvent.setup();
      const { container } = render(<Pagination {...defaultProps} />);

      const pageButton = Array.from(container.querySelectorAll('button')).find(
        (btn) => btn.textContent === '5'
      );

      await user.click(pageButton!);

      expect(mockOnPageChange).toHaveBeenCalledWith(4); // 5-1 = 4 (0-based)
    });

    it('현재 페이지를 다시 클릭해도 onPageChange가 호출된다', async () => {
      const user = userEvent.setup();
      const { container } = render(<Pagination {...defaultProps} currentPage={3} />);

      const currentButton = Array.from(container.querySelectorAll('button')).find(
        (btn) => btn.textContent === '4' && btn.className.includes('bg-blue-200')
      );

      await user.click(currentButton!);

      expect(mockOnPageChange).toHaveBeenCalledWith(3);
    });
  });

  describe('페이지 범위 계산', () => {
    it('첫 페이지 근처에서는 1부터 시작한다', () => {
      const { container } = render(<Pagination {...defaultProps} currentPage={2} totalPages={20} />);

      const pageButtons = Array.from(container.querySelectorAll('button'))
        .map((btn) => btn.textContent)
        .filter((text) => /^\d+$/.test(text || ''));

      // 첫 페이지는 항상 1부터 시작
      expect(pageButtons[0]).toBe('1');
      // 7개 또는 9개 표시
      expect(pageButtons.length).toBeGreaterThanOrEqual(7);
      expect(pageButtons.length).toBeLessThanOrEqual(9);
    });

    it('중간 페이지에서는 현재 페이지를 포함한다', () => {
      const { container } = render(<Pagination {...defaultProps} currentPage={10} totalPages={30} />);

      const pageButtons = Array.from(container.querySelectorAll('button'))
        .map((btn) => btn.textContent)
        .filter((text) => /^\d+$/.test(text || ''));

      // 현재 페이지(11)가 포함되어 있어야 함
      expect(pageButtons).toContain('11');
      // 7개 또는 9개 표시
      expect(pageButtons.length).toBeGreaterThanOrEqual(7);
      expect(pageButtons.length).toBeLessThanOrEqual(9);
    });

    it('마지막 페이지에서는 끝에서부터 역산하여 표시한다', () => {
      // 마지막 페이지(index 29 = page 30)로 이동
      const { container } = render(<Pagination {...defaultProps} currentPage={29} totalPages={30} />);

      const pageButtons = Array.from(container.querySelectorAll('button'))
        .map((btn) => btn.textContent)
        .filter((text) => /^\d+$/.test(text || ''));

      // 마지막 페이지(30)가 포함되어 있어야 함
      expect(pageButtons[pageButtons.length - 1]).toBe('30');
      // 7개 또는 9개 표시
      expect(pageButtons.length).toBeGreaterThanOrEqual(7);
      expect(pageButtons.length).toBeLessThanOrEqual(9);
    });
  });

  describe('내비게이션 버튼 - 첫 페이지', () => {
    it('첫 페이지에서 첫 페이지 버튼은 투명하다', () => {
      const { container } = render(<Pagination {...defaultProps} currentPage={0} />);

      const firstButton = Array.from(container.querySelectorAll('button')).find(
        (btn) => btn.textContent === '«'
      );

      expect(firstButton?.className).toContain('opacity-0');
      expect(firstButton?.className).toContain('cursor-default');
    });

    it('첫 페이지가 아닐 때 첫 페이지 버튼을 클릭할 수 있다', async () => {
      const user = userEvent.setup();
      const { container } = render(<Pagination {...defaultProps} currentPage={5} />);

      const firstButton = Array.from(container.querySelectorAll('button')).find(
        (btn) => btn.textContent === '«'
      );

      await user.click(firstButton!);

      expect(mockOnPageChange).toHaveBeenCalledWith(0);
    });
  });

  describe('내비게이션 버튼 - 마지막 페이지', () => {
    it('마지막 페이지에서 마지막 페이지 버튼은 투명하다', () => {
      const { container } = render(<Pagination {...defaultProps} currentPage={9} />);

      const lastButton = Array.from(container.querySelectorAll('button')).find(
        (btn) => btn.textContent === '»'
      );

      expect(lastButton?.className).toContain('opacity-0');
      expect(lastButton?.className).toContain('cursor-default');
    });

    it('마지막 페이지가 아닐 때 마지막 페이지 버튼을 클릭할 수 있다', async () => {
      const user = userEvent.setup();
      const { container } = render(<Pagination {...defaultProps} currentPage={5} />);

      const lastButton = Array.from(container.querySelectorAll('button')).find(
        (btn) => btn.textContent === '»'
      );

      await user.click(lastButton!);

      expect(mockOnPageChange).toHaveBeenCalledWith(9); // totalPages - 1
    });
  });

  describe('내비게이션 버튼 - 이전 10페이지', () => {
    it('첫 페이지에서 이전 10페이지 버튼은 투명하다', () => {
      const { container } = render(<Pagination {...defaultProps} currentPage={0} />);

      const prevButton = Array.from(container.querySelectorAll('button')).find(
        (btn) => btn.textContent === '‹'
      );

      expect(prevButton?.className).toContain('opacity-0');
    });

    it('10페이지 이상에서 이전 10페이지 버튼을 클릭하면 -10 페이지로 이동한다', async () => {
      const user = userEvent.setup();
      const { container } = render(<Pagination {...defaultProps} currentPage={15} totalPages={30} />);

      const prevButton = Array.from(container.querySelectorAll('button')).find(
        (btn) => btn.textContent === '‹'
      );

      await user.click(prevButton!);

      expect(mockOnPageChange).toHaveBeenCalledWith(5); // 15 - 10
    });

    it('10페이지 미만에서 이전 10페이지 버튼을 클릭하면 0페이지로 이동한다', async () => {
      const user = userEvent.setup();
      const { container } = render(<Pagination {...defaultProps} currentPage={5} totalPages={30} />);

      const prevButton = Array.from(container.querySelectorAll('button')).find(
        (btn) => btn.textContent === '‹'
      );

      await user.click(prevButton!);

      expect(mockOnPageChange).toHaveBeenCalledWith(0); // Math.max(0, 5-10)
    });
  });

  describe('내비게이션 버튼 - 다음 10페이지', () => {
    it('마지막 페이지에서 다음 10페이지 버튼은 투명하다', () => {
      const { container } = render(<Pagination {...defaultProps} currentPage={9} />);

      const nextButton = Array.from(container.querySelectorAll('button')).find(
        (btn) => btn.textContent === '›'
      );

      expect(nextButton?.className).toContain('opacity-0');
    });

    it('다음 10페이지 버튼을 클릭하면 +10 페이지로 이동한다', async () => {
      const user = userEvent.setup();
      const { container } = render(<Pagination {...defaultProps} currentPage={5} totalPages={30} />);

      const nextButton = Array.from(container.querySelectorAll('button')).find(
        (btn) => btn.textContent === '›'
      );

      await user.click(nextButton!);

      expect(mockOnPageChange).toHaveBeenCalledWith(15); // 5 + 10
    });

    it('마지막 페이지 근처에서 다음 10페이지 버튼을 클릭하면 마지막 페이지로 이동한다', async () => {
      const user = userEvent.setup();
      const { container } = render(<Pagination {...defaultProps} currentPage={25} totalPages={30} />);

      const nextButton = Array.from(container.querySelectorAll('button')).find(
        (btn) => btn.textContent === '›'
      );

      await user.click(nextButton!);

      expect(mockOnPageChange).toHaveBeenCalledWith(29); // Math.min(29, 25+10)
    });
  });

  describe('스타일링', () => {
    it('현재 페이지가 아닌 버튼은 회색 배경을 가진다', () => {
      const { container } = render(<Pagination {...defaultProps} currentPage={5} />);

      // 현재 페이지(6)가 아닌 다른 페이지 버튼 찾기
      const nonCurrentButton = Array.from(container.querySelectorAll('button')).find(
        (btn) => /^\d+$/.test(btn.textContent || '') && !btn.className.includes('bg-blue-200')
      );

      expect(nonCurrentButton).toBeTruthy();
      expect(nonCurrentButton?.className).toContain('bg-gray-200');
      expect(nonCurrentButton?.className).toContain('hover:bg-gray-300');
    });

    it('모든 페이지 버튼은 mono 폰트를 사용한다', () => {
      const { container } = render(<Pagination {...defaultProps} />);

      const pageButton = Array.from(container.querySelectorAll('button')).find(
        (btn) => /^\d+$/.test(btn.textContent || '')
      );

      expect(pageButton?.className).toContain('font-mono');
    });
  });

  describe('엣지 케이스', () => {
    it('totalPages가 1일 때 한 개의 페이지만 표시한다', () => {
      const { container } = render(<Pagination {...defaultProps} totalPages={1} />);

      const pageButtons = Array.from(container.querySelectorAll('button'))
        .map((btn) => btn.textContent)
        .filter((text) => /^\d+$/.test(text || ''));

      expect(pageButtons).toEqual(['1']);
    });

    it('totalPages가 0일 때 페이지 버튼을 표시하지 않는다', () => {
      const { container } = render(<Pagination {...defaultProps} totalPages={0} />);

      const pageButtons = Array.from(container.querySelectorAll('button'))
        .map((btn) => btn.textContent)
        .filter((text) => /^\d+$/.test(text || ''));

      expect(pageButtons).toHaveLength(0);
    });

    it('매우 많은 페이지(100+)를 처리할 수 있다', () => {
      const { container } = render(<Pagination {...defaultProps} currentPage={50} totalPages={200} />);

      const pageButtons = Array.from(container.querySelectorAll('button'))
        .map((btn) => btn.textContent)
        .filter((text) => /^\d+$/.test(text || ''));

      // 9개의 페이지 버튼이 표시되어야 함
      expect(pageButtons.length).toBeLessThanOrEqual(9);
      expect(pageButtons).toContain('51'); // currentPage + 1
    });
  });

  describe('반응형 클래스', () => {
    it('@container 클래스를 가진다', () => {
      const { container } = render(<Pagination {...defaultProps} />);

      const containerDiv = container.querySelector('.\\@container');
      expect(containerDiv).toBeInTheDocument();
    });

    it('내비게이션 버튼들은 반응형 hidden 클래스를 가진다', () => {
      const { container } = render(<Pagination {...defaultProps} currentPage={5} />);

      // 첫 페이지 버튼 (430px 이상에서만 표시)
      const firstButton = Array.from(container.querySelectorAll('button')).find(
        (btn) => btn.textContent === '«'
      );
      expect(firstButton?.className).toMatch(/@\[430px\]:flex/);
      expect(firstButton?.className).toContain('hidden');

      // 이전 10페이지 버튼 (360px 이상에서만 표시)
      const prevButton = Array.from(container.querySelectorAll('button')).find(
        (btn) => btn.textContent === '‹'
      );
      expect(prevButton?.className).toMatch(/@\[360px\]:flex/);
      expect(prevButton?.className).toContain('hidden');
    });
  });
});
