import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Header } from '../components';
import { useAuthStore } from '../store/authStore';
import { useNavigationBlocker } from '../contexts/NavigationBlockerContext';
import { ROUTES } from '../utils';

export default function AuthenticatedLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { shouldBlockNavigation } = useNavigationBlocker();

  // Navigation 전에 blocker 체크하는 헬퍼 함수
  const navigateWithCheck = (to: string) => {
    if (shouldBlockNavigation(to)) {
      // blocker가 true를 반환하면 navigation을 진행하지 않음
      // PostForm에서 모달을 띄울 것임
      return;
    }
    navigate(to);
  };

  const handleLogout = () => {
    if (shouldBlockNavigation(ROUTES.SIGN_IN)) {
      return;
    }
    logout();
    navigate(ROUTES.SIGN_IN);
  };

  const handleLogoClick = () => {
    navigateWithCheck(ROUTES.BOARD);
  };

  // 현재 경로에 따라 다른 actionButton 설정
  const getActionButton = () => {
    // 게시판 목록 페이지
    if (location.pathname === ROUTES.BOARD) {
      return {
        label: '글쓰기',
        onClick: () => navigateWithCheck(ROUTES.POST_NEW),
        variant: 'primary' as const,
      };
    }

    // 그 외 페이지 (상세, 작성, 수정)
    return {
      label: '목록으로',
      onClick: () => navigateWithCheck(ROUTES.BOARD),
      variant: 'primary' as const,
    };
  };

  return (
    <>
      <Header
        user={user}
        onLogout={handleLogout}
        onLogoClick={handleLogoClick}
        actionButton={getActionButton()}
      />
      <Outlet />
    </>
  );
}
