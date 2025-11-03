import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MdInbox, MdAdd } from 'react-icons/md';
import toast from 'react-hot-toast';
import { getPosts, deletePost } from '../api';
import { Spinner, Pagination, PostCard, BoardControls, ConfirmModal } from '../components';
import type { PostListResponse } from '../types/post';

export default function Board() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [postData, setPostData] = useState<PostListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // URL에서 페이지, 정렬 순서, 페이지 크기 읽기
  const currentPage = parseInt(searchParams.get('page') || '0', 10);
  const sortOrder = (searchParams.get('sort') || 'desc') as 'desc' | 'asc';
  const pageSize = parseInt(searchParams.get('size') || '12', 10);

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

  const handleEdit = (id: number) => {
    navigate(`/boards/${id}/edit`);
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteId === null) return;

    try {
      setDeleting(true);
      await deletePost(deleteId);
      setShowDeleteModal(false);
      setDeleteId(null);

      // 목록 새로고침
      const data = await getPosts(currentPage, pageSize, sortOrder);
      setPostData(data);

      // 성공 toast
      toast.success('게시글이 삭제되었습니다');
    } catch (err) {
      console.error('게시글 삭제 실패:', err);
      toast.error('게시글 삭제에 실패했습니다');
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteId(null);
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
      {/* 삭제 확인 모달 */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="게시글 삭제"
        message="정말 삭제하시겠습니까?&#10;이 작업은 되돌릴 수 없습니다."
        confirmText="삭제"
        loading={deleting}
      />

      {/* 본문 */}
      <div className="max-w-4xl mx-auto px-3 xs:px-4 py-4 xs:py-6 sm:py-8">
        {error && <p className="text-red-500 text-sm xs:text-base">{error}</p>}

        {/* 초기 로딩 */}
        {!postData && loading && (
          <div className="flex flex-col items-center justify-center py-8 xs:py-12 animate-fadeIn">
            <Spinner size="lg" />
            <p className="text-gray-500 mt-4 xs:mt-6 text-sm xs:text-base">로딩 중...</p>
          </div>
        )}

        {postData && (
          <div className="animate-fadeIn">
            {/* 총 개수/페이지 수 */}
            <div className="mb-2">
              <p className="text-xs xs:text-sm text-gray-600">
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
              <div className="flex flex-col items-center justify-center py-8 xs:py-12 animate-fadeIn">
                <Spinner size="lg" />
                <p className="text-gray-500 mt-4 xs:mt-6 text-sm xs:text-base">로딩 중...</p>
              </div>
            )}

            {/* 게시글 목록 */}
            {!loading && (
              <>
                {postData.content.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 xs:py-16 sm:py-20 animate-fadeIn">
                    <MdInbox size={64} className="text-gray-300 mb-4" />
                    <p className="text-gray-500 text-base xs:text-lg">아직 게시글이 없습니다</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 xs:gap-3 sm:gap-4 animate-fadeIn">
                    {postData.content.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onClick={handlePostClick}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
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

      {/* FAB 버튼 (모바일 전용) - 글쓰기 */}
      <button
        onClick={() => navigate('/boards/new')}
        className="sm:hidden fixed bottom-20 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center z-40 hover:bg-blue-700 active:bg-blue-800 transition-colors cursor-pointer"
        aria-label="글쓰기"
      >
        <MdAdd size={28} />
      </button>
    </div>
  );
}
