import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getBoards } from '../api';
import { Button } from '../components';
import type { BoardListResponse } from '../types/board';

export default function BoardList() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [boardData, setBoardData] = useState<BoardListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        console.log('게시판 요청 시작: page=0, size=10');
        const data = await getBoards(0, 10);
        console.log('게시판 응답:', data);
        console.log('게시글 개수:', data.content.length);
        console.log('총 개수:', data.totalElements);
        setBoardData(data);
      } catch (err) {
        console.error('게시판 조회 실패:', err);
        setError('게시판을 불러오는데 실패했습니다');
      } finally {
        setLoading(false);
      }
    };

    fetchBoards();
  }, []);

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
            <Button onClick={() => navigate('/boards/new')} variant="primary" size="md">
              글쓰기
            </Button>
            <Button onClick={handleLogout} variant="secondary" size="md">
              로그아웃
            </Button>
          </div>
        </div>
      </header>

      {/* 본문 */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {loading && <p className="text-gray-500">로딩 중...</p>}

        {error && <p className="text-red-500">{error}</p>}

        {boardData && (
          <div>
            <p className="mb-4 text-sm text-gray-600">
              총 {boardData.totalElements}개 / {boardData.totalPages}페이지
            </p>

            {/* 간단한 데이터 표시 */}
            <div className="space-y-2">
              {boardData.content.map((board) => (
                <div key={board.id} className="p-4 bg-white rounded-lg shadow">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {board.category}
                      </span>
                      <h3 className="text-lg font-medium mt-2">{board.title}</h3>
                    </div>
                    <p className="text-sm text-gray-500">{board.createdAt}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* API 응답 전체 구조 확인용 */}
            <details className="mt-8">
              <summary className="cursor-pointer text-sm text-gray-600">
                API 응답 전체 보기 (디버깅용)
              </summary>
              <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
                {JSON.stringify(boardData, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
