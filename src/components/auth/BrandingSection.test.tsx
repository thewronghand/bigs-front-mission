import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import BrandingSection from './BrandingSection';

describe('BrandingSection', () => {
  describe('렌더링', () => {
    it('로고 이미지를 렌더링한다', () => {
      render(<BrandingSection />);

      const logo = screen.getByAltText('BIGS Logo');
      expect(logo).toBeInTheDocument();
      expect(logo.tagName).toBe('IMG');
    });

    it('메인 제목을 렌더링한다', () => {
      render(<BrandingSection />);

      expect(screen.getByText('BIGS Board')).toBeInTheDocument();
    });

    it('부제목을 렌더링한다', () => {
      render(<BrandingSection />);

      expect(screen.getByText('Frontend Developer Mission')).toBeInTheDocument();
    });

    it('Tech Stack 제목을 렌더링한다', () => {
      render(<BrandingSection />);

      expect(screen.getByText('Tech Stack')).toBeInTheDocument();
    });
  });

  describe('기술 스택 목록', () => {
    it('React 19 & TypeScript를 표시한다', () => {
      render(<BrandingSection />);

      expect(screen.getByText('• React 19 & TypeScript')).toBeInTheDocument();
    });

    it('Vite를 표시한다', () => {
      render(<BrandingSection />);

      expect(screen.getByText('• Vite')).toBeInTheDocument();
    });

    it('Zustand를 표시한다', () => {
      render(<BrandingSection />);

      expect(screen.getByText('• Zustand')).toBeInTheDocument();
    });

    it('React Router를 표시한다', () => {
      render(<BrandingSection />);

      expect(screen.getByText('• React Router')).toBeInTheDocument();
    });

    it('React Hook Form을 표시한다', () => {
      render(<BrandingSection />);

      expect(screen.getByText('• React Hook Form')).toBeInTheDocument();
    });

    it('Axios를 표시한다', () => {
      render(<BrandingSection />);

      expect(screen.getByText('• Axios')).toBeInTheDocument();
    });

    it('Tailwind CSS 4를 표시한다', () => {
      render(<BrandingSection />);

      expect(screen.getByText('• Tailwind CSS 4')).toBeInTheDocument();
    });

    it('React Hot Toast를 표시한다', () => {
      render(<BrandingSection />);

      expect(screen.getByText('• React Hot Toast')).toBeInTheDocument();
    });

    it('기술 스택 목록은 ul 태그를 사용한다', () => {
      const { container } = render(<BrandingSection />);

      const list = container.querySelector('ul');
      expect(list).toBeInTheDocument();
    });

    it('8개의 기술 스택 항목을 렌더링한다', () => {
      const { container } = render(<BrandingSection />);

      const listItems = container.querySelectorAll('ul li');
      expect(listItems).toHaveLength(8);
    });
  });

  describe('스타일링', () => {
    it('그라디언트 배경을 가진다', () => {
      const { container } = render(<BrandingSection />);

      const section = container.firstChild as HTMLElement;
      expect(section.className).toContain('bg-gradient-to-br');
      expect(section.className).toContain('from-slate-100');
      expect(section.className).toContain('to-slate-200');
    });

    it('전체 화면 높이를 가진다', () => {
      const { container } = render(<BrandingSection />);

      const section = container.firstChild as HTMLElement;
      expect(section.className).toContain('min-h-screen');
    });

    it('로고는 24 크기를 가진다', () => {
      render(<BrandingSection />);

      const logo = screen.getByAltText('BIGS Logo');
      expect(logo.className).toContain('w-24');
      expect(logo.className).toContain('h-24');
    });

    it('메인 제목은 h1 태그이고 bold다', () => {
      render(<BrandingSection />);

      const title = screen.getByText('BIGS Board');
      expect(title.tagName).toBe('H1');
      expect(title.className).toContain('font-bold');
    });

    it('컨텐츠는 중앙 정렬된다', () => {
      const { container } = render(<BrandingSection />);

      const section = container.firstChild as HTMLElement;
      expect(section.className).toContain('items-center');
      expect(section.className).toContain('justify-center');
    });
  });

  describe('반응형', () => {
    it('모바일에서는 숨겨진다', () => {
      const { container } = render(<BrandingSection />);

      const section = container.firstChild as HTMLElement;
      expect(section.className).toContain('hidden');
    });

    it('md 브레이크포인트에서 flex로 표시된다', () => {
      const { container } = render(<BrandingSection />);

      const section = container.firstChild as HTMLElement;
      expect(section.className).toContain('md:flex');
    });

    it('md 브레이크포인트에서 너비 1/2를 가진다', () => {
      const { container } = render(<BrandingSection />);

      const section = container.firstChild as HTMLElement;
      expect(section.className).toContain('md:w-1/2');
    });

    it('lg 브레이크포인트에서 너비 3/5를 가진다', () => {
      const { container } = render(<BrandingSection />);

      const section = container.firstChild as HTMLElement;
      expect(section.className).toContain('lg:w-3/5');
    });

    it('메인 제목은 반응형 텍스트 크기를 가진다', () => {
      render(<BrandingSection />);

      const title = screen.getByText('BIGS Board');
      expect(title.className).toContain('text-4xl');
      expect(title.className).toContain('lg:text-5xl');
    });

    it('부제목은 반응형 텍스트 크기를 가진다', () => {
      render(<BrandingSection />);

      const subtitle = screen.getByText('Frontend Developer Mission');
      expect(subtitle.className).toContain('text-lg');
      expect(subtitle.className).toContain('lg:text-xl');
    });

    it('기술 스택 목록은 반응형 텍스트 크기를 가진다', () => {
      const { container } = render(<BrandingSection />);

      const list = container.querySelector('ul');
      expect(list?.className).toContain('text-sm');
      expect(list?.className).toContain('lg:text-base');
    });
  });

  describe('레이아웃', () => {
    it('max-w-lg 컨테이너를 가진다', () => {
      const { container } = render(<BrandingSection />);

      const contentContainer = container.querySelector('.max-w-lg');
      expect(contentContainer).toBeInTheDocument();
    });

    it('기술 스택 목록은 간격을 가진다', () => {
      const { container } = render(<BrandingSection />);

      const techStackContainer = container.querySelector('.space-y-2');
      expect(techStackContainer).toBeInTheDocument();

      const list = container.querySelector('ul');
      expect(list?.className).toContain('space-y-1.5');
    });
  });

  describe('텍스트 색상', () => {
    it('메인 제목은 진한 회색이다', () => {
      render(<BrandingSection />);

      const title = screen.getByText('BIGS Board');
      expect(title.className).toContain('text-gray-900');
    });

    it('부제목은 중간 회색이다', () => {
      render(<BrandingSection />);

      const subtitle = screen.getByText('Frontend Developer Mission');
      expect(subtitle.className).toContain('text-gray-700');
    });

    it('기술 스택 컨테이너는 회색이다', () => {
      const { container } = render(<BrandingSection />);

      const techStackContainer = container.querySelector('.space-y-2');
      expect(techStackContainer?.className).toContain('text-gray-600');
    });
  });
});
