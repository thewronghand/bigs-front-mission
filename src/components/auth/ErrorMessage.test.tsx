import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorMessage from './ErrorMessage';

describe('ErrorMessage', () => {
  describe('렌더링', () => {
    it('메시지를 렌더링한다', () => {
      render(<ErrorMessage message="에러 메시지입니다" />);

      expect(screen.getByText('에러 메시지입니다')).toBeInTheDocument();
    });

    it('빈 메시지일 때도 렌더링된다 (숨겨진 상태)', () => {
      const { container } = render(<ErrorMessage message="" />);

      const outerDiv = container.firstChild;
      expect(outerDiv).toBeInTheDocument();
    });
  });

  describe('가시성 제어', () => {
    it('메시지가 있을 때 max-h-32와 opacity-100을 가진다', () => {
      const { container } = render(<ErrorMessage message="에러" />);

      const outerDiv = container.firstChild as HTMLElement;
      expect(outerDiv.className).toContain('max-h-32');
      expect(outerDiv.className).toContain('opacity-100');
    });

    it('메시지가 없을 때 max-h-0과 opacity-0을 가진다', () => {
      const { container } = render(<ErrorMessage message="" />);

      const outerDiv = container.firstChild as HTMLElement;
      expect(outerDiv.className).toContain('max-h-0');
      expect(outerDiv.className).toContain('opacity-0');
    });
  });

  describe('스타일링', () => {
    it('transition과 animation 클래스를 포함한다', () => {
      const { container } = render(<ErrorMessage message="에러" />);

      const outerDiv = container.firstChild as HTMLElement;
      expect(outerDiv.className).toContain('transition-all');
      expect(outerDiv.className).toContain('duration-300');
      expect(outerDiv.className).toContain('ease-in-out');
    });

    it('내부 div는 빨간색 배경과 테두리를 가진다', () => {
      const { container } = render(<ErrorMessage message="에러" />);

      const innerDiv = container.querySelector('.bg-red-50');
      expect(innerDiv).toBeInTheDocument();
      expect(innerDiv?.className).toContain('border-red-200');
      expect(innerDiv?.className).toContain('rounded-lg');
    });

    it('텍스트는 빨간색이다', () => {
      const { container } = render(<ErrorMessage message="에러" />);

      const text = container.querySelector('p');
      expect(text?.className).toContain('text-red-600');
    });
  });

  describe('메시지 내용', () => {
    it('다양한 에러 메시지를 표시할 수 있다', () => {
      const { rerender } = render(<ErrorMessage message="첫 번째 에러" />);

      expect(screen.getByText('첫 번째 에러')).toBeInTheDocument();

      rerender(<ErrorMessage message="두 번째 에러" />);

      expect(screen.getByText('두 번째 에러')).toBeInTheDocument();
      expect(screen.queryByText('첫 번째 에러')).not.toBeInTheDocument();
    });

    it('긴 에러 메시지도 표시할 수 있다', () => {
      const longMessage = '아주 긴 에러 메시지입니다. '.repeat(10);
      const { container } = render(<ErrorMessage message={longMessage} />);

      const text = container.querySelector('p');
      expect(text?.textContent).toBe(longMessage);
    });

    it('특수 문자를 포함한 메시지를 표시할 수 있다', () => {
      const specialMessage = '에러: <script>alert("XSS")</script> & 특수문자!@#';
      render(<ErrorMessage message={specialMessage} />);

      expect(screen.getByText(specialMessage)).toBeInTheDocument();
    });
  });
});
