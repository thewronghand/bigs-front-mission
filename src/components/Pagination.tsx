import { useState, useRef, useLayoutEffect } from 'react';
import {
  MdFirstPage,
  MdLastPage,
  MdNavigateBefore,
  MdNavigateNext,
} from 'react-icons/md';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const [maxVisiblePages, setMaxVisiblePages] = useState(9);
  const containerRef = useRef<HTMLDivElement>(null);

  // 9개 기준으로 페이지 범위 계산 (자릿수 분석용)
  const calculatePageRangeWith9Pages = (totalPages: number, page: number) => {
    const maxPages = 9;
    const halfRange = Math.floor(maxPages / 2);

    if (totalPages <= maxPages) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }
    if (page < halfRange) {
      return Array.from({ length: maxPages }, (_, i) => i);
    }
    if (page >= totalPages - halfRange) {
      return Array.from(
        { length: maxPages },
        (_, i) => totalPages - maxPages + i
      );
    }

    return Array.from({ length: maxPages }, (_, i) => page - halfRange + i);
  };

  // 3자릿수 버튼 개수에 따른 임계값 계산
  useLayoutEffect(() => {
    const checkPageCount = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.offsetWidth;

      // 9개 기준으로 표시될 페이지 번호들
      const pages = calculatePageRangeWith9Pages(totalPages, currentPage);

      // 3자릿수 버튼 개수 카운트
      const threeDigitCount = pages.filter((p) => p + 1 >= 100).length;

      // 3자릿수 개수에 따른 임계값 (사용자 측정 데이터 기반)
      // 3자리 9개: 360px, 8개: 350px, 7개: 340px, 6개: 330px, 5개: 320px
      const threshold = 360 - (9 - threeDigitCount) * 10;

      // container가 임계값보다 작으면 7개로 줄임
      const shouldUse7Pages = containerWidth < threshold;
      const newMaxPages = shouldUse7Pages ? 7 : 9;

      setMaxVisiblePages((prev) => (prev !== newMaxPages ? newMaxPages : prev));
    };

    checkPageCount();

    // 화면 크기 변경 시 재측정
    window.addEventListener('resize', checkPageCount);
    return () => window.removeEventListener('resize', checkPageCount);
  }, [totalPages, currentPage]);

  const getPageRange = (totalPages: number) => {
    const maxPages = maxVisiblePages;
    const halfRange = Math.floor(maxPages / 2);

    if (totalPages <= maxPages) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }
    if (currentPage < halfRange) {
      return Array.from({ length: maxPages }, (_, i) => i);
    }
    if (currentPage >= totalPages - halfRange) {
      return Array.from(
        { length: maxPages },
        (_, i) => totalPages - maxPages + i
      );
    }

    return Array.from(
      { length: maxPages },
      (_, i) => currentPage - halfRange + i
    );
  };

  return (
    <div ref={containerRef} className="@container">
      <div className="flex w-full gap-1 text-xs justify-center items-center">
        {/* 맨 처음으로 */}
        <button
          className={`@[430px]:flex hidden px-2 py-1 rounded-sm ${
            currentPage === 0
              ? 'opacity-0 cursor-default'
              : 'bg-gray-200 hover:bg-gray-300 cursor-pointer'
          }`}
          onClick={() => currentPage !== 0 && onPageChange(0)}
        >
          <MdFirstPage size={16} />
        </button>

        {/* 이전 10페이지 */}
        <button
          className={`@[360px]:flex hidden px-2 py-1 rounded-sm ${
            currentPage === 0
              ? 'opacity-0 cursor-default'
              : 'bg-gray-200 hover:bg-gray-300 cursor-pointer'
          }`}
          onClick={() => currentPage > 0 && onPageChange(Math.max(0, currentPage - 10))}
        >
          <MdNavigateBefore size={16} />
        </button>

        {/* 페이지 번호들 */}
        <div className="flex gap-1">
          {getPageRange(totalPages).map((pageIndex) => (
            <button
              className={`font-mono px-1.5 py-1 cursor-pointer rounded-sm ${
                pageIndex === currentPage
                  ? 'bg-blue-200 text-blue-500'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
              key={pageIndex}
              onClick={() => onPageChange(pageIndex)}
            >
              {pageIndex + 1}
            </button>
          ))}
        </div>

        {/* 다음 10페이지 */}
        <button
          className={`@[360px]:flex hidden px-2 py-1 rounded-sm ${
            currentPage === totalPages - 1
              ? 'opacity-0 cursor-default'
              : 'bg-gray-200 hover:bg-gray-300 cursor-pointer'
          }`}
          onClick={() =>
            currentPage < totalPages - 1 &&
            onPageChange(Math.min(totalPages - 1, currentPage + 10))
          }
        >
          <MdNavigateNext size={16} />
        </button>

        {/* 맨 끝으로 */}
        <button
          className={`@[430px]:flex hidden px-2 py-1 rounded-sm ${
            currentPage === totalPages - 1
              ? 'opacity-0 cursor-default'
              : 'bg-gray-200 hover:bg-gray-300 cursor-pointer'
          }`}
          onClick={() =>
            currentPage !== totalPages - 1 &&
            onPageChange(totalPages - 1)
          }
        >
          <MdLastPage size={16} />
        </button>
      </div>
    </div>
  );
}
