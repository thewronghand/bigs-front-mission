import { useParams, useNavigate } from "react-router-dom";
import { getPostDetail } from "../api";
import { useEffect, useState } from "react";
import type { Post } from "../types/post";
import { API_BASE_URL } from "../utils";
import { Button } from "../components";

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [postDetailData, setPostDetailData] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    }

    fetchPostDetail();
  }, [id]);
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">게시글 상세</h1>
          <Button onClick={() => navigate('/boards')} variant="secondary" size="md">
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
              <svg className="animate-spin h-12 w-12" viewBox="0 0 50 50">
                <circle
                  cx="25"
                  cy="25"
                  r="20"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="4"
                />
                <circle
                  cx="25"
                  cy="25"
                  r="20"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="80, 200"
                  strokeDashoffset="0"
                />
              </svg>
              <p className="text-gray-500 mt-6">로딩 중...</p>
            </div>
          ) : postDetailData ? (
            <div key={postDetailData.id} className="animate-fadeIn">
            {/* 카테고리 */}
            <div className="mb-4">
              <span className="inline-block text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded">
                {postDetailData.boardCategory}
              </span>
            </div>

            {/* 제목 */}
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              {postDetailData.title}
            </h2>

            {/* 작성일 */}
            <p className="text-sm text-gray-500 mb-6">
              {new Date(postDetailData.createdAt).toLocaleString('ko-KR')}
            </p>

            {/* 이미지 */}
            {postDetailData.imageUrl && (
              <div className="mb-6">
                <img
                  src={`${API_BASE_URL}${postDetailData.imageUrl}`}
                  alt="게시글 이미지"
                  className="max-w-full rounded-lg shadow"
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
