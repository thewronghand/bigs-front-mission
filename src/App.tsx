import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SignUp, SignIn, BoardList, BoardDetail, BoardForm } from './pages';
import { PrivateRoute } from './components';
import { ROUTES } from './utils';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path={ROUTES.SIGN_UP} element={<SignUp />} />
        <Route path={ROUTES.SIGN_IN} element={<SignIn />} />

        {/* Private Routes */}
        <Route
          path={ROUTES.BOARDS}
          element={
            <PrivateRoute>
              <BoardList />
            </PrivateRoute>
          }
        />
        <Route
          path={ROUTES.BOARD_DETAIL}
          element={
            <PrivateRoute>
              <BoardDetail />
            </PrivateRoute>
          }
        />
        <Route
          path={ROUTES.BOARD_NEW}
          element={
            <PrivateRoute>
              <BoardForm />
            </PrivateRoute>
          }
        />
        <Route
          path={ROUTES.BOARD_EDIT}
          element={
            <PrivateRoute>
              <BoardForm />
            </PrivateRoute>
          }
        />

        {/* Default Route */}
        <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.BOARDS} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
