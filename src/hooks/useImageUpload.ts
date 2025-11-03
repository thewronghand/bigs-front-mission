import { useState, useRef } from 'react';
import {
  MAX_FILE_SIZE,
  MAX_ORIGINAL_FILE_SIZE,
  RESIZE_DIMENSION,
  ALLOWED_IMAGE_EXTENSIONS,
  resizeImage,
} from '../utils/imageUtils';

export const useImageUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [fileError, setFileError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [hasDeletedImage, setHasDeletedImage] = useState(false); // 기존 이미지 삭제 추적
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 공통 파일 처리 함수
  const processFile = async (file: File, clearInput?: () => void) => {
    setFileError('');
    setHasDeletedImage(false); // 새 파일 선택 시 삭제 플래그 리셋

    // 1. 원본 파일 크기 제한 (메모리 보호용)
    if (file.size > MAX_ORIGINAL_FILE_SIZE) {
      setFileError('파일 크기가 너무 큽니다 (최대 15MB)');
      clearInput?.();
      return;
    }

    // 2. MIME 타입 확인
    if (!file.type.startsWith('image/')) {
      setFileError('이미지 파일만 업로드 가능합니다');
      clearInput?.();
      return;
    }

    // 3. 파일 확장자 확인 (MIME 타입 우회 방지)
    const fileName = file.name.toLowerCase();
    const extension = fileName.split('.').pop() || '';
    if (!ALLOWED_IMAGE_EXTENSIONS.includes(extension)) {
      setFileError(`허용된 이미지 형식: ${ALLOWED_IMAGE_EXTENSIONS.join(', ')}`);
      clearInput?.();
      return;
    }

    // 4. 파일 크기에 따라 처리 분기
    if (file.size <= MAX_FILE_SIZE) {
      // 이미 1MB 이하면 리사이징 없이 바로 사용
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // 1MB 초과하면 리사이징 시도
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = async () => {
        URL.revokeObjectURL(objectUrl);

        try {
          // 이미지 리사이징 (1920px 기준)
          const resizedFile = await resizeImage(file, RESIZE_DIMENSION);

          // 리사이징 후 파일 크기 재확인
          if (resizedFile.size > MAX_FILE_SIZE) {
            setFileError('리사이징 후에도 파일 크기가 1MB를 초과합니다');
            clearInput?.();
            return;
          }

          // 모든 검증 통과 - 파일 설정 및 미리보기
          setSelectedFile(resizedFile);
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreview(reader.result as string);
          };
          reader.readAsDataURL(resizedFile);
        } catch (error) {
          console.error('이미지 리사이징 실패:', error);
          setFileError('이미지 처리 중 오류가 발생했습니다');
          clearInput?.();
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        setFileError('유효하지 않은 이미지 파일입니다');
        clearInput?.();
      };

      img.src = objectUrl;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file, () => {
      e.target.value = '';
    });
  };

  // 드래그 앤 드롭 핸들러
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    // 기존 이미지(서버 URL)를 삭제하는 경우 추적
    if (preview && (preview.startsWith('http') || preview.includes('/media/'))) {
      setHasDeletedImage(true);
    }

    setSelectedFile(null);
    setPreview('');
    setFileError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return {
    selectedFile,
    preview,
    setPreview,
    fileError,
    isDragging,
    hasDeletedImage,
    fileInputRef,
    handleFileChange,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleUploadClick,
    handleRemoveImage,
  };
};
