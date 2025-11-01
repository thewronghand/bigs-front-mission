import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getPosts } from '../api';
import { Button, Spinner } from '../components';
import type { PostListResponse } from '../types/post';

export default function Board() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [postData, setPostData] = useState<PostListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        console.log('게시글 목록 요청 시작: page=0, size=10');
        const data = await getPosts(0, 10);
        console.log('게시글 목록 응답:', data);
        console.log('게시글 개수:', data.content.length);
        console.log('총 개수:', data.totalElements);
        setPostData(data);
      } catch (err) {
        console.error('게시글 목록 조회 실패:', err);
        setError('게시글 목록을 불러오는데 실패했습니다');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const handlePostClick = (id: number) => {
    navigate(`/boards/${id}`);
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
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Spinner size="lg" />
            <p className="text-gray-500 mt-6">로딩 중...</p>
          </div>
        )}

        {error && <p className="text-red-500">{error}</p>}

        {postData && (
          <div>
            <p className="mb-4 text-sm text-gray-600">
              총 {postData.totalElements}개 / {postData.totalPages}페이지
            </p>

            {/* 간단한 데이터 표시 */}
            <div className="space-y-2">
              {postData.content.map((post) => (
                <div key={post.id} className="p-4 bg-white rounded-lg shadow cursor-pointer" onClick={() => handlePostClick(post.id)}>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {post.category}
                      </span>
                      <h3 className="text-lg font-medium mt-2">{post.title}</h3>
                    </div>
                    <p className="text-sm text-gray-500">{post.createdAt}</p>
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
                {JSON.stringify(postData, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
