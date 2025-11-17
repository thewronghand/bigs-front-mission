import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFormNavigation } from './useFormNavigation';
import type { ReactNode } from 'react';

// Mock dependencies
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('../contexts/NavigationBlockerContext', () => ({
  useNavigationBlocker: () => ({
    registerBlocker: vi.fn(),
    unregisterBlocker: vi.fn(),
  }),
}));

describe('useFormNavigation', () => {
  const mockSaveDraft = vi.fn();
  const mockSetIsSubmitted = vi.fn();

  const defaultProps = {
    isEditMode: false,
    title: '',
    content: '',
    category: 'NOTICE',
    selectedFile: null,
    preview: '',
    initialData: null,
    saveDraft: mockSaveDraft,
    canSaveDraft: false,
    isSubmitted: false,
    setIsSubmitted: mockSetIsSubmitted,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('hasUnsavedChanges 계산 (작성 모드)', () => {
    it('모든 필드가 비어있으면 false', () => {
      const { result } = renderHook(() => useFormNavigation(defaultProps));

      expect(result.current.hasUnsavedChanges).toBe(false);
    });

    it('제목만 입력되면 true', () => {
      const { result } = renderHook(() =>
        useFormNavigation({ ...defaultProps, title: '제목' })
      );

      expect(result.current.hasUnsavedChanges).toBe(true);
    });

    it('내용만 입력되면 true', () => {
      const { result } = renderHook(() =>
        useFormNavigation({ ...defaultProps, content: '내용' })
      );

      expect(result.current.hasUnsavedChanges).toBe(true);
    });

    it('파일만 선택되면 true', () => {
      const mockFile = new File(['content'], 'test.png', { type: 'image/png' });
      const { result } = renderHook(() =>
        useFormNavigation({ ...defaultProps, selectedFile: mockFile })
      );

      expect(result.current.hasUnsavedChanges).toBe(true);
    });

    it('공백만 있으면 false (trim 처리)', () => {
      const { result } = renderHook(() =>
        useFormNavigation({ ...defaultProps, title: '   ', content: '   ' })
      );

      expect(result.current.hasUnsavedChanges).toBe(false);
    });
  });

  describe('hasUnsavedChanges 계산 (수정 모드)', () => {
    const initialData = {
      title: '기존 제목',
      content: '기존 내용',
      category: 'NOTICE',
      imageUrl: '/media/image.png',
    };

    it('변경사항이 없으면 false', () => {
      const { result } = renderHook(() =>
        useFormNavigation({
          ...defaultProps,
          isEditMode: true,
          title: '기존 제목',
          content: '기존 내용',
          category: 'NOTICE',
          preview: '/media/image.png',
          initialData,
        })
      );

      expect(result.current.hasUnsavedChanges).toBe(false);
    });

    it('제목이 변경되면 true', () => {
      const { result } = renderHook(() =>
        useFormNavigation({
          ...defaultProps,
          isEditMode: true,
          title: '새로운 제목',
          content: '기존 내용',
          category: 'NOTICE',
          initialData,
        })
      );

      expect(result.current.hasUnsavedChanges).toBe(true);
    });

    it('내용이 변경되면 true', () => {
      const { result } = renderHook(() =>
        useFormNavigation({
          ...defaultProps,
          isEditMode: true,
          title: '기존 제목',
          content: '새로운 내용',
          category: 'NOTICE',
          initialData,
        })
      );

      expect(result.current.hasUnsavedChanges).toBe(true);
    });

    it('카테고리가 변경되면 true', () => {
      const { result } = renderHook(() =>
        useFormNavigation({
          ...defaultProps,
          isEditMode: true,
          title: '기존 제목',
          content: '기존 내용',
          category: 'FREE',
          initialData,
        })
      );

      expect(result.current.hasUnsavedChanges).toBe(true);
    });

    it('새 이미지를 선택하면 true', () => {
      const mockFile = new File(['content'], 'new.png', { type: 'image/png' });
      const { result } = renderHook(() =>
        useFormNavigation({
          ...defaultProps,
          isEditMode: true,
          title: '기존 제목',
          content: '기존 내용',
          category: 'NOTICE',
          selectedFile: mockFile,
          initialData,
        })
      );

      expect(result.current.hasUnsavedChanges).toBe(true);
    });

    it('기존 이미지를 삭제하면 true', () => {
      const { result } = renderHook(() =>
        useFormNavigation({
          ...defaultProps,
          isEditMode: true,
          title: '기존 제목',
          content: '기존 내용',
          category: 'NOTICE',
          preview: '', // 이미지 삭제됨
          initialData,
        })
      );

      expect(result.current.hasUnsavedChanges).toBe(true);
    });
  });

  describe('모달 상태 관리', () => {
    it('초기 showExitModal은 false', () => {
      const { result } = renderHook(() => useFormNavigation(defaultProps));

      expect(result.current.showExitModal).toBe(false);
    });

    it('handleCancelExit 호출 시 모달을 닫는다', () => {
      const { result } = renderHook(() =>
        useFormNavigation({ ...defaultProps, title: '제목' })
      );

      // 먼저 모달을 열기 위해 handleNavigateBack 호출
      act(() => {
        result.current.handleNavigateBack();
      });

      expect(result.current.showExitModal).toBe(true);

      // 모달 닫기
      act(() => {
        result.current.handleCancelExit();
      });

      expect(result.current.showExitModal).toBe(false);
    });
  });

  describe('네비게이션 핸들러', () => {
    it('변경사항이 없으면 handleNavigateBack이 모달을 표시하지 않는다', () => {
      const { result } = renderHook(() => useFormNavigation(defaultProps));

      act(() => {
        result.current.handleNavigateBack();
      });

      expect(result.current.showExitModal).toBe(false);
    });

    it('변경사항이 있으면 handleNavigateBack이 모달을 표시한다', () => {
      const { result } = renderHook(() =>
        useFormNavigation({ ...defaultProps, title: '제목' })
      );

      act(() => {
        result.current.handleNavigateBack();
      });

      expect(result.current.showExitModal).toBe(true);
    });

    it('제출 완료 후에는 handleNavigateBack이 모달을 표시하지 않는다', () => {
      const { result } = renderHook(() =>
        useFormNavigation({ ...defaultProps, title: '제목', isSubmitted: true })
      );

      act(() => {
        result.current.handleNavigateBack();
      });

      expect(result.current.showExitModal).toBe(false);
    });
  });

  describe('작성 모드 전용 기능', () => {
    it('작성 모드에서는 handleSaveAndExit이 존재한다', () => {
      const { result } = renderHook(() =>
        useFormNavigation({ ...defaultProps, isEditMode: false })
      );

      expect(result.current.handleSaveAndExit).toBeDefined();
    });

    it('수정 모드에서는 handleSaveAndExit이 undefined다', () => {
      const { result } = renderHook(() =>
        useFormNavigation({
          ...defaultProps,
          isEditMode: true,
          initialData: {
            title: '제목',
            content: '내용',
            category: 'NOTICE',
            imageUrl: '',
          },
        })
      );

      expect(result.current.handleSaveAndExit).toBeUndefined();
    });

    it('작성 모드에서는 canSaveOnExit이 존재한다', () => {
      const { result } = renderHook(() =>
        useFormNavigation({ ...defaultProps, isEditMode: false, canSaveDraft: true })
      );

      expect(result.current.canSaveOnExit).toBe(true);
    });

    it('수정 모드에서는 canSaveOnExit이 undefined다', () => {
      const { result } = renderHook(() =>
        useFormNavigation({
          ...defaultProps,
          isEditMode: true,
          initialData: {
            title: '제목',
            content: '내용',
            category: 'NOTICE',
            imageUrl: '',
          },
        })
      );

      expect(result.current.canSaveOnExit).toBeUndefined();
    });
  });

  describe('handleSaveAndExit (작성 모드)', () => {
    it('저장 성공 시 setIsSubmitted를 호출한다', () => {
      mockSaveDraft.mockReturnValue(true);

      const { result } = renderHook(() =>
        useFormNavigation({ ...defaultProps, isEditMode: false, canSaveDraft: true })
      );

      act(() => {
        result.current.handleSaveAndExit?.();
      });

      expect(mockSaveDraft).toHaveBeenCalled();
      expect(mockSetIsSubmitted).toHaveBeenCalledWith(true);
    });

    it('저장 실패 시 모달을 유지한다', () => {
      mockSaveDraft.mockReturnValue(false);

      const { result } = renderHook(() =>
        useFormNavigation({ ...defaultProps, isEditMode: false, title: '제목' })
      );

      // 먼저 모달 열기
      act(() => {
        result.current.handleNavigateBack();
      });

      expect(result.current.showExitModal).toBe(true);

      // 저장 시도 (실패)
      act(() => {
        result.current.handleSaveAndExit?.();
      });

      // 모달은 여전히 열려있음
      expect(mockSaveDraft).toHaveBeenCalled();
      expect(mockSetIsSubmitted).not.toHaveBeenCalled();
    });
  });

  describe('handleExitWithoutSaving', () => {
    it('모달을 닫고 setIsSubmitted를 호출한다', () => {
      const { result } = renderHook(() =>
        useFormNavigation({ ...defaultProps, title: '제목' })
      );

      // 먼저 모달 열기
      act(() => {
        result.current.handleNavigateBack();
      });

      expect(result.current.showExitModal).toBe(true);

      // 저장 없이 나가기
      act(() => {
        result.current.handleExitWithoutSaving();
      });

      expect(result.current.showExitModal).toBe(false);
      expect(mockSetIsSubmitted).toHaveBeenCalledWith(true);
    });
  });
});
