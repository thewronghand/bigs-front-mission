import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PasswordRequirements from './PasswordRequirements';

describe('PasswordRequirements', () => {
  describe('렌더링', () => {
    it('showRequirements가 true일 때 요구사항을 표시한다', () => {
      render(<PasswordRequirements password="" showRequirements={true} />);

      expect(screen.getByText('비밀번호 조건:')).toBeInTheDocument();
      expect(screen.getByText('8자 이상')).toBeInTheDocument();
      expect(screen.getByText('숫자 1개 이상')).toBeInTheDocument();
      expect(screen.getByText('영문자 1개 이상')).toBeInTheDocument();
      expect(screen.getByText('특수문자(!%*#?&) 1개 이상')).toBeInTheDocument();
    });

    it('showRequirements가 false일 때 숨겨진 상태다', () => {
      const { container } = render(
        <PasswordRequirements password="" showRequirements={false} />
      );

      const outerDiv = container.firstChild as HTMLElement;
      expect(outerDiv.className).toContain('max-h-0');
      expect(outerDiv.className).toContain('opacity-0');
    });
  });

  describe('비밀번호 요구사항 검증', () => {
    it('빈 비밀번호일 때 모든 요구사항이 미충족 상태다', () => {
      const { container } = render(
        <PasswordRequirements password="" showRequirements={true} />
      );

      const items = container.querySelectorAll('li');
      items.forEach((item) => {
        expect(item.textContent).toContain('○'); // 미충족 마커
        expect(item.className).toContain('text-gray-500');
      });
    });

    it('8자 이상 요구사항을 검증한다', () => {
      const { container, rerender } = render(
        <PasswordRequirements password="1234567" showRequirements={true} />
      );

      let items = container.querySelectorAll('li');
      expect(items[0].textContent).toContain('○'); // 7자: 미충족

      rerender(<PasswordRequirements password="12345678" showRequirements={true} />);

      items = container.querySelectorAll('li');
      expect(items[0].textContent).toContain('✓'); // 8자: 충족
      expect(items[0].className).toContain('text-green-600');
    });

    it('숫자 요구사항을 검증한다', () => {
      const { container, rerender } = render(
        <PasswordRequirements password="abcdefgh" showRequirements={true} />
      );

      let items = container.querySelectorAll('li');
      expect(items[1].textContent).toContain('○'); // 숫자 없음: 미충족

      rerender(<PasswordRequirements password="abcdefg1" showRequirements={true} />);

      items = container.querySelectorAll('li');
      expect(items[1].textContent).toContain('✓'); // 숫자 있음: 충족
    });

    it('영문자 요구사항을 검증한다', () => {
      const { container, rerender } = render(
        <PasswordRequirements password="12345678" showRequirements={true} />
      );

      let items = container.querySelectorAll('li');
      expect(items[2].textContent).toContain('○'); // 영문자 없음: 미충족

      rerender(<PasswordRequirements password="1234567a" showRequirements={true} />);

      items = container.querySelectorAll('li');
      expect(items[2].textContent).toContain('✓'); // 영문자 있음: 충족
    });

    it('특수문자 요구사항을 검증한다', () => {
      const { container, rerender } = render(
        <PasswordRequirements password="abcd1234" showRequirements={true} />
      );

      let items = container.querySelectorAll('li');
      expect(items[3].textContent).toContain('○'); // 특수문자 없음: 미충족

      rerender(<PasswordRequirements password="abcd123!" showRequirements={true} />);

      items = container.querySelectorAll('li');
      expect(items[3].textContent).toContain('✓'); // 특수문자 있음: 충족
    });

    it('허용된 특수문자(!%*#?&)만 인식한다', () => {
      const { container, rerender } = render(
        <PasswordRequirements password="abcd123@" showRequirements={true} />
      );

      let items = container.querySelectorAll('li');
      expect(items[3].textContent).toContain('○'); // @ 는 불허: 미충족

      rerender(<PasswordRequirements password="abcd123!" showRequirements={true} />);
      items = container.querySelectorAll('li');
      expect(items[3].textContent).toContain('✓'); // ! 는 허용: 충족

      rerender(<PasswordRequirements password="abcd123%" showRequirements={true} />);
      items = container.querySelectorAll('li');
      expect(items[3].textContent).toContain('✓'); // % 는 허용: 충족
    });
  });

  describe('모든 요구사항 충족', () => {
    it('유효한 비밀번호는 모든 요구사항을 충족한다', () => {
      const { container } = render(
        <PasswordRequirements password="Test123!" showRequirements={true} />
      );

      const items = container.querySelectorAll('li');
      items.forEach((item) => {
        expect(item.textContent).toContain('✓');
        expect(item.className).toContain('text-green-600');
      });
    });

    it('다양한 유효한 비밀번호를 테스트한다', () => {
      const validPasswords = [
        'Password1#',
        'Abc12345%',
        'Test1234*',
        'MyPass99?',
        'Secure2024&',
      ];

      validPasswords.forEach((password) => {
        const { container } = render(
          <PasswordRequirements password={password} showRequirements={true} />
        );

        const items = container.querySelectorAll('li');
        items.forEach((item) => {
          expect(item.textContent).toContain('✓');
        });
      });
    });
  });

  describe('가시성 제어', () => {
    it('showRequirements가 true일 때 적절한 클래스를 가진다', () => {
      const { container } = render(
        <PasswordRequirements password="" showRequirements={true} />
      );

      const outerDiv = container.firstChild as HTMLElement;
      expect(outerDiv.className).toContain('max-h-48');
      expect(outerDiv.className).toContain('opacity-100');
      expect(outerDiv.className).toContain('mt-3');
    });

    it('showRequirements가 false일 때 적절한 클래스를 가진다', () => {
      const { container } = render(
        <PasswordRequirements password="" showRequirements={false} />
      );

      const outerDiv = container.firstChild as HTMLElement;
      expect(outerDiv.className).toContain('max-h-0');
      expect(outerDiv.className).toContain('opacity-0');
      expect(outerDiv.className).toContain('mt-0');
    });
  });

  describe('애니메이션 클래스', () => {
    it('transition 클래스를 포함한다', () => {
      const { container } = render(
        <PasswordRequirements password="" showRequirements={true} />
      );

      const outerDiv = container.firstChild as HTMLElement;
      expect(outerDiv.className).toContain('transition-all');
      expect(outerDiv.className).toContain('duration-300');
    });

    it('각 항목에 staggered delay가 적용된다', () => {
      const { container } = render(
        <PasswordRequirements password="" showRequirements={true} />
      );

      const items = container.querySelectorAll('li');
      items.forEach((item, index) => {
        const style = (item as HTMLElement).style;
        expect(style.transitionDelay).toBe(`${(index + 1) * 50}ms`);
      });
    });
  });
});
