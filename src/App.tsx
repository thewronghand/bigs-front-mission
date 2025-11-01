import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SignUp, SignIn, Board, PostDetail, PostForm } from './pages';
import { PrivateRoute, PublicRoute } from './components';
import { ROUTES } from './utils';

function App() {
  return (
    <BrowserRouter>
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

        {/* Private Routes */}
        <Route
          path={ROUTES.BOARD}
          element={
            <PrivateRoute>
              <Board />
            </PrivateRoute>
          }
        />
        <Route
          path={ROUTES.POST_DETAIL}
          element={
            <PrivateRoute>
              <PostDetail />
            </PrivateRoute>
          }
        />
        <Route
          path={ROUTES.POST_NEW}
          element={
            <PrivateRoute>
              <PostForm />
            </PrivateRoute>
          }
        />
        <Route
          path={ROUTES.POST_EDIT}
          element={
            <PrivateRoute>
              <PostForm />
            </PrivateRoute>
          }
        />

        {/* Default Route */}
        <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.BOARD} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
