import { useParams, useNavigate } from 'react-router-dom';
import { getPostDetail } from '../api';
import { useEffect, useState } from 'react';
import type { Post } from '../types/post';
import { API_BASE_URL, formatDate } from '../utils';
import { Button, Spinner } from '../components';

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [postDetailData, setPostDetailData] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageLoading, setImageLoading] = useState(true);

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
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">게시글 상세</h1>
          <Button
            onClick={() => navigate('/boards')}
            variant="secondary"
            size="md"
          >
            목록으로
          </Button>
        </div>
      </header>

      {/* 본문 */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-8 min-h-[340px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[276px]">
              <Spinner size="lg" />
              <p className="text-gray-500 mt-6">로딩 중...</p>
            </div>
          ) : postDetailData ? (
            <div key={postDetailData.id} className="animate-fadeIn">
              {/* 카테고리 */}
              <div className="mb-4 flex justify-between">
                <div>
                  <span className="inline-block text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded">
                    {postDetailData.boardCategory}
                  </span>
                </div>
                {/* 작성일 */}
                <p className="text-sm text-gray-500 py-1">
                  {formatDate(postDetailData.createdAt)}
                </p>
              </div>

              {/* 제목 */}
              <h2 className="text-3xl font-bold text-gray-800 mb-4 wrap-break-word">
                {postDetailData.title}
              </h2>

              <div className="mb-4 flex gap-1.5 justify-end">
                <Button variant="secondary" size="xs">
                  수정
                </Button>
                <Button variant="danger" size="xs">
                  삭제
                </Button>
              </div>

              {/* 이미지 */}
              {postDetailData.imageUrl && (
                <div className="mb-6 relative min-h-[300px]">
                  {imageLoading && (
                    <div className="absolute inset-0 bg-gray-200 rounded-lg flex items-center justify-center transition-opacity duration-300">
                      <Spinner size="md" color="white" />
                    </div>
                  )}
                  <img
                    src={`${API_BASE_URL}${postDetailData.imageUrl}`}
                    alt="게시글 이미지"
                    className={`${
                      imageLoading ? 'opacity-0' : 'opacity-100'
                    } max-w-full max-h-[800px] object-contain rounded-lg shadow transition-opacity duration-500`}
                    onLoad={() => setImageLoading(false)}
                    onError={() => setImageLoading(false)}
                  />
                </div>
              )}

              {/* 내용 */}
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
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
