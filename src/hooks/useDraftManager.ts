import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import type { UseFormSetValue } from 'react-hook-form';
import type { PostCategory, PostFormData } from '../types/post';
import type { PostDraft } from '../utils/draftUtils';
import {
  cleanExpiredDrafts,
  isDuplicateDraft,
  limitDraftsCount,
} from '../utils/draftUtils';

interface UseDraftManagerProps {
  isEditMode: boolean;
  title: string;
  content: string;
  category: PostCategory;
  maxTitleLength: number;
  maxContentLength: number;
  setValue: UseFormSetValue<PostFormData>;
}

export const useDraftManager = ({
  isEditMode,
  title,
  content,
  category,
  maxTitleLength,
  maxContentLength,
  setValue,
}: UseDraftManagerProps) => {
  const [drafts, setDrafts] = useState<PostDraft[]>([]);
  const [isDraftsExpanded, setIsDraftsExpanded] = useState(false);

  // 페이지 로드 시 임시 저장 목록 불러오기 및 정리 (작성 모드에서만)
  useEffect(() => {
    if (isEditMode) return; // 수정 모드에서는 임시저장 사용 안 함

    const savedDrafts = localStorage.getItem('board-drafts');
    if (savedDrafts) {
      let drafts = JSON.parse(savedDrafts);
      // 만료된 임시저장 제거
      drafts = cleanExpiredDrafts(drafts);
      // 개수 제한 적용
      drafts = limitDraftsCount(drafts);
      // 정리된 목록 저장
      localStorage.setItem('board-drafts', JSON.stringify(drafts));
      setDrafts(drafts);
    }
  }, [isEditMode]);

  // 임시 저장 버튼 활성화 조건
  const canSaveDraft = (() => {
    // 기본 조건
    if (title.trim().length < 2 || content.trim().length < 5) return false;
    if (title.length > maxTitleLength || content.length > maxContentLength) return false;

    // 중복 체크
    const currentDraft: PostDraft = {
      title,
      content,
      category,
      timestamp: Date.now(),
    };
    if (isDuplicateDraft(drafts, currentDraft)) return false;

    return true;
  })();

  // 임시저장 불가 이유 메시지
  const getSaveDisabledReason = (): string => {
    if (title.trim().length < 2) return '제목은 2자 이상이어야 합니다';
    if (content.trim().length < 5) return '내용은 5자 이상이어야 합니다';
    if (title.length > maxTitleLength) return `제목은 ${maxTitleLength}자 이하여야 합니다`;
    if (content.length > maxContentLength) return `내용은 ${maxContentLength}자 이하여야 합니다`;

    // 중복 체크
    const currentDraft: PostDraft = {
      title,
      content,
      category,
      timestamp: Date.now(),
    };
    if (isDuplicateDraft(drafts, currentDraft)) return '이미 동일한 내용의 임시저장이 있습니다';

    return '';
  };

  // 임시 저장 함수
  const saveDraft = (): boolean => {
    const newDraft: PostDraft = {
      title,
      content,
      category,
      timestamp: Date.now(),
    };

    let savedDrafts = JSON.parse(localStorage.getItem('board-drafts') || '[]');

    // 1. 중복 체크
    if (isDuplicateDraft(savedDrafts, newDraft)) {
      toast.error('이미 동일한 내용의 임시저장이 있습니다.');
      return false;
    }

    // 2. 새 draft 추가
    savedDrafts.push(newDraft);

    // 3. 만료된 임시저장 제거
    savedDrafts = cleanExpiredDrafts(savedDrafts);

    // 4. 개수 제한 (최신순으로 정렬 후 10개만 유지)
    savedDrafts = limitDraftsCount(savedDrafts);

    localStorage.setItem('board-drafts', JSON.stringify(savedDrafts));
    setDrafts(savedDrafts);
    return true;
  };

  const handleManualSave = () => {
    const saved = saveDraft();
    if (saved) {
      toast.success('임시 저장되었습니다!');
    }
  };

  // 임시 저장된 글 불러오기
  const handleLoadDraft = (draft: PostDraft) => {
    setValue('title', draft.title);
    setValue('content', draft.content);
    setValue('category', draft.category);
    toast.success('임시 저장된 내용을 불러왔습니다');
  };

  // 임시 저장된 글 삭제
  const handleDeleteDraft = (timestamp: number) => {
    const updatedDrafts = drafts.filter((d) => d.timestamp !== timestamp);
    setDrafts(updatedDrafts);
    localStorage.setItem('board-drafts', JSON.stringify(updatedDrafts));
  };

  return {
    drafts,
    isDraftsExpanded,
    setIsDraftsExpanded,
    canSaveDraft,
    getSaveDisabledReason,
    saveDraft,
    handleManualSave,
    handleLoadDraft,
    handleDeleteDraft,
  };
};
