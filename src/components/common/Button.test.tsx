import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button';

describe('Button', () => {
  describe('렌더링', () => {
    it('children을 렌더링한다', () => {
      render(<Button>클릭</Button>);

      expect(screen.getByRole('button', { name: '클릭' })).toBeInTheDocument();
    });

    it('button 엘리먼트로 렌더링된다', () => {
      render(<Button>버튼</Button>);

      const button = screen.getByRole('button');
      expect(button.tagName).toBe('BUTTON');
    });
  });

  describe('variant prop', () => {
    it('기본값은 primary variant이다', () => {
      render(<Button>Primary</Button>);

      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-blue-600');
    });

    it('secondary variant를 렌더링한다', () => {
      render(<Button variant="secondary">Secondary</Button>);

      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-gray-200');
    });

    it('danger variant를 렌더링한다', () => {
      render(<Button variant="danger">Danger</Button>);

      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-red-400');
    });
  });

  describe('size prop', () => {
    it('기본값은 md size이다', () => {
      render(<Button>Medium</Button>);

      const button = screen.getByRole('button');
      expect(button.className).toContain('px-4 py-2');
    });

    it('xs size를 렌더링한다', () => {
      render(<Button size="xs">Extra Small</Button>);

      const button = screen.getByRole('button');
      expect(button.className).toContain('px-2 py-1 text-xs');
    });

    it('sm size를 렌더링한다', () => {
      render(<Button size="sm">Small</Button>);

      const button = screen.getByRole('button');
      expect(button.className).toContain('px-3 py-2 text-sm');
    });

    it('lg size를 렌더링한다', () => {
      render(<Button size="lg">Large</Button>);

      const button = screen.getByRole('button');
      expect(button.className).toContain('px-4 py-3');
    });
  });

  describe('fullWidth prop', () => {
    it('기본값은 fullWidth가 false이다', () => {
      render(<Button>Button</Button>);

      const button = screen.getByRole('button');
      expect(button.className).not.toContain('flex-1');
    });

    it('fullWidth가 true이면 flex-1 클래스를 포함한다', () => {
      render(<Button fullWidth>Full Width</Button>);

      const button = screen.getByRole('button');
      expect(button.className).toContain('flex-1');
    });
  });

  describe('disabled prop', () => {
    it('disabled가 true이면 버튼이 비활성화된다', () => {
      render(<Button disabled>Disabled</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('disabled 상태에서 primary variant는 회색 배경을 가진다', () => {
      render(
        <Button variant="primary" disabled>
          Disabled Primary
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-gray-400');
      expect(button.className).toContain('cursor-not-allowed');
    });

    it('disabled 상태에서 secondary variant는 회색 배경을 가진다', () => {
      render(
        <Button variant="secondary" disabled>
          Disabled Secondary
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-gray-400');
      expect(button.className).toContain('cursor-not-allowed');
    });

    it('disabled 상태에서 danger variant는 회색 배경을 가진다', () => {
      render(
        <Button variant="danger" disabled>
          Disabled Danger
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-gray-400');
      expect(button.className).toContain('cursor-not-allowed');
    });

    it('disabled 상태에서 onClick이 호출되지 않는다', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(
        <Button onClick={handleClick} disabled>
          Disabled
        </Button>
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('onClick 핸들러', () => {
    it('클릭 시 onClick 핸들러가 호출된다', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<Button onClick={handleClick}>Click Me</Button>);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('여러 번 클릭하면 onClick이 여러 번 호출된다', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<Button onClick={handleClick}>Click Me</Button>);

      const button = screen.getByRole('button');
      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(3);
    });
  });

  describe('className prop', () => {
    it('추가 className을 적용한다', () => {
      render(<Button className="custom-class">Button</Button>);

      const button = screen.getByRole('button');
      expect(button.className).toContain('custom-class');
    });

    it('기본 스타일과 커스텀 className이 함께 적용된다', () => {
      render(
        <Button variant="primary" size="lg" className="mt-4">
          Button
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-blue-600'); // variant
      expect(button.className).toContain('px-4 py-3'); // size
      expect(button.className).toContain('mt-4'); // custom
    });
  });

  describe('HTML 속성', () => {
    it('type 속성을 설정할 수 있다', () => {
      render(<Button type="submit">Submit</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('aria-label을 설정할 수 있다', () => {
      render(<Button aria-label="Close dialog">X</Button>);

      const button = screen.getByRole('button', { name: 'Close dialog' });
      expect(button).toBeInTheDocument();
    });

    it('data 속성을 설정할 수 있다', () => {
      render(<Button data-testid="custom-button">Button</Button>);

      const button = screen.getByTestId('custom-button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('복합 시나리오', () => {
    it('모든 props를 동시에 사용할 수 있다', () => {
      const handleClick = vi.fn();

      render(
        <Button
          variant="danger"
          size="sm"
          fullWidth
          className="mb-2"
          onClick={handleClick}
          type="button"
        >
          Delete
        </Button>
      );

      const button = screen.getByRole('button', { name: 'Delete' });

      expect(button.className).toContain('bg-red-400'); // variant
      expect(button.className).toContain('px-3 py-2 text-sm'); // size
      expect(button.className).toContain('flex-1'); // fullWidth
      expect(button.className).toContain('mb-2'); // className
      expect(button).toHaveAttribute('type', 'button');
    });
  });
});
