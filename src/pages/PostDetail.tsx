import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getPostDetail, deletePost } from '../api';
import { useEffect, useState } from 'react';
import type { Post } from '../types/post';
import { API_BASE_URL, formatDate } from '../utils';
import { Button, Spinner, ConfirmModal } from '../components';

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [postDetailData, setPostDetailData] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageLoading, setImageLoading] = useState(true);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchPostDetail = async () => {
      try {
        setLoading(true);
        const data = await getPostDetail(Number(id));
        setPostDetailData(data);
      } catch (err) {
        console.error(err);
        setError('게시글을 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetail();
  }, [id]);

  // 이미지 프리로드 및 크기 계산
  useEffect(() => {
    if (postDetailData?.imageUrl) {
      setImageLoading(true);
      const img = new Image();
      img.src = `${API_BASE_URL}${postDetailData.imageUrl}`;
      img.onload = () => {
        // 원본 크기 저장
        setImageDimensions({ width: img.width, height: img.height });
        setImageLoading(false);
      };
      img.onerror = () => {
        setImageLoading(false);
      };
    }
  }, [postDetailData?.imageUrl]);

  const handleEdit = () => {
    navigate(`/boards/${id}/edit`);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!id) return;

    try {
      setDeleting(true);
      await deletePost(Number(id));
      setShowDeleteModal(false);

      // 성공 toast
      toast.success('게시글이 삭제되었습니다');

      // 목록으로 이동 (toast 표시 후)
      setTimeout(() => navigate('/boards'), 500);
    } catch (err) {
      console.error('게시글 삭제 실패:', err);
      toast.error('게시글 삭제에 실패했습니다');
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
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
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 xs:p-4">
            <p className="text-red-600 text-sm xs:text-base">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-4 xs:p-6 sm:p-8 min-h-[340px]">
          {loading || (postDetailData?.imageUrl && imageLoading) ? (
            <div className="flex flex-col items-center justify-center h-[276px]">
              <Spinner size="lg" />
              <p className="text-gray-500 mt-4 xs:mt-6 text-sm xs:text-base">로딩 중...</p>
            </div>
          ) : postDetailData ? (
            <div key={postDetailData.id} className="animate-fadeIn">
              {/* 카테고리 */}
              <div className="mb-3 xs:mb-4 flex justify-between items-start flex-col xs:flex-row gap-2 xs:gap-0">
                <div>
                  <span className="inline-block text-[10px] xs:text-xs bg-blue-100 text-blue-800 px-2 xs:px-3 py-0.5 xs:py-1 rounded">
                    {postDetailData.boardCategory}
                  </span>
                </div>
                {/* 작성일 */}
                <p className="text-xs xs:text-sm text-gray-500 xs:py-1">
                  {formatDate(postDetailData.createdAt)}
                </p>
              </div>

              {/* 제목 */}
              <h2 className="text-xl xs:text-2xl sm:text-3xl font-bold text-gray-800 mb-3 xs:mb-4 wrap-break-word">
                {postDetailData.title}
              </h2>

              <div className="mb-3 xs:mb-4 flex gap-1.5 xs:gap-2 justify-end">
                <Button variant="secondary" size="xs" onClick={handleEdit} className="text-xs xs:text-sm px-2 xs:px-3 py-1 xs:py-1.5">
                  수정
                </Button>
                <Button variant="danger" size="xs" onClick={handleDelete} className="text-xs xs:text-sm px-2 xs:px-3 py-1 xs:py-1.5">
                  삭제
                </Button>
              </div>

              {/* 이미지 */}
              {postDetailData.imageUrl && (
                <div className="mb-4 xs:mb-6">
                  <img
                    src={`${API_BASE_URL}${postDetailData.imageUrl}`}
                    alt="게시글 이미지"
                    width={imageDimensions?.width}
                    height={imageDimensions?.height}
                    className="max-w-full max-h-[600px] xs:max-h-[800px] h-auto rounded-lg shadow"
                  />
                </div>
              )}

              {/* 내용 */}
              <div className="prose max-w-none">
                <p className="text-sm xs:text-base text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {postDetailData.content}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
