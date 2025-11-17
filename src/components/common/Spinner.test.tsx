import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Spinner from './Spinner';

describe('Spinner', () => {
  describe('렌더링', () => {
    it('SVG 엘리먼트를 렌더링한다', () => {
      const { container } = render(<Spinner />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('두 개의 circle 엘리먼트를 렌더링한다', () => {
      const { container } = render(<Spinner />);

      const circles = container.querySelectorAll('circle');
      expect(circles).toHaveLength(2);
    });

    it('animate-spin 클래스를 포함한다', () => {
      const { container } = render(<Spinner />);

      const svg = container.querySelector('svg');
      expect(svg?.className).toContain('animate-spin');
    });
  });

  describe('size prop', () => {
    it('기본값은 md 사이즈다', () => {
      const { container } = render(<Spinner />);

      const svg = container.querySelector('svg');
      expect(svg?.className).toContain('h-10 w-10');
    });

    it('sm 사이즈를 렌더링한다', () => {
      const { container } = render(<Spinner size="sm" />);

      const svg = container.querySelector('svg');
      expect(svg?.className).toContain('h-8 w-8');
    });

    it('lg 사이즈를 렌더링한다', () => {
      const { container } = render(<Spinner size="lg" />);

      const svg = container.querySelector('svg');
      expect(svg?.className).toContain('h-12 w-12');
    });
  });

  describe('color prop', () => {
    it('기본 색상은 #2563EB이다', () => {
      const { container } = render(<Spinner />);

      const circles = container.querySelectorAll('circle');
      const coloredCircle = circles[1]; // 두 번째 circle이 색상 circle
      expect(coloredCircle.getAttribute('stroke')).toBe('#2563EB');
    });

    it('커스텀 색상을 적용한다', () => {
      const { container } = render(<Spinner color="#FF0000" />);

      const circles = container.querySelectorAll('circle');
      const coloredCircle = circles[1];
      expect(coloredCircle.getAttribute('stroke')).toBe('#FF0000');
    });
  });

  describe('className prop', () => {
    it('커스텀 className을 적용한다', () => {
      const { container } = render(<Spinner className="custom-class" />);

      const svg = container.querySelector('svg');
      expect(svg?.className).toContain('custom-class');
    });

    it('기본 클래스와 커스텀 className이 함께 적용된다', () => {
      const { container } = render(<Spinner className="mt-4" />);

      const svg = container.querySelector('svg');
      expect(svg?.className).toContain('animate-spin');
      expect(svg?.className).toContain('h-10 w-10');
      expect(svg?.className).toContain('mt-4');
    });
  });

  describe('SVG 속성', () => {
    it('viewBox가 올바르게 설정된다', () => {
      const { container } = render(<Spinner />);

      const svg = container.querySelector('svg');
      expect(svg?.getAttribute('viewBox')).toBe('0 0 50 50');
    });

    it('배경 circle은 회색(#E5E7EB)이다', () => {
      const { container } = render(<Spinner />);

      const circles = container.querySelectorAll('circle');
      const bgCircle = circles[0]; // 첫 번째 circle이 배경
      expect(bgCircle.getAttribute('stroke')).toBe('#E5E7EB');
    });

    it('circle들의 기본 속성이 올바르다', () => {
      const { container } = render(<Spinner />);

      const circles = container.querySelectorAll('circle');

      circles.forEach((circle) => {
        expect(circle.getAttribute('cx')).toBe('25');
        expect(circle.getAttribute('cy')).toBe('25');
        expect(circle.getAttribute('r')).toBe('20');
        expect(circle.getAttribute('fill')).toBe('none');
        // SVG 속성은 kebab-case
        expect(circle.getAttribute('stroke-width')).toBe('4');
      });
    });
  });

  describe('복합 시나리오', () => {
    it('모든 props를 동시에 사용할 수 있다', () => {
      const { container } = render(
        <Spinner size="lg" color="#00FF00" className="mx-auto" />
      );

      const svg = container.querySelector('svg');
      expect(svg?.className).toContain('h-12 w-12'); // size
      expect(svg?.className).toContain('mx-auto'); // className

      const circles = container.querySelectorAll('circle');
      const coloredCircle = circles[1];
      expect(coloredCircle.getAttribute('stroke')).toBe('#00FF00'); // color
    });
  });
});
