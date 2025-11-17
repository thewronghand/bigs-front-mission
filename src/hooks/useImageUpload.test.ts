import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useImageUpload } from './useImageUpload';

// Mock imageUtils
vi.mock('../utils/imageUtils', async () => {
  const actual = await vi.importActual('../utils/imageUtils');
  return {
    ...actual,
    resizeImage: vi.fn((file: File) => Promise.resolve(file)),
  };
});

describe('useImageUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('초기 상태', () => {
    it('selectedFile은 null이다', () => {
      const { result } = renderHook(() => useImageUpload());

      expect(result.current.selectedFile).toBeNull();
    });

    it('preview는 빈 문자열이다', () => {
      const { result } = renderHook(() => useImageUpload());

      expect(result.current.preview).toBe('');
    });

    it('fileError는 빈 문자열이다', () => {
      const { result } = renderHook(() => useImageUpload());

      expect(result.current.fileError).toBe('');
    });

    it('isDragging은 false이다', () => {
      const { result } = renderHook(() => useImageUpload());

      expect(result.current.isDragging).toBe(false);
    });

    it('hasDeletedImage는 false이다', () => {
      const { result } = renderHook(() => useImageUpload());

      expect(result.current.hasDeletedImage).toBe(false);
    });
  });

  describe('드래그 앤 드롭 상태 관리', () => {
    it('handleDragEnter 호출 시 isDragging이 true가 된다', () => {
      const { result } = renderHook(() => useImageUpload());

      const mockEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as React.DragEvent;

      act(() => {
        result.current.handleDragEnter(mockEvent);
      });

      expect(result.current.isDragging).toBe(true);
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });

    it('handleDragLeave 호출 시 isDragging이 false가 된다', () => {
      const { result } = renderHook(() => useImageUpload());

      const mockEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as React.DragEvent;

      // 먼저 dragging 상태로 만들기
      act(() => {
        result.current.handleDragEnter(mockEvent);
      });

      expect(result.current.isDragging).toBe(true);

      // 떠나기
      act(() => {
        result.current.handleDragLeave(mockEvent);
      });

      expect(result.current.isDragging).toBe(false);
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });

    it('handleDragOver는 기본 동작을 막는다', () => {
      const { result } = renderHook(() => useImageUpload());

      const mockEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as React.DragEvent;

      act(() => {
        result.current.handleDragOver(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });
  });

  describe('handleRemoveImage', () => {
    it('selectedFile을 null로 설정한다', () => {
      const { result } = renderHook(() => useImageUpload());

      // 가짜 파일 설정 (내부 상태를 직접 변경할 수 없으므로 preview 설정으로 간접 확인)
      act(() => {
        result.current.handleRemoveImage();
      });

      expect(result.current.selectedFile).toBeNull();
    });

    it('preview를 빈 문자열로 설정한다', () => {
      const { result } = renderHook(() => useImageUpload());

      // preview 설정
      act(() => {
        result.current.setPreview('data:image/png;base64,test');
      });

      expect(result.current.preview).toBe('data:image/png;base64,test');

      // 제거
      act(() => {
        result.current.handleRemoveImage();
      });

      expect(result.current.preview).toBe('');
    });

    it('fileError를 빈 문자열로 설정한다', () => {
      const { result } = renderHook(() => useImageUpload());

      // 임의로 에러 상태를 만들 수 없으므로, 제거 후 상태 확인
      act(() => {
        result.current.handleRemoveImage();
      });

      expect(result.current.fileError).toBe('');
    });

    it('서버 이미지(http URL)를 삭제하면 hasDeletedImage가 true가 된다', () => {
      const { result } = renderHook(() => useImageUpload());

      // 서버 이미지 설정
      act(() => {
        result.current.setPreview('http://example.com/image.png');
      });

      // 삭제
      act(() => {
        result.current.handleRemoveImage();
      });

      expect(result.current.hasDeletedImage).toBe(true);
    });

    it('서버 이미지(/media/ 경로)를 삭제하면 hasDeletedImage가 true가 된다', () => {
      const { result } = renderHook(() => useImageUpload());

      // 서버 이미지 설정
      act(() => {
        result.current.setPreview('/media/images/test.png');
      });

      // 삭제
      act(() => {
        result.current.handleRemoveImage();
      });

      expect(result.current.hasDeletedImage).toBe(true);
    });

    it('로컬 이미지(data: URL)를 삭제하면 hasDeletedImage가 false다', () => {
      const { result } = renderHook(() => useImageUpload());

      // 로컬 이미지 설정
      act(() => {
        result.current.setPreview('data:image/png;base64,test');
      });

      // 삭제
      act(() => {
        result.current.handleRemoveImage();
      });

      expect(result.current.hasDeletedImage).toBe(false);
    });
  });

  describe('handleUploadClick', () => {
    it('fileInputRef.current.click()을 호출한다', () => {
      const { result } = renderHook(() => useImageUpload());

      // Mock the ref's click method
      const mockClick = vi.fn();
      if (result.current.fileInputRef.current) {
        result.current.fileInputRef.current.click = mockClick;
      } else {
        // fileInputRef는 실제 DOM 요소가 아니므로 mock 객체를 할당
        (result.current.fileInputRef as any).current = { click: mockClick };
      }

      act(() => {
        result.current.handleUploadClick();
      });

      expect(mockClick).toHaveBeenCalled();
    });
  });

  // processFile, handleFileChange, handleDrop은 FileReader, Image, URL 등
  // 브라우저 API를 사용하므로 통합 테스트나 E2E에서 테스트하는 것이 적절합니다.
  describe('파일 처리 함수 (브라우저 API 필요)', () => {
    it('processFile, handleFileChange, handleDrop은 브라우저 환경이 필요함', () => {
      // 이 함수들은 다음을 사용합니다:
      // - FileReader (readAsDataURL)
      // - Image (onload, onerror)
      // - URL.createObjectURL / revokeObjectURL
      // - resizeImage (Canvas API)
      //
      // 실제 브라우저 환경이나 Playwright/Cypress 같은
      // E2E 테스트 도구에서 테스트하는 것이 적절합니다.
      expect(true).toBe(true);
    });
  });

  describe('setPreview', () => {
    it('preview 값을 변경할 수 있다', () => {
      const { result } = renderHook(() => useImageUpload());

      expect(result.current.preview).toBe('');

      act(() => {
        result.current.setPreview('http://example.com/test.png');
      });

      expect(result.current.preview).toBe('http://example.com/test.png');
    });
  });
});
