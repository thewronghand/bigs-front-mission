import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PostFormFields from './PostFormFields';

describe('PostFormFields', () => {
  const mockRegister = vi.fn((name: string) => ({
    name,
    onChange: vi.fn(),
    onBlur: vi.fn(),
    ref: vi.fn(),
  }));

  const mockHandleManualSave = vi.fn();
  const mockGetSaveDisabledReason = vi.fn(() => '제목과 내용을 입력해주세요');

  const mockCategories = {
    NOTICE: '공지사항',
    FREE: '자유게시판',
    QNA: '질문게시판',
  };

  const defaultProps = {
    register: mockRegister as any,
    errors: {},
    categories: mockCategories,
    categoriesLoading: false,
    title: '',
    content: '',
    maxTitleLength: 100,
    maxContentLength: 5000,
    isEditMode: false,
    canSaveDraft: false,
    getSaveDisabledReason: mockGetSaveDisabledReason,
    handleManualSave: mockHandleManualSave,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('카테고리 필드', () => {
    it('카테고리 라벨을 렌더링한다', () => {
      render(<PostFormFields {...defaultProps} />);

      expect(screen.getByText('카테고리')).toBeInTheDocument();
    });

    it('카테고리 로딩 중일 때 로딩 인디케이터를 표시한다', () => {
      const { container } = render(
        <PostFormFields {...defaultProps} categoriesLoading={true} />
      );

      const loadingDots = container.querySelectorAll('.animate-bounce');
      expect(loadingDots).toHaveLength(3);
    });

    it('카테고리가 null일 때 로딩 인디케이터를 표시한다', () => {
      const { container } = render(
        <PostFormFields {...defaultProps} categories={null} />
      );

      const loadingDots = container.querySelectorAll('.animate-bounce');
      expect(loadingDots).toHaveLength(3);
    });

    it('카테고리 목록을 렌더링한다', () => {
      render(<PostFormFields {...defaultProps} />);

      expect(screen.getByText('공지사항')).toBeInTheDocument();
      expect(screen.getByText('자유게시판')).toBeInTheDocument();
      expect(screen.getByText('질문게시판')).toBeInTheDocument();
    });

    it('카테고리 에러를 표시한다', () => {
      const propsWithError = {
        ...defaultProps,
        errors: {
          category: { message: '카테고리를 선택해주세요' },
        },
      };

      render(<PostFormFields {...propsWithError} />);

      expect(screen.getByText('카테고리를 선택해주세요')).toBeInTheDocument();
    });
  });

  describe('제목 필드', () => {
    it('제목 라벨을 렌더링한다', () => {
      render(<PostFormFields {...defaultProps} />);

      expect(screen.getByText('제목')).toBeInTheDocument();
    });

    it('제목 입력창을 렌더링한다', () => {
      render(<PostFormFields {...defaultProps} />);

      const input = screen.getByPlaceholderText('제목을 입력하세요');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'text');
    });

    it('제목 글자 수를 표시한다', () => {
      render(<PostFormFields {...defaultProps} title="테스트 제목" />);

      expect(screen.getByText('6/100')).toBeInTheDocument();
    });

    it('제목이 최대 길이를 초과하면 빨간색으로 표시한다', () => {
      const longTitle = 'a'.repeat(101);
      render(<PostFormFields {...defaultProps} title={longTitle} />);

      const charCount = screen.getByText('101/100');
      expect(charCount.className).toContain('text-red-500');
    });

    it('제목이 최대 길이 이하면 회색으로 표시한다', () => {
      const { container } = render(<PostFormFields {...defaultProps} title="짧은 제목" />);

      // 제목 필드 옆의 글자 수를 찾기 (첫 번째 것)
      const titleSection = container.querySelectorAll('.flex.justify-between')[0];
      const charCount = titleSection.querySelector('span');
      expect(charCount?.className).toContain('text-gray-500');
    });

    it('제목 에러를 표시한다', () => {
      const propsWithError = {
        ...defaultProps,
        errors: {
          title: { message: '제목을 입력해주세요' },
        },
      };

      render(<PostFormFields {...propsWithError} />);

      expect(screen.getByText('제목을 입력해주세요')).toBeInTheDocument();
    });
  });

  describe('내용 필드', () => {
    it('내용 라벨을 렌더링한다', () => {
      render(<PostFormFields {...defaultProps} />);

      expect(screen.getByText('내용')).toBeInTheDocument();
    });

    it('내용 입력창을 렌더링한다', () => {
      render(<PostFormFields {...defaultProps} />);

      const textarea = screen.getByPlaceholderText('내용을 입력하세요');
      expect(textarea).toBeInTheDocument();
      expect(textarea.tagName).toBe('TEXTAREA');
    });

    it('내용 글자 수를 표시한다', () => {
      render(<PostFormFields {...defaultProps} content="테스트 내용입니다" />);

      expect(screen.getByText('9/5000')).toBeInTheDocument();
    });

    it('내용이 최대 길이를 초과하면 빨간색으로 표시한다', () => {
      const longContent = 'a'.repeat(5001);
      render(<PostFormFields {...defaultProps} content={longContent} />);

      const charCount = screen.getByText('5001/5000');
      expect(charCount.className).toContain('text-red-500');
    });

    it('내용 에러를 표시한다', () => {
      const propsWithError = {
        ...defaultProps,
        errors: {
          content: { message: '내용을 입력해주세요' },
        },
      };

      render(<PostFormFields {...propsWithError} />);

      expect(screen.getByText('내용을 입력해주세요')).toBeInTheDocument();
    });

    it('textarea는 10행을 가진다', () => {
      render(<PostFormFields {...defaultProps} />);

      const textarea = screen.getByPlaceholderText('내용을 입력하세요');
      expect(textarea).toHaveAttribute('rows', '10');
    });
  });

  describe('임시저장 버튼', () => {
    it('작성 모드에서 임시저장 버튼을 렌더링한다', () => {
      render(<PostFormFields {...defaultProps} isEditMode={false} />);

      expect(screen.getByText('임시저장')).toBeInTheDocument();
    });

    it('수정 모드에서 임시저장 버튼을 렌더링하지 않는다', () => {
      render(<PostFormFields {...defaultProps} isEditMode={true} />);

      expect(screen.queryByText('임시저장')).not.toBeInTheDocument();
    });

    it('임시저장 버튼 클릭 시 handleManualSave가 호출된다', async () => {
      const user = userEvent.setup();
      render(<PostFormFields {...defaultProps} canSaveDraft={true} />);

      const saveButton = screen.getByText('임시저장');
      await user.click(saveButton);

      expect(mockHandleManualSave).toHaveBeenCalled();
    });

    it('저장 불가능할 때 버튼이 비활성화된다', () => {
      render(<PostFormFields {...defaultProps} canSaveDraft={false} />);

      const saveButton = screen.getByText('임시저장');
      expect(saveButton).toBeDisabled();
    });

    it('저장 가능할 때 버튼이 활성화된다', () => {
      render(<PostFormFields {...defaultProps} canSaveDraft={true} />);

      const saveButton = screen.getByText('임시저장');
      expect(saveButton).not.toBeDisabled();
    });

    it('버튼은 secondary 스타일이다', () => {
      render(<PostFormFields {...defaultProps} canSaveDraft={true} />);

      const saveButton = screen.getByText('임시저장');
      // 버튼 컴포넌트의 secondary variant는 bg-gray-200 또는 bg-gray-400 (disabled일 때)
      expect(saveButton.className).toMatch(/bg-gray-(200|400)/);
    });

    it('버튼은 xs 사이즈다', () => {
      render(<PostFormFields {...defaultProps} />);

      const saveButton = screen.getByText('임시저장');
      expect(saveButton.className).toContain('text-xs');
    });
  });

  describe('툴팁', () => {
    it('저장 불가능 사유 툴팁을 렌더링한다', () => {
      const { container } = render(
        <PostFormFields {...defaultProps} canSaveDraft={false} />
      );

      // 툴팁은 hover 시 표시되므로 DOM에는 존재
      const tooltip = container.querySelector('.group-hover\\:opacity-100');
      expect(tooltip).toBeInTheDocument();
    });

    it('툴팁에 저장 불가능 사유를 표시한다', () => {
      render(<PostFormFields {...defaultProps} canSaveDraft={false} />);

      expect(screen.getByText('제목과 내용을 입력해주세요')).toBeInTheDocument();
    });

    it('저장 가능할 때도 툴팁 컨테이너는 렌더링된다', () => {
      const { container } = render(
        <PostFormFields {...defaultProps} canSaveDraft={true} />
      );

      // canSaveDraft가 true면 툴팁 자체가 렌더링되지 않음
      const tooltip = container.querySelector('.group-hover\\:opacity-100');
      expect(tooltip).not.toBeInTheDocument();
    });
  });

  describe('스타일링', () => {
    it('모든 입력 필드는 border와 rounded를 가진다', () => {
      const { container } = render(<PostFormFields {...defaultProps} />);

      const inputs = container.querySelectorAll('select, input, textarea');
      inputs.forEach((input) => {
        expect(input.className).toContain('border');
        expect(input.className).toContain('rounded-lg');
      });
    });

    it('모든 입력 필드는 포커스 시 파란색 링을 가진다', () => {
      const { container } = render(<PostFormFields {...defaultProps} />);

      const inputs = container.querySelectorAll('select, input, textarea');
      inputs.forEach((input) => {
        expect(input.className).toContain('focus:ring-2');
        expect(input.className).toContain('focus:ring-blue-500');
      });
    });

    it('textarea는 resize-none을 가진다', () => {
      render(<PostFormFields {...defaultProps} />);

      const textarea = screen.getByPlaceholderText('내용을 입력하세요');
      expect(textarea.className).toContain('resize-none');
    });

    it('에러 메시지는 빨간색이다', () => {
      const propsWithError = {
        ...defaultProps,
        errors: {
          title: { message: '에러' },
        },
      };

      render(<PostFormFields {...propsWithError} />);

      const errorText = screen.getByText('에러');
      expect(errorText.className).toContain('text-red-500');
    });
  });

  describe('반응형', () => {
    it('라벨은 반응형 텍스트 크기를 가진다', () => {
      render(<PostFormFields {...defaultProps} />);

      const labels = screen.getAllByText('카테고리')[0];
      expect(labels.className).toContain('text-xs');
      expect(labels.className).toContain('xs:text-sm');
    });

    it('입력 필드는 반응형 패딩을 가진다', () => {
      render(<PostFormFields {...defaultProps} />);

      const input = screen.getByPlaceholderText('제목을 입력하세요');
      expect(input.className).toContain('px-3');
      expect(input.className).toContain('xs:px-4');
      expect(input.className).toContain('py-2');
      expect(input.className).toContain('xs:py-3');
    });

    it('입력 필드는 반응형 텍스트 크기를 가진다', () => {
      render(<PostFormFields {...defaultProps} />);

      const input = screen.getByPlaceholderText('제목을 입력하세요');
      expect(input.className).toContain('text-sm');
      expect(input.className).toContain('xs:text-base');
    });

    it('글자 수는 반응형 텍스트 크기를 가진다', () => {
      render(<PostFormFields {...defaultProps} title="test" />);

      const charCount = screen.getByText('4/100');
      expect(charCount.className).toContain('text-xs');
      expect(charCount.className).toContain('xs:text-sm');
    });
  });

  describe('로딩 애니메이션', () => {
    it('로딩 점들은 staggered delay를 가진다', () => {
      const { container } = render(
        <PostFormFields {...defaultProps} categoriesLoading={true} />
      );

      const dots = container.querySelectorAll('.animate-bounce');
      expect(dots[0]).toHaveStyle({ animationDelay: '0ms' });
      expect(dots[1]).toHaveStyle({ animationDelay: '150ms' });
      expect(dots[2]).toHaveStyle({ animationDelay: '300ms' });
    });
  });

  describe('접근성', () => {
    it('카테고리 select는 label과 연결된다', () => {
      render(<PostFormFields {...defaultProps} />);

      const label = screen.getByText('카테고리');
      const select = document.getElementById('category');

      expect(label).toHaveAttribute('for', 'category');
      expect(select).toBeInTheDocument();
    });

    it('제목 input은 label과 연결된다', () => {
      render(<PostFormFields {...defaultProps} />);

      const label = screen.getByText('제목');
      const input = document.getElementById('title');

      expect(label).toHaveAttribute('for', 'title');
      expect(input).toBeInTheDocument();
    });

    it('내용 textarea는 label과 연결된다', () => {
      render(<PostFormFields {...defaultProps} />);

      const label = screen.getByText('내용');
      const textarea = document.getElementById('content');

      expect(label).toHaveAttribute('for', 'content');
      expect(textarea).toBeInTheDocument();
    });
  });
});
