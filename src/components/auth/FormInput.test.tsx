import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormInput from './FormInput';

describe('FormInput', () => {
  const mockRegistration = {
    onChange: vi.fn(),
    onBlur: vi.fn(),
    ref: vi.fn(),
    name: 'testInput',
  };

  const defaultProps = {
    label: '이메일',
    id: 'email',
    type: 'text',
    placeholder: '이메일을 입력하세요',
    registration: mockRegistration,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('렌더링', () => {
    it('label을 렌더링한다', () => {
      render(<FormInput {...defaultProps} />);

      expect(screen.getByText('이메일')).toBeInTheDocument();
    });

    it('input을 렌더링한다', () => {
      render(<FormInput {...defaultProps} />);

      const input = screen.getByPlaceholderText('이메일을 입력하세요');
      expect(input).toBeInTheDocument();
    });

    it('label과 input이 htmlFor/id로 연결된다', () => {
      render(<FormInput {...defaultProps} />);

      const label = screen.getByText('이메일');
      const input = screen.getByPlaceholderText('이메일을 입력하세요');

      expect(label).toHaveAttribute('for', 'email');
      expect(input).toHaveAttribute('id', 'email');
    });

    it('input type이 올바르게 설정된다', () => {
      render(<FormInput {...defaultProps} type="password" />);

      const input = screen.getByPlaceholderText('이메일을 입력하세요');
      expect(input).toHaveAttribute('type', 'password');
    });
  });

  describe('에러 표시', () => {
    it('에러가 없을 때 에러 메시지가 숨겨진다', () => {
      const { container } = render(<FormInput {...defaultProps} />);

      const errorDiv = container.querySelector('.text-red-500');
      expect(errorDiv?.textContent).toBe('');
    });

    it('에러가 있을 때 에러 메시지를 표시한다', () => {
      render(<FormInput {...defaultProps} error="이메일 형식이 올바르지 않습니다" />);

      expect(screen.getByText('이메일 형식이 올바르지 않습니다')).toBeInTheDocument();
    });

    it('에러가 있을 때 input에 빨간색 테두리가 적용된다', () => {
      render(<FormInput {...defaultProps} error="에러 메시지" />);

      const input = screen.getByPlaceholderText('이메일을 입력하세요');
      expect(input.className).toContain('border-red-500');
      expect(input.className).toContain('focus:ring-red-500');
    });

    it('에러가 없을 때 기본 테두리가 적용된다', () => {
      render(<FormInput {...defaultProps} />);

      const input = screen.getByPlaceholderText('이메일을 입력하세요');
      expect(input.className).toContain('border-gray-300');
      expect(input.className).toContain('focus:ring-blue-500');
    });
  });

  describe('비밀번호 입력 필터링', () => {
    it('비밀번호 입력에서 한글을 제거한다', async () => {
      render(
        <FormInput
          {...defaultProps}
          type="password"
          placeholder="비밀번호를 입력하세요"
        />
      );

      const input = screen.getByPlaceholderText('비밀번호를 입력하세요') as HTMLInputElement;

      // 한글 입력 시뮬레이션
      fireEvent.input(input, { target: { value: 'test한글123' } });

      // 한글이 제거되어야 함
      expect(input.value).toBe('test123');
    });

    it('비밀번호 입력에서 특수문자는 허용한다', async () => {
      render(
        <FormInput
          {...defaultProps}
          type="password"
          placeholder="비밀번호를 입력하세요"
        />
      );

      const input = screen.getByPlaceholderText('비밀번호를 입력하세요') as HTMLInputElement;

      fireEvent.input(input, { target: { value: 'Test!@#$%^&*()123' } });

      expect(input.value).toBe('Test!@#$%^&*()123');
    });

    it('비밀번호 입력에서 영문과 숫자는 허용한다', async () => {
      render(
        <FormInput
          {...defaultProps}
          type="password"
          placeholder="비밀번호를 입력하세요"
        />
      );

      const input = screen.getByPlaceholderText('비밀번호를 입력하세요') as HTMLInputElement;

      fireEvent.input(input, { target: { value: 'TestPassword123' } });

      expect(input.value).toBe('TestPassword123');
    });

    it('text 타입 input에서는 필터링하지 않는다', async () => {
      render(<FormInput {...defaultProps} type="text" />);

      const input = screen.getByPlaceholderText('이메일을 입력하세요') as HTMLInputElement;

      fireEvent.input(input, { target: { value: 'test한글123' } });

      // text 타입은 필터링하지 않음
      expect(input.value).toBe('test한글123');
    });
  });

  describe('composition 이벤트', () => {
    it('비밀번호 입력에서 compositionStart를 방지한다', () => {
      render(
        <FormInput
          {...defaultProps}
          type="password"
          placeholder="비밀번호를 입력하세요"
        />
      );

      const input = screen.getByPlaceholderText('비밀번호를 입력하세요');
      const event = new CompositionEvent('compositionstart', { bubbles: true });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      fireEvent(input, event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('text 타입 input에서는 compositionStart를 방지하지 않는다', () => {
      render(<FormInput {...defaultProps} type="text" />);

      const input = screen.getByPlaceholderText('이메일을 입력하세요');
      const event = new CompositionEvent('compositionstart', { bubbles: true });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      fireEvent(input, event);

      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });
  });

  describe('registration prop', () => {
    it('registration props가 input에 적용된다', () => {
      const customRegistration = {
        ...mockRegistration,
        name: 'customName',
      };

      render(<FormInput {...defaultProps} registration={customRegistration} />);

      const input = screen.getByPlaceholderText('이메일을 입력하세요');
      expect(input).toHaveAttribute('name', 'customName');
    });
  });

  describe('스타일링', () => {
    it('input은 기본 스타일을 가진다', () => {
      render(<FormInput {...defaultProps} />);

      const input = screen.getByPlaceholderText('이메일을 입력하세요');
      expect(input.className).toContain('w-full');
      expect(input.className).toContain('px-4');
      expect(input.className).toContain('py-3');
      expect(input.className).toContain('rounded-lg');
    });

    it('label은 적절한 스타일을 가진다', () => {
      render(<FormInput {...defaultProps} />);

      const label = screen.getByText('이메일');
      expect(label.className).toContain('text-sm');
      expect(label.className).toContain('font-medium');
      expect(label.className).toContain('text-gray-700');
    });

    it('에러 메시지는 transition 클래스를 가진다', () => {
      const { container } = render(<FormInput {...defaultProps} error="에러" />);

      const errorContainer = container.querySelector('.text-red-500')?.parentElement;
      expect(errorContainer?.className).toContain('transition-all');
      expect(errorContainer?.className).toContain('duration-300');
    });
  });

  describe('다양한 input 타입', () => {
    it('email 타입 input을 렌더링한다', () => {
      render(<FormInput {...defaultProps} type="email" />);

      const input = screen.getByPlaceholderText('이메일을 입력하세요');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('password 타입 input을 렌더링한다', () => {
      render(<FormInput {...defaultProps} type="password" />);

      const input = screen.getByPlaceholderText('이메일을 입력하세요');
      expect(input).toHaveAttribute('type', 'password');
    });

    it('text 타입 input을 렌더링한다', () => {
      render(<FormInput {...defaultProps} type="text" />);

      const input = screen.getByPlaceholderText('이메일을 입력하세요');
      expect(input).toHaveAttribute('type', 'text');
    });
  });
});
