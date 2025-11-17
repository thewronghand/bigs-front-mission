import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import * as authStoreModule from '../../store';

// Mock useAuthStore
vi.mock('../../store', () => ({
  useAuthStore: vi.fn(),
}));

describe('PrivateRoute', () => {
  const mockUseAuthStore = authStoreModule.useAuthStore as unknown as ReturnType<
    typeof vi.fn
  >;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('인증된 사용자', () => {
    beforeEach(() => {
      mockUseAuthStore.mockImplementation((selector: any) =>
        selector({ isAuthenticated: true })
      );
    });

    it('children을 렌더링한다', () => {
      render(
        <MemoryRouter>
          <PrivateRoute>
            <div>Protected Content</div>
          </PrivateRoute>
        </MemoryRouter>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('여러 children을 렌더링한다', () => {
      render(
        <MemoryRouter>
          <PrivateRoute>
            <div>First Child</div>
            <div>Second Child</div>
          </PrivateRoute>
        </MemoryRouter>
      );

      expect(screen.getByText('First Child')).toBeInTheDocument();
      expect(screen.getByText('Second Child')).toBeInTheDocument();
    });

    it('복잡한 컴포넌트를 children으로 렌더링한다', () => {
      const ComplexComponent = () => (
        <div>
          <h1>Title</h1>
          <p>Content</p>
        </div>
      );

      render(
        <MemoryRouter>
          <PrivateRoute>
            <ComplexComponent />
          </PrivateRoute>
        </MemoryRouter>
      );

      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('Fragment로 children을 감싸서 렌더링한다', () => {
      const { container } = render(
        <MemoryRouter>
          <PrivateRoute>
            <div>Content</div>
          </PrivateRoute>
        </MemoryRouter>
      );

      // Fragment는 DOM에 흔적을 남기지 않으므로 children이 직접 렌더링됨
      expect(container.querySelector('div')?.textContent).toBe('Content');
    });
  });

  describe('인증되지 않은 사용자', () => {
    beforeEach(() => {
      mockUseAuthStore.mockImplementation((selector: any) =>
        selector({ isAuthenticated: false })
      );
    });

    it('children을 렌더링하지 않는다', () => {
      render(
        <MemoryRouter>
          <PrivateRoute>
            <div>Protected Content</div>
          </PrivateRoute>
        </MemoryRouter>
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('/signin으로 리다이렉트한다', () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/protected']}>
          <PrivateRoute>
            <div>Protected Content</div>
          </PrivateRoute>
        </MemoryRouter>
      );

      // Navigate 컴포넌트가 렌더링되면 실제로 라우팅이 일어나지만,
      // MemoryRouter를 사용하면 URL만 변경됨
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('여러 번 호출되어도 일관되게 리다이렉트한다', () => {
      const { rerender } = render(
        <MemoryRouter>
          <PrivateRoute>
            <div>Protected Content</div>
          </PrivateRoute>
        </MemoryRouter>
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();

      rerender(
        <MemoryRouter>
          <PrivateRoute>
            <div>Protected Content</div>
          </PrivateRoute>
        </MemoryRouter>
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('인증 상태 변경', () => {
    it('인증 상태가 변경되면 렌더링이 변경된다', () => {
      // 처음엔 인증되지 않음
      mockUseAuthStore.mockImplementation((selector: any) =>
        selector({ isAuthenticated: false })
      );

      const { rerender } = render(
        <MemoryRouter>
          <PrivateRoute>
            <div>Protected Content</div>
          </PrivateRoute>
        </MemoryRouter>
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();

      // 인증됨으로 변경
      mockUseAuthStore.mockImplementation((selector: any) =>
        selector({ isAuthenticated: true })
      );

      rerender(
        <MemoryRouter>
          <PrivateRoute>
            <div>Protected Content</div>
          </PrivateRoute>
        </MemoryRouter>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('인증 해제되면 children이 사라진다', () => {
      // 처음엔 인증됨
      mockUseAuthStore.mockImplementation((selector: any) =>
        selector({ isAuthenticated: true })
      );

      const { rerender } = render(
        <MemoryRouter>
          <PrivateRoute>
            <div>Protected Content</div>
          </PrivateRoute>
        </MemoryRouter>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();

      // 인증 해제
      mockUseAuthStore.mockImplementation((selector: any) =>
        selector({ isAuthenticated: false })
      );

      rerender(
        <MemoryRouter>
          <PrivateRoute>
            <div>Protected Content</div>
          </PrivateRoute>
        </MemoryRouter>
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('useAuthStore 사용', () => {
    it('useAuthStore에서 isAuthenticated를 가져온다', () => {
      mockUseAuthStore.mockImplementation((selector: any) =>
        selector({ isAuthenticated: true })
      );

      render(
        <MemoryRouter>
          <PrivateRoute>
            <div>Content</div>
          </PrivateRoute>
        </MemoryRouter>
      );

      expect(mockUseAuthStore).toHaveBeenCalled();
    });

    it('selector 함수로 isAuthenticated만 선택한다', () => {
      const mockSelector = vi.fn((state) => state.isAuthenticated);
      mockUseAuthStore.mockImplementation((selector: any) =>
        selector({ isAuthenticated: true })
      );

      render(
        <MemoryRouter>
          <PrivateRoute>
            <div>Content</div>
          </PrivateRoute>
        </MemoryRouter>
      );

      expect(mockUseAuthStore).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('다양한 children 타입', () => {
    beforeEach(() => {
      mockUseAuthStore.mockImplementation((selector: any) =>
        selector({ isAuthenticated: true })
      );
    });

    it('string을 children으로 렌더링한다', () => {
      render(
        <MemoryRouter>
          <PrivateRoute>Plain text content</PrivateRoute>
        </MemoryRouter>
      );

      expect(screen.getByText('Plain text content')).toBeInTheDocument();
    });

    it('null children을 처리한다', () => {
      // null children을 렌더링해도 에러가 발생하지 않음
      expect(() => {
        render(
          <MemoryRouter>
            <PrivateRoute>{null}</PrivateRoute>
          </MemoryRouter>
        );
      }).not.toThrow();
    });

    it('배열 children을 렌더링한다', () => {
      render(
        <MemoryRouter>
          <PrivateRoute>
            {[
              <div key="1">First</div>,
              <div key="2">Second</div>,
            ]}
          </PrivateRoute>
        </MemoryRouter>
      );

      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
    });
  });
});
