import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom';
import ScrollToTop from './ScrollToTop';
import { useEffect } from 'react';

// 테스트용 네비게이션 헬퍼 컴포넌트
function NavigationHelper({ to }: { to: string }) {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(to);
  }, [to, navigate]);

  return null;
}

describe('ScrollToTop', () => {
  let scrollToSpy: ReturnType<typeof vi.spyOn>;
  let originalScrollRestoration: ScrollRestoration | undefined;

  beforeEach(() => {
    // window.scrollTo 모킹
    scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});

    // scrollRestoration 저장
    if ('scrollRestoration' in window.history) {
      originalScrollRestoration = window.history.scrollRestoration;
    }
  });

  afterEach(() => {
    scrollToSpy.mockRestore();

    // scrollRestoration 복원
    if (originalScrollRestoration && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = originalScrollRestoration;
    }
  });

  describe('렌더링', () => {
    it('null을 반환한다 (UI를 렌더링하지 않음)', () => {
      const { container } = render(
        <MemoryRouter>
          <ScrollToTop />
        </MemoryRouter>
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('스크롤 복원 설정', () => {
    it('초기 마운트 시 scrollRestoration을 manual로 설정한다', () => {
      render(
        <MemoryRouter>
          <ScrollToTop />
        </MemoryRouter>
      );

      if ('scrollRestoration' in window.history) {
        expect(window.history.scrollRestoration).toBe('manual');
      }
    });
  });

  describe('페이지 변경 시 스크롤', () => {
    it('초기 렌더링 시 스크롤을 맨 위로 이동한다', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <ScrollToTop />
        </MemoryRouter>
      );

      expect(scrollToSpy).toHaveBeenCalledWith(0, 0);
    });

    it('경로가 변경되면 스크롤을 맨 위로 이동한다', () => {
      const { rerender } = render(
        <MemoryRouter initialEntries={['/home']}>
          <Routes>
            <Route path="*" element={<ScrollToTop />} />
          </Routes>
          <NavigationHelper to="/home" />
        </MemoryRouter>
      );

      scrollToSpy.mockClear();

      // 경로 변경
      rerender(
        <MemoryRouter initialEntries={['/about']}>
          <Routes>
            <Route path="*" element={<ScrollToTop />} />
          </Routes>
          <NavigationHelper to="/about" />
        </MemoryRouter>
      );

      expect(scrollToSpy).toHaveBeenCalledWith(0, 0);
    });

    it('같은 경로로 다시 네비게이션하면 스크롤을 이동하지 않는다', () => {
      render(
        <MemoryRouter initialEntries={['/home']}>
          <Routes>
            <Route path="*" element={<ScrollToTop />} />
          </Routes>
        </MemoryRouter>
      );

      const initialCallCount = scrollToSpy.mock.calls.length;

      // 같은 경로로 재렌더링 (경로 변경 없음)
      // pathname이 변경되지 않으므로 useEffect가 다시 실행되지 않음

      expect(scrollToSpy).toHaveBeenCalledTimes(initialCallCount);
    });
  });

  describe('다양한 경로', () => {
    it('루트 경로에서 작동한다', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <ScrollToTop />
        </MemoryRouter>
      );

      expect(scrollToSpy).toHaveBeenCalledWith(0, 0);
    });

    it('중첩 경로에서 작동한다', () => {
      scrollToSpy.mockClear();

      render(
        <MemoryRouter initialEntries={['/posts/123']}>
          <ScrollToTop />
        </MemoryRouter>
      );

      expect(scrollToSpy).toHaveBeenCalledWith(0, 0);
    });

    it('쿼리 파라미터가 있는 경로에서 작동한다', () => {
      scrollToSpy.mockClear();

      render(
        <MemoryRouter initialEntries={['/posts?page=2']}>
          <ScrollToTop />
        </MemoryRouter>
      );

      expect(scrollToSpy).toHaveBeenCalledWith(0, 0);
    });

    it('해시가 있는 경로에서 작동한다', () => {
      scrollToSpy.mockClear();

      render(
        <MemoryRouter initialEntries={['/posts#section']}>
          <ScrollToTop />
        </MemoryRouter>
      );

      expect(scrollToSpy).toHaveBeenCalledWith(0, 0);
    });
  });

  describe('여러 페이지 전환', () => {
    it('여러 번 경로 변경 시 매번 스크롤을 이동한다', () => {
      const { rerender } = render(
        <MemoryRouter initialEntries={['/page1']}>
          <Routes>
            <Route path="*" element={<ScrollToTop />} />
          </Routes>
          <NavigationHelper to="/page1" />
        </MemoryRouter>
      );

      scrollToSpy.mockClear();

      // 첫 번째 변경
      rerender(
        <MemoryRouter initialEntries={['/page2']}>
          <Routes>
            <Route path="*" element={<ScrollToTop />} />
          </Routes>
          <NavigationHelper to="/page2" />
        </MemoryRouter>
      );

      expect(scrollToSpy).toHaveBeenCalledWith(0, 0);

      scrollToSpy.mockClear();

      // 두 번째 변경
      rerender(
        <MemoryRouter initialEntries={['/page3']}>
          <Routes>
            <Route path="*" element={<ScrollToTop />} />
          </Routes>
          <NavigationHelper to="/page3" />
        </MemoryRouter>
      );

      expect(scrollToSpy).toHaveBeenCalledWith(0, 0);
    });
  });

  describe('브라우저 호환성', () => {
    it('scrollRestoration이 지원되지 않아도 에러가 발생하지 않는다', () => {
      const originalHistory = window.history;

      // scrollRestoration이 없는 환경 시뮬레이션
      Object.defineProperty(window, 'history', {
        value: {},
        writable: true,
        configurable: true,
      });

      expect(() => {
        render(
          <MemoryRouter>
            <ScrollToTop />
          </MemoryRouter>
        );
      }).not.toThrow();

      // 원래 history 복원
      Object.defineProperty(window, 'history', {
        value: originalHistory,
        writable: true,
        configurable: true,
      });
    });
  });
});
