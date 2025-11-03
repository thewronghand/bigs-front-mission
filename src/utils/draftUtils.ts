import type { PostCategory } from '../types/post';

export interface PostDraft {
  title: string;
  content: string;
  category: PostCategory;
  timestamp: number;
}

// 임시 저장 관리 상수
export const MAX_DRAFTS_COUNT = 10; // 최대 임시저장 개수
export const DRAFT_EXPIRY_DAYS = 7; // 임시저장 만료 기간 (일)

// 임시 저장 관리 유틸리티
export const cleanExpiredDrafts = (drafts: PostDraft[]): PostDraft[] => {
  const now = Date.now();
  const expiryTime = DRAFT_EXPIRY_DAYS * 24 * 60 * 60 * 1000; // 7일을 밀리초로
  return drafts.filter((draft) => now - draft.timestamp < expiryTime);
};

export const isDuplicateDraft = (drafts: PostDraft[], newDraft: PostDraft): boolean => {
  return drafts.some(
    (draft) =>
      draft.title.trim() === newDraft.title.trim() &&
      draft.content.trim() === newDraft.content.trim() &&
      draft.category === newDraft.category
  );
};

export const limitDraftsCount = (drafts: PostDraft[]): PostDraft[] => {
  if (drafts.length <= MAX_DRAFTS_COUNT) return drafts;
  // timestamp 기준 내림차순 정렬 후 최신 MAX_DRAFTS_COUNT개만 유지
  return drafts.sort((a, b) => b.timestamp - a.timestamp).slice(0, MAX_DRAFTS_COUNT);
};
