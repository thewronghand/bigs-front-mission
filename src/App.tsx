import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SignUp, SignIn, Board, PostDetail, PostForm } from './pages';
import { PrivateRoute, PublicRoute, ScrollToTop } from './components';
import { ROUTES } from './utils';
import { NavigationBlockerProvider } from './contexts/NavigationBlockerContext';
import AuthenticatedLayout from './layouts/AuthenticatedLayout';

function App() {
  return (
    <BrowserRouter>
      <NavigationBlockerProvider>
        <ScrollToTop />
        <Toaster position="bottom-right" />
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
