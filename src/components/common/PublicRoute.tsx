import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { ROUTES } from '../../utils';

interface PublicRouteProps {
  children: React.ReactNode;
}

export default function PublicRoute({ children }: PublicRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // 이미 로그인된 상태라면 게시판으로 리다이렉트
  if (isAuthenticated) {
    return <Navigate to={ROUTES.BOARDS} replace />;
  }

  return <>{children}</>;
}
