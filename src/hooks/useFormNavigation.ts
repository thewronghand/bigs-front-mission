import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNavigationBlocker } from '../contexts/NavigationBlockerContext';

interface UseFormNavigationProps {
  isEditMode: boolean;
  title: string;
  content: string;
  category: string;
  selectedFile: File | null;
  preview: string;
  initialData: {
    title: string;
    content: string;
    category: string;
    imageUrl: string;
  } | null;
  saveDraft: () => boolean;
  canSaveDraft: boolean;
  isSubmitted: boolean;
  setIsSubmitted: (submitted: boolean) => void;
}

export const useFormNavigation = ({
  isEditMode,
  title,
  content,
  category,
  selectedFile,
  preview,
  initialData,
  saveDraft,
  canSaveDraft,
  isSubmitted,
  setIsSubmitted,
}: UseFormNavigationProps) => {
  const navigate = useNavigate();
  const { registerBlocker, unregisterBlocker } = useNavigationBlocker();
  const [showExitModal, setShowExitModal] = useState(false);

  // 작성 중인 내용이 있는지 확인
  const hasUnsavedChanges = (() => {
    // 작성 모드: 입력값이 있는지만 확인
    if (!isEditMode || !initialData) {
      return title.trim().length > 0 || content.trim().length > 0 || selectedFile !== null;
    }

    // 수정 모드: 초기 데이터와 비교
    const titleChanged = title !== initialData.title;
    const contentChanged = content !== initialData.content;
    const categoryChanged = category !== initialData.category;

    // 이미지 변경 감지
    const imageChanged = (() => {
      // 새 이미지 선택한 경우
      if (selectedFile) return true;
      // 기존 이미지 삭제한 경우
      if (initialData.imageUrl && !preview) return true;
      return false;
    })();

    return titleChanged || contentChanged || categoryChanged || imageChanged;
  })();

  // 페이지 벗어날 때 브라우저 경고 (새로고침, 탭 닫기 등)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !isSubmitted) {
        e.preventDefault();
        e.returnValue = ''; // Chrome에서 필요
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, isSubmitted]);

  // 브라우저 뒤로가기 감지
  useEffect(() => {
    if (!hasUnsavedChanges || isSubmitted) return;

    // history에 임시 상태 추가
    window.history.pushState(null, '', window.location.pathname);

    const handlePopState = () => {
      if (hasUnsavedChanges && !isSubmitted) {
        // 뒤로가기를 막고 다시 현재 위치로
        window.history.pushState(null, '', window.location.pathname);
        setShowExitModal(true);
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasUnsavedChanges, isSubmitted]);

  // Context를 통한 navigation blocker 등록
  useEffect(() => {
    const blocker = () => {
      if (hasUnsavedChanges && !isSubmitted) {
        setShowExitModal(true);
        return true; // block navigation
      }
      return false; // allow navigation
    };

    registerBlocker(blocker);

    return () => {
      unregisterBlocker();
    };
  }, [hasUnsavedChanges, isSubmitted, registerBlocker, unregisterBlocker]);

  const handleNavigateBack = () => {
    if (hasUnsavedChanges && !isSubmitted) {
      setShowExitModal(true);
      return;
    }

    navigate('/boards');
  };

  const handleExitWithoutSaving = () => {
    setShowExitModal(false);
    // blocker 무시하고 강제로 navigation
    setIsSubmitted(true); // blocker가 더 이상 동작하지 않도록
    navigate('/boards');
  };

  const handleSaveAndExit = () => {
    const saved = saveDraft();
    if (saved) {
      setShowExitModal(false);
      // blocker 무시하고 강제로 navigation
      setIsSubmitted(true); // blocker가 더 이상 동작하지 않도록
      navigate('/boards');
    }
    // 저장 실패 시 모달은 유지 (saveDraft 내부에서 alert 표시)
  };

  const handleCancelExit = () => {
    setShowExitModal(false);
    // 모달만 닫고 navigation은 취소됨 (blocker가 이미 막았음)
  };

  return {
    showExitModal,
    hasUnsavedChanges,
    handleNavigateBack,
    handleExitWithoutSaving,
    handleSaveAndExit: !isEditMode ? handleSaveAndExit : undefined,
    handleCancelExit,
    canSaveOnExit: !isEditMode ? canSaveDraft : undefined,
  };
};
