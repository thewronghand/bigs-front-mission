import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function BoardList() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">게시판</h1>
          <div className="flex items-center gap-4">
            {user && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">{user.name}</span>님
              </div>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* 본문 */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-gray-500">게시판 목록 페이지 (작업 예정)</p>
      </div>
    </div>
  );
}
