import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PublicRoute from './PublicRoute';
import * as authStoreModule from '../../store/authStore';

// Mock useAuthStore
vi.mock('../../store/authStore', () => ({
  useAuthStore: vi.fn(),
}));

describe('PublicRoute', () => {
  const mockUseAuthStore = authStoreModule.useAuthStore as unknown as ReturnType<
    typeof vi.fn
  >;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('인증되지 않은 사용자', () => {
    beforeEach(() => {
      mockUseAuthStore.mockImplementation((selector: any) =>
        selector({ isAuthenticated: false })
      );
    });

    it('children을 렌더링한다', () => {
      render(
        <MemoryRouter>
          <PublicRoute>
            <div>Public Content</div>
          </PublicRoute>
        </MemoryRouter>
      );

      expect(screen.getByText('Public Content')).toBeInTheDocument();
    });

    it('여러 children을 렌더링한다', () => {
      render(
        <MemoryRouter>
          <PublicRoute>
            <div>First Child</div>
            <div>Second Child</div>
          </PublicRoute>
        </MemoryRouter>
      );

      expect(screen.getByText('First Child')).toBeInTheDocument();
      expect(screen.getByText('Second Child')).toBeInTheDocument();
    });

    it('로그인 폼을 children으로 렌더링한다', () => {
      const LoginForm = () => (
        <form>
          <input type="email" placeholder="이메일" />
          <input type="password" placeholder="비밀번호" />
        </form>
      );

      render(
        <MemoryRouter>
          <PublicRoute>
            <LoginForm />
          </PublicRoute>
        </MemoryRouter>
      );

      expect(screen.getByPlaceholderText('이메일')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('비밀번호')).toBeInTheDocument();
    });

    it('Fragment로 children을 감싸서 렌더링한다', () => {
      const { container } = render(
        <MemoryRouter>
          <PublicRoute>
            <div>Content</div>
          </PublicRoute>
        </MemoryRouter>
      );

      expect(container.querySelector('div')?.textContent).toBe('Content');
    });
  });

  describe('인증된 사용자', () => {
    beforeEach(() => {
      mockUseAuthStore.mockImplementation((selector: any) =>
        selector({ isAuthenticated: true })
      );
    });

    it('children을 렌더링하지 않는다', () => {
      render(
        <MemoryRouter>
          <PublicRoute>
            <div>Public Content</div>
          </PublicRoute>
        </MemoryRouter>
      );

      expect(screen.queryByText('Public Content')).not.toBeInTheDocument();
    });

    it('/board로 리다이렉트한다', () => {
      render(
        <MemoryRouter initialEntries={['/signin']}>
          <PublicRoute>
            <div>Login Form</div>
          </PublicRoute>
        </MemoryRouter>
      );

      expect(screen.queryByText('Login Form')).not.toBeInTheDocument();
    });

    it('여러 번 호출되어도 일관되게 리다이렉트한다', () => {
      const { rerender } = render(
        <MemoryRouter>
          <PublicRoute>
            <div>Public Content</div>
          </PublicRoute>
        </MemoryRouter>
      );

      expect(screen.queryByText('Public Content')).not.toBeInTheDocument();

      rerender(
        <MemoryRouter>
          <PublicRoute>
            <div>Public Content</div>
          </PublicRoute>
        </MemoryRouter>
      );

      expect(screen.queryByText('Public Content')).not.toBeInTheDocument();
    });

    it('로그인 폼이 표시되지 않는다', () => {
      render(
        <MemoryRouter>
          <PublicRoute>
            <form>
              <input type="email" placeholder="이메일" />
            </form>
          </PublicRoute>
        </MemoryRouter>
      );

      expect(screen.queryByPlaceholderText('이메일')).not.toBeInTheDocument();
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
          <PublicRoute>
            <div>Login Form</div>
          </PublicRoute>
        </MemoryRouter>
      );

      expect(screen.getByText('Login Form')).toBeInTheDocument();

      // 로그인으로 인증됨
      mockUseAuthStore.mockImplementation((selector: any) =>
        selector({ isAuthenticated: true })
      );

      rerender(
        <MemoryRouter>
          <PublicRoute>
            <div>Login Form</div>
          </PublicRoute>
        </MemoryRouter>
      );

      expect(screen.queryByText('Login Form')).not.toBeInTheDocument();
    });

    it('로그아웃하면 children이 다시 표시된다', () => {
      // 처음엔 인증됨
      mockUseAuthStore.mockImplementation((selector: any) =>
        selector({ isAuthenticated: true })
      );

      const { rerender } = render(
        <MemoryRouter>
          <PublicRoute>
            <div>Login Form</div>
          </PublicRoute>
        </MemoryRouter>
      );

      expect(screen.queryByText('Login Form')).not.toBeInTheDocument();

      // 로그아웃
      mockUseAuthStore.mockImplementation((selector: any) =>
        selector({ isAuthenticated: false })
      );

      rerender(
        <MemoryRouter>
          <PublicRoute>
            <div>Login Form</div>
          </PublicRoute>
        </MemoryRouter>
      );

      expect(screen.getByText('Login Form')).toBeInTheDocument();
    });
  });

  describe('useAuthStore 사용', () => {
    it('useAuthStore에서 isAuthenticated를 가져온다', () => {
      mockUseAuthStore.mockImplementation((selector: any) =>
        selector({ isAuthenticated: false })
      );

      render(
        <MemoryRouter>
          <PublicRoute>
            <div>Content</div>
          </PublicRoute>
        </MemoryRouter>
      );

      expect(mockUseAuthStore).toHaveBeenCalled();
    });

    it('selector 함수로 isAuthenticated만 선택한다', () => {
      mockUseAuthStore.mockImplementation((selector: any) =>
        selector({ isAuthenticated: false })
      );

      render(
        <MemoryRouter>
          <PublicRoute>
            <div>Content</div>
          </PublicRoute>
        </MemoryRouter>
      );

      expect(mockUseAuthStore).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('다양한 children 타입', () => {
    beforeEach(() => {
      mockUseAuthStore.mockImplementation((selector: any) =>
        selector({ isAuthenticated: false })
      );
    });

    it('string을 children으로 렌더링한다', () => {
      render(
        <MemoryRouter>
          <PublicRoute>Plain text content</PublicRoute>
        </MemoryRouter>
      );

      expect(screen.getByText('Plain text content')).toBeInTheDocument();
    });

    it('null children을 처리한다', () => {
      // null children을 렌더링해도 에러가 발생하지 않음
      expect(() => {
        render(
          <MemoryRouter>
            <PublicRoute>{null}</PublicRoute>
          </MemoryRouter>
        );
      }).not.toThrow();
    });

    it('배열 children을 렌더링한다', () => {
      render(
        <MemoryRouter>
          <PublicRoute>
            {[
              <div key="1">First</div>,
              <div key="2">Second</div>,
            ]}
          </PublicRoute>
        </MemoryRouter>
      );

      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
    });
  });

  describe('PrivateRoute와의 차이점', () => {
    it('인증 로직이 반대다', () => {
      // PublicRoute: 인증되면 리다이렉트
      mockUseAuthStore.mockImplementation((selector: any) =>
        selector({ isAuthenticated: true })
      );

      render(
        <MemoryRouter>
          <PublicRoute>
            <div>Content</div>
          </PublicRoute>
        </MemoryRouter>
      );

      expect(screen.queryByText('Content')).not.toBeInTheDocument();

      // 인증 안 되면 렌더링
      mockUseAuthStore.mockImplementation((selector: any) =>
        selector({ isAuthenticated: false })
      );

      const { rerender } = render(
        <MemoryRouter>
          <PublicRoute>
            <div>Content</div>
          </PublicRoute>
        </MemoryRouter>
      );

      rerender(
        <MemoryRouter>
          <PublicRoute>
            <div>Content</div>
          </PublicRoute>
        </MemoryRouter>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('게시판으로 리다이렉트한다 (로그인 페이지가 아님)', () => {
      mockUseAuthStore.mockImplementation((selector: any) =>
        selector({ isAuthenticated: true })
      );

      render(
        <MemoryRouter initialEntries={['/signin']}>
          <PublicRoute>
            <div>Login Form</div>
          </PublicRoute>
        </MemoryRouter>
      );

      // /board로 리다이렉트되므로 로그인 폼은 보이지 않음
      expect(screen.queryByText('Login Form')).not.toBeInTheDocument();
    });
  });

  describe('사용 시나리오', () => {
    it('로그인 페이지를 보호한다', () => {
      // 로그인 안 됨 - 로그인 페이지 표시
      mockUseAuthStore.mockImplementation((selector: any) =>
        selector({ isAuthenticated: false })
      );

      render(
        <MemoryRouter>
          <PublicRoute>
            <h1>로그인</h1>
          </PublicRoute>
        </MemoryRouter>
      );

      expect(screen.getByText('로그인')).toBeInTheDocument();
    });

    it('회원가입 페이지를 보호한다', () => {
      // 로그인 안 됨 - 회원가입 페이지 표시
      mockUseAuthStore.mockImplementation((selector: any) =>
        selector({ isAuthenticated: false })
      );

      render(
        <MemoryRouter>
          <PublicRoute>
            <h1>회원가입</h1>
          </PublicRoute>
        </MemoryRouter>
      );

      expect(screen.getByText('회원가입')).toBeInTheDocument();
    });

    it('이미 로그인된 사용자는 로그인 페이지에 접근할 수 없다', () => {
      mockUseAuthStore.mockImplementation((selector: any) =>
        selector({ isAuthenticated: true })
      );

      render(
        <MemoryRouter>
          <PublicRoute>
            <h1>로그인</h1>
          </PublicRoute>
        </MemoryRouter>
      );

      expect(screen.queryByText('로그인')).not.toBeInTheDocument();
    });
  });
});
