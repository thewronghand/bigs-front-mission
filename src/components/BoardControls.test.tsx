import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BoardControls from './BoardControls';

describe('BoardControls', () => {
  const mockOnParamsChange = vi.fn();

  const defaultProps = {
    totalPages: 10,
    pageSize: 12,
    sortOrder: 'desc' as const,
    onParamsChange: mockOnParamsChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('렌더링', () => {
    it('페이지 입력창을 렌더링한다', () => {
      render(<BoardControls {...defaultProps} />);

      const input = screen.getByPlaceholderText('페이지');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'text');
    });

    it('이동 버튼을 렌더링한다', () => {
      render(<BoardControls {...defaultProps} />);

      expect(screen.getByText('이동')).toBeInTheDocument();
    });

    it('페이지 크기 선택 박스를 렌더링한다', () => {
      render(<BoardControls {...defaultProps} />);

      expect(screen.getByDisplayValue('12개')).toBeInTheDocument();
    });

    it('정렬 선택 박스를 렌더링한다', () => {
      render(<BoardControls {...defaultProps} />);

      expect(screen.getByDisplayValue('최신순')).toBeInTheDocument();
    });
  });

  describe('페이지 입력', () => {
    it('숫자만 입력할 수 있다', async () => {
      const user = userEvent.setup();
      render(<BoardControls {...defaultProps} />);

      const input = screen.getByPlaceholderText('페이지') as HTMLInputElement;

      await user.type(input, '123');
      expect(input.value).toBe('123');

      await user.clear(input);
      await user.type(input, 'abc');
      expect(input.value).toBe('');
    });

    it('특수문자는 입력할 수 없다', async () => {
      const user = userEvent.setup();
      render(<BoardControls {...defaultProps} />);

      const input = screen.getByPlaceholderText('페이지') as HTMLInputElement;

      await user.type(input, '!@#$');
      expect(input.value).toBe('');
    });

    it('빈 문자열을 허용한다', async () => {
      const user = userEvent.setup();
      render(<BoardControls {...defaultProps} />);

      const input = screen.getByPlaceholderText('페이지') as HTMLInputElement;

      await user.type(input, '5');
      expect(input.value).toBe('5');

      await user.clear(input);
      expect(input.value).toBe('');
    });
  });

  describe('페이지 이동', () => {
    it('유효한 페이지 번호로 이동한다', async () => {
      const user = userEvent.setup();
      render(<BoardControls {...defaultProps} />);

      const input = screen.getByPlaceholderText('페이지');
      const button = screen.getByText('이동');

      await user.type(input, '5');
      await user.click(button);

      expect(mockOnParamsChange).toHaveBeenCalledWith({
        page: '4', // 0-based index
        sort: 'desc',
        size: '12',
      });
    });

    it('Enter 키로 페이지 이동한다', async () => {
      const user = userEvent.setup();
      render(<BoardControls {...defaultProps} />);

      const input = screen.getByPlaceholderText('페이지');

      await user.type(input, '3');
      await user.keyboard('{Enter}');

      expect(mockOnParamsChange).toHaveBeenCalledWith({
        page: '2',
        sort: 'desc',
        size: '12',
      });
    });

    it('페이지 이동 후 입력창이 초기화된다', async () => {
      const user = userEvent.setup();
      render(<BoardControls {...defaultProps} />);

      const input = screen.getByPlaceholderText('페이지') as HTMLInputElement;
      const button = screen.getByText('이동');

      await user.type(input, '5');
      await user.click(button);

      expect(input.value).toBe('');
    });

    it('범위를 벗어난 페이지는 이동되지 않는다', async () => {
      const user = userEvent.setup();
      render(<BoardControls {...defaultProps} />);

      const input = screen.getByPlaceholderText('페이지');
      const button = screen.getByText('이동');

      await user.type(input, '100'); // totalPages = 10
      await user.click(button);

      expect(mockOnParamsChange).not.toHaveBeenCalled();
    });

    it('0 페이지는 이동되지 않는다', async () => {
      const user = userEvent.setup();
      render(<BoardControls {...defaultProps} />);

      const input = screen.getByPlaceholderText('페이지');
      const button = screen.getByText('이동');

      await user.type(input, '0');
      await user.click(button);

      expect(mockOnParamsChange).not.toHaveBeenCalled();
    });

    it('빈 입력은 이동되지 않는다', async () => {
      const user = userEvent.setup();
      render(<BoardControls {...defaultProps} />);

      const button = screen.getByText('이동');
      await user.click(button);

      expect(mockOnParamsChange).not.toHaveBeenCalled();
    });
  });

  describe('이동 버튼 활성화/비활성화', () => {
    it('빈 입력일 때 비활성화된다', () => {
      render(<BoardControls {...defaultProps} />);

      const button = screen.getByText('이동');
      expect(button).toBeDisabled();
    });

    it('유효한 페이지 입력 시 활성화된다', async () => {
      const user = userEvent.setup();
      render(<BoardControls {...defaultProps} />);

      const input = screen.getByPlaceholderText('페이지');
      const button = screen.getByText('이동');

      await user.type(input, '5');
      expect(button).not.toBeDisabled();
    });

    it('범위를 벗어난 페이지 입력 시 비활성화된다', async () => {
      const user = userEvent.setup();
      render(<BoardControls {...defaultProps} />);

      const input = screen.getByPlaceholderText('페이지');
      const button = screen.getByText('이동');

      await user.type(input, '100');
      expect(button).toBeDisabled();
    });

    it('1 페이지는 유효하다', async () => {
      const user = userEvent.setup();
      render(<BoardControls {...defaultProps} />);

      const input = screen.getByPlaceholderText('페이지');
      const button = screen.getByText('이동');

      await user.type(input, '1');
      expect(button).not.toBeDisabled();
    });

    it('마지막 페이지는 유효하다', async () => {
      const user = userEvent.setup();
      render(<BoardControls {...defaultProps} />);

      const input = screen.getByPlaceholderText('페이지');
      const button = screen.getByText('이동');

      await user.type(input, '10');
      expect(button).not.toBeDisabled();
    });
  });

  describe('페이지 크기 변경', () => {
    it('12개를 선택할 수 있다', async () => {
      const user = userEvent.setup();
      render(<BoardControls {...defaultProps} />);

      const select = screen.getByDisplayValue('12개');
      await user.selectOptions(select, '12');

      expect(mockOnParamsChange).toHaveBeenCalledWith({
        page: '0',
        sort: 'desc',
        size: '12',
      });
    });

    it('18개를 선택할 수 있다', async () => {
      const user = userEvent.setup();
      render(<BoardControls {...defaultProps} />);

      const select = screen.getByDisplayValue('12개');
      await user.selectOptions(select, '18');

      expect(mockOnParamsChange).toHaveBeenCalledWith({
        page: '0',
        sort: 'desc',
        size: '18',
      });
    });

    it('24개를 선택할 수 있다', async () => {
      const user = userEvent.setup();
      render(<BoardControls {...defaultProps} />);

      const select = screen.getByDisplayValue('12개');
      await user.selectOptions(select, '24');

      expect(mockOnParamsChange).toHaveBeenCalledWith({
        page: '0',
        sort: 'desc',
        size: '24',
      });
    });

    it('페이지 크기 변경 시 첫 페이지로 이동한다', async () => {
      const user = userEvent.setup();
      render(<BoardControls {...defaultProps} />);

      const select = screen.getByDisplayValue('12개');
      await user.selectOptions(select, '24');

      expect(mockOnParamsChange).toHaveBeenCalledWith(
        expect.objectContaining({ page: '0' })
      );
    });

    it('현재 선택된 페이지 크기를 표시한다', () => {
      render(<BoardControls {...defaultProps} pageSize={18} />);

      expect(screen.getByDisplayValue('18개')).toBeInTheDocument();
    });
  });

  describe('정렬 순서 변경', () => {
    it('최신순을 선택할 수 있다', async () => {
      const user = userEvent.setup();
      render(<BoardControls {...defaultProps} sortOrder="asc" />);

      const select = screen.getByDisplayValue('오래된순');
      await user.selectOptions(select, 'desc');

      expect(mockOnParamsChange).toHaveBeenCalledWith({
        page: '0',
        sort: 'desc',
        size: '12',
      });
    });

    it('오래된순을 선택할 수 있다', async () => {
      const user = userEvent.setup();
      render(<BoardControls {...defaultProps} />);

      const select = screen.getByDisplayValue('최신순');
      await user.selectOptions(select, 'asc');

      expect(mockOnParamsChange).toHaveBeenCalledWith({
        page: '0',
        sort: 'asc',
        size: '12',
      });
    });

    it('정렬 순서 변경 시 첫 페이지로 이동한다', async () => {
      const user = userEvent.setup();
      render(<BoardControls {...defaultProps} />);

      const select = screen.getByDisplayValue('최신순');
      await user.selectOptions(select, 'asc');

      expect(mockOnParamsChange).toHaveBeenCalledWith(
        expect.objectContaining({ page: '0' })
      );
    });

    it('현재 선택된 정렬을 표시한다', () => {
      render(<BoardControls {...defaultProps} sortOrder="asc" />);

      expect(screen.getByDisplayValue('오래된순')).toBeInTheDocument();
    });
  });

  describe('스타일링', () => {
    it('오른쪽 정렬이다', () => {
      const { container } = render(<BoardControls {...defaultProps} />);

      const wrapper = container.querySelector('.justify-end');
      expect(wrapper).toBeInTheDocument();
    });

    it('flex wrap을 사용한다', () => {
      const { container } = render(<BoardControls {...defaultProps} />);

      const wrapper = container.querySelector('.flex-wrap');
      expect(wrapper).toBeInTheDocument();
    });

    it('입력창은 중앙 정렬 텍스트를 가진다', () => {
      render(<BoardControls {...defaultProps} />);

      const input = screen.getByPlaceholderText('페이지');
      expect(input.className).toContain('text-center');
    });

    it('select 요소들은 border와 rounded를 가진다', () => {
      const { container } = render(<BoardControls {...defaultProps} />);

      const selects = container.querySelectorAll('select');
      selects.forEach((select) => {
        expect(select.className).toContain('border');
        expect(select.className).toContain('rounded-lg');
      });
    });
  });

  describe('반응형', () => {
    it('입력창은 반응형 너비를 가진다', () => {
      render(<BoardControls {...defaultProps} />);

      const input = screen.getByPlaceholderText('페이지');
      expect(input.className).toContain('w-16');
      expect(input.className).toContain('xs:w-20');
      expect(input.className).toContain('sm:w-24');
    });

    it('입력창과 select는 반응형 패딩을 가진다', () => {
      render(<BoardControls {...defaultProps} />);

      const input = screen.getByPlaceholderText('페이지');
      expect(input.className).toContain('px-2');
      expect(input.className).toContain('xs:px-3');
      expect(input.className).toContain('py-1.5');
      expect(input.className).toContain('xs:py-2');
    });

    it('반응형 텍스트 크기를 가진다', () => {
      render(<BoardControls {...defaultProps} />);

      const input = screen.getByPlaceholderText('페이지');
      expect(input.className).toContain('text-xs');
      expect(input.className).toContain('xs:text-sm');
    });

    it('wrapper는 반응형 마진을 가진다', () => {
      const { container } = render(<BoardControls {...defaultProps} />);

      const wrapper = container.querySelector('.mb-3');
      expect(wrapper?.className).toContain('xs:mb-4');
    });

    it('컨트롤들은 반응형 gap을 가진다', () => {
      const { container } = render(<BoardControls {...defaultProps} />);

      const wrapper = container.querySelector('.gap-1\\.5');
      expect(wrapper?.className).toContain('xs:gap-2');
    });
  });

  describe('포커스 스타일', () => {
    it('입력창은 포커스 시 파란색 링을 가진다', () => {
      render(<BoardControls {...defaultProps} />);

      const input = screen.getByPlaceholderText('페이지');
      expect(input.className).toContain('focus:ring-2');
      expect(input.className).toContain('focus:ring-blue-500');
    });

    it('select들은 포커스 시 파란색 링을 가진다', () => {
      const { container } = render(<BoardControls {...defaultProps} />);

      const selects = container.querySelectorAll('select');
      selects.forEach((select) => {
        expect(select.className).toContain('focus:ring-2');
        expect(select.className).toContain('focus:ring-blue-500');
      });
    });
  });
});
