import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MdInbox } from 'react-icons/md';
import { getPosts } from '../api';
import { Spinner, Pagination, PostCard, BoardControls } from '../components';
import type { PostListResponse } from '../types/post';

export default function Board() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [postData, setPostData] = useState<PostListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // URL에서 페이지, 정렬 순서, 페이지 크기 읽기
  const currentPage = parseInt(searchParams.get('page') || '0', 10);
  const sortOrder = (searchParams.get('sort') || 'desc') as 'desc' | 'asc';
  const pageSize = parseInt(searchParams.get('size') || '10', 10);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const data = await getPosts(currentPage, pageSize, sortOrder);
        setPostData(data);
      } catch (err) {
        console.error('게시글 목록 조회 실패:', err);
        setError('게시글 목록을 불러오는데 실패했습니다');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [currentPage, sortOrder, pageSize]);

  const handlePostClick = (id: number) => {
    navigate(`/boards/${id}`);
  };

  const handlePageChange = (pageNumber: number) => {
    setSearchParams({
      page: pageNumber.toString(),
      sort: sortOrder,
      size: pageSize.toString(),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 본문 */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {error && <p className="text-red-500">{error}</p>}

        {/* 초기 로딩 */}
        {!postData && loading && (
          <div className="flex flex-col items-center justify-center py-12 animate-fadeIn">
            <Spinner size="lg" />
            <p className="text-gray-500 mt-6">로딩 중...</p>
          </div>
        )}

        {postData && (
          <div className="animate-fadeIn">
            {/* 총 개수/페이지 수 */}
            <div className="mb-2">
              <p className="text-sm text-gray-600">
                총 {postData.totalElements}개 / {postData.totalPages}페이지
              </p>
            </div>

            {/* 페이지 이동 + 정렬 */}
            <BoardControls
              totalPages={postData.totalPages}
              pageSize={pageSize}
              sortOrder={sortOrder}
              onParamsChange={setSearchParams}
            />

            {postData.content.length > 0 && (
              <div className="mb-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={postData.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}

            {/* 로딩 UI */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-12 animate-fadeIn">
                <Spinner size="lg" />
                <p className="text-gray-500 mt-6">로딩 중...</p>
              </div>
            )}

            {/* 게시글 목록 */}
            {!loading && (
              <>
                {postData.content.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
                    <MdInbox size={64} className="text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg">아직 게시글이 없습니다</p>
                  </div>
                ) : (
                  <div className="space-y-2 animate-fadeIn">
                    {postData.content.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onClick={handlePostClick}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* 하단 페이지네이션 */}
            {!loading && postData.content.length > 0 && (
              <div className="mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={postData.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
