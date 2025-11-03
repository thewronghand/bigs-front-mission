import { useState } from 'react';
import { Button } from './common';

interface BoardControlsProps {
  totalPages: number;
  pageSize: number;
  sortOrder: 'desc' | 'asc';
  onParamsChange: (params: { page: string; sort: string; size: string }) => void;
}

export default function BoardControls({
  totalPages,
  pageSize,
  sortOrder,
  onParamsChange,
}: BoardControlsProps) {
  const [pageInput, setPageInput] = useState('');

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 빈 문자열이거나 숫자만 허용
    if (value === '' || /^\d+$/.test(value)) {
      setPageInput(value);
    }
  };

  const handleGoToPage = () => {
    if (!isPageInputValid()) return;
    const pageNumber = parseInt(pageInput, 10);
    onParamsChange({
      page: (pageNumber - 1).toString(), // 0-based index
      sort: sortOrder,
      size: pageSize.toString(),
    });
    setPageInput(''); // 입력창 초기화
  };

  const isPageInputValid = () => {
    if (pageInput === '') return false;
    const pageNumber = parseInt(pageInput, 10);
    return pageNumber >= 1 && pageNumber <= totalPages;
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onParamsChange({
      page: '0',
      sort: sortOrder,
      size: e.target.value,
    });
  };

  const handleSortOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onParamsChange({
      page: '0',
      sort: e.target.value,
      size: pageSize.toString(),
    });
  };

  return (
    <div className="mb-3 xs:mb-4 flex flex-wrap justify-end items-center gap-1.5 xs:gap-2">
      <div className="flex items-center gap-1">
        <input
          type="text"
          value={pageInput}
          onChange={handlePageInputChange}
          placeholder="페이지"
          className="w-16 xs:w-20 sm:w-24 px-2 xs:px-3 py-1.5 xs:py-2 border border-gray-300 rounded text-xs xs:text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && isPageInputValid()) {
              handleGoToPage();
            }
          }}
        />
        <Button
          onClick={handleGoToPage}
          disabled={!isPageInputValid()}
          variant="secondary"
          size="sm"
        >
          이동
        </Button>
      </div>
      <select
        value={pageSize}
        onChange={handlePageSizeChange}
        className="px-2 xs:px-3 py-1.5 xs:py-2 border border-gray-300 rounded-lg text-xs xs:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="12">12개</option>
        <option value="18">18개</option>
        <option value="24">24개</option>
      </select>
      <select
        value={sortOrder}
        onChange={handleSortOrderChange}
        className="px-2 xs:px-3 py-1.5 xs:py-2 border border-gray-300 rounded-lg text-xs xs:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="desc">최신순</option>
        <option value="asc">오래된순</option>
      </select>
    </div>
  );
}
