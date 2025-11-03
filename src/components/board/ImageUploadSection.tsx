import { IoClose } from 'react-icons/io5';
import { formatFileSize } from '../../utils/imageUtils';

interface ImageUploadSectionProps {
  preview: string;
  selectedFile: File | null;
  fileError: string;
  isDragging: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDragEnter: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleUploadClick: () => void;
  handleRemoveImage: () => void;
}

export default function ImageUploadSection({
  preview,
  selectedFile,
  fileError,
  isDragging,
  fileInputRef,
  handleFileChange,
  handleDragEnter,
  handleDragLeave,
  handleDragOver,
  handleDrop,
  handleUploadClick,
  handleRemoveImage,
}: ImageUploadSectionProps) {
  return (
    <div>
      <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1.5 xs:mb-2">
        이미지 첨부 (선택)
      </label>

      {/* Hidden file input */}
      <input
        type="file"
        id="file"
        accept="image/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        className="hidden"
      />

      {/* 카드 스타일 업로드 영역 */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50">
        {!preview ? (
          // 업로드 전
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={handleUploadClick}
            className={`cursor-pointer h-64 flex items-center justify-center ${
              isDragging
                ? 'bg-blue-50'
                : 'hover:bg-gray-100'
            }`}
          >
            <div className="flex flex-col items-center justify-center">
              <svg
                className="w-12 h-12 text-gray-400 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-gray-600 mb-1">
                {isDragging ? '이미지를 놓아주세요' : '이미지를 드래그하거나 클릭하여 업로드'}
              </p>
              <p className="text-xs text-gray-500">최대 1MB, JPG/PNG/GIF/WEBP</p>
            </div>
          </div>
        ) : (
          // 업로드 후
          <div className="relative bg-white">
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 hover:scale-110 shadow-lg cursor-pointer transition-transform"
              aria-label="이미지 삭제"
            >
              <IoClose className="text-xl" />
            </button>
            {/* 고정 높이 이미지 영역 */}
            <div className="h-64 flex items-center justify-center bg-gray-100">
              <img
                src={preview}
                alt="업로드된 이미지"
                className="max-w-full max-h-full object-contain"
              />
            </div>
            {/* 파일 정보 */}
            {selectedFile && (
              <div className="px-3 xs:px-4 py-2 xs:py-3 bg-gray-50 border-t border-gray-200">
                <p className="text-xs xs:text-sm text-gray-700 font-medium truncate">
                  {selectedFile.name}
                </p>
                <p className="text-[10px] xs:text-xs text-gray-500 mt-1">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {fileError && (
        <p className="text-xs xs:text-sm text-red-500 mt-2">{fileError}</p>
      )}
    </div>
  );
}
