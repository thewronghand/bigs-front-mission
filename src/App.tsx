import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SignUp, SignIn, Board, PostDetail, PostForm } from './pages';
import { PrivateRoute, PublicRoute, ScrollToTop } from './components';
import { SessionExpiredOverlay } from './components/auth';
import { ROUTES } from './utils';
import { NavigationBlockerProvider } from './contexts/NavigationBlockerContext';
import { useAuthStore } from './store/authStore';
import AuthenticatedLayout from './layouts/AuthenticatedLayout';

function App() {
  const showSessionExpired = useAuthStore((state) => state.showSessionExpired);
  const [isDesktop, setIsDesktop] = useState(
    window.matchMedia('(min-width: 768px)').matches
  );

  useEffect(() => {
    // Tailwind의 md 브레이크포인트와 동일 (768px)
    const mediaQuery = window.matchMedia('(min-width: 768px)');

    const handleChange = (e: MediaQueryListEvent) => {
      setIsDesktop(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <BrowserRouter>
      <NavigationBlockerProvider>
        <ScrollToTop />
        <Toaster
          position={isDesktop ? 'top-center' : 'bottom-right'}
          toastOptions={{
            // 반응형 스타일
            style: {
              fontSize: isDesktop ? '16px' : '14px',
              padding: isDesktop ? '16px 20px' : '12px 16px',
              minWidth: isDesktop ? '320px' : '250px',
              maxWidth: '90vw',
            },
          }}
          containerStyle={
            isDesktop
              ? { top: '80px' }
              : { bottom: '16px', right: '16px' }
          }
        />
        <SessionExpiredOverlay isVisible={showSessionExpired} />
        <Routes>
        {/* Public Routes - 로그인 상태면 게시판으로 리다이렉트 */}
        <Route
          path={ROUTES.SIGN_UP}
          element={
            <PublicRoute>
              <SignUp />
            </PublicRoute>
          }
        />
        <Route
          path={ROUTES.SIGN_IN}
          element={
            <PublicRoute>
              <SignIn />
            </PublicRoute>
          }
        />

        {/* Private Routes with Layout */}
        <Route
          element={
            <PrivateRoute>
              <AuthenticatedLayout />
            </PrivateRoute>
          }
        >
          <Route path={ROUTES.BOARD} element={<Board />} />
          <Route path={ROUTES.POST_DETAIL} element={<PostDetail />} />
          <Route path={ROUTES.POST_NEW} element={<PostForm />} />
          <Route path={ROUTES.POST_EDIT} element={<PostForm />} />
        </Route>

        {/* Default Route */}
        <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.BOARD} replace />} />
      </Routes>
      </NavigationBlockerProvider>
    </BrowserRouter>
  );
}

export default App;
