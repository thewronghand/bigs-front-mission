import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDraftManager } from './useDraftManager';
import type { PostDraft } from '../utils/draftUtils';
import toast from 'react-hot-toast';

// Mock toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useDraftManager', () => {
  // Mock setValue function
  const mockSetValue = vi.fn();

  // Default props
  const defaultProps = {
    isEditMode: false,
    title: 'Test Title',
    content: 'Test Content',
    category: 'NOTICE' as const,
    maxTitleLength: 100,
    maxContentLength: 1000,
    setValue: mockSetValue,
  };

  beforeEach(() => {
    // localStorage 초기화
    localStorage.clear();
    // Mock 함수 초기화
    vi.clearAllMocks();
  });

  describe('초기화 및 draft 로딩', () => {
    it('작성 모드에서 localStorage의 drafts를 로드한다', () => {
      const savedDrafts: PostDraft[] = [
        {
          title: 'Draft 1',
          content: 'Draft content 1',
          category: 'NOTICE',
          timestamp: Date.now(),
        },
      ];
      localStorage.setItem('board-drafts', JSON.stringify(savedDrafts));

      const { result } = renderHook(() => useDraftManager(defaultProps));

      expect(result.current.drafts).toHaveLength(1);
      expect(result.current.drafts[0].title).toBe('Draft 1');
    });

    it('수정 모드에서는 drafts를 로드하지 않는다', () => {
      const savedDrafts: PostDraft[] = [
        {
          title: 'Draft 1',
          content: 'Draft content 1',
          category: 'NOTICE',
          timestamp: Date.now(),
        },
      ];
      localStorage.setItem('board-drafts', JSON.stringify(savedDrafts));

      const { result } = renderHook(() =>
        useDraftManager({ ...defaultProps, isEditMode: true })
      );

      expect(result.current.drafts).toHaveLength(0);
    });

    it('만료된 drafts는 자동으로 제거된다', () => {
      const now = Date.now();
      const expiredDraft: PostDraft = {
        title: 'Expired',
        content: 'Expired content',
        category: 'NOTICE',
        timestamp: now - 8 * 24 * 60 * 60 * 1000, // 8일 전
      };
      const validDraft: PostDraft = {
        title: 'Valid',
        content: 'Valid content',
        category: 'NOTICE',
        timestamp: now,
      };
      localStorage.setItem('board-drafts', JSON.stringify([expiredDraft, validDraft]));

      const { result } = renderHook(() => useDraftManager(defaultProps));

      expect(result.current.drafts).toHaveLength(1);
      expect(result.current.drafts[0].title).toBe('Valid');
    });

    it('drafts가 10개를 초과하면 최신 10개만 유지된다', () => {
      const now = Date.now();
      const drafts: PostDraft[] = Array.from({ length: 15 }, (_, i) => ({
        title: `Draft ${i}`,
        content: `Content ${i}`,
        category: 'NOTICE',
        timestamp: now - i * 1000, // 최신순
      }));
      localStorage.setItem('board-drafts', JSON.stringify(drafts));

      const { result } = renderHook(() => useDraftManager(defaultProps));

      expect(result.current.drafts).toHaveLength(10);
      expect(result.current.drafts[0].title).toBe('Draft 0'); // 최신 draft
    });
  });

  describe('canSaveDraft 유효성 검증', () => {
    it('제목이 2자 미만이면 false를 반환한다', () => {
      const { result } = renderHook(() =>
        useDraftManager({ ...defaultProps, title: 'A' })
      );

      expect(result.current.canSaveDraft).toBe(false);
    });

    it('내용이 5자 미만이면 false를 반환한다', () => {
      const { result } = renderHook(() =>
        useDraftManager({ ...defaultProps, content: '1234' })
      );

      expect(result.current.canSaveDraft).toBe(false);
    });

    it('제목이 maxTitleLength를 초과하면 false를 반환한다', () => {
      const { result } = renderHook(() =>
        useDraftManager({ ...defaultProps, title: 'A'.repeat(101), maxTitleLength: 100 })
      );

      expect(result.current.canSaveDraft).toBe(false);
    });

    it('내용이 maxContentLength를 초과하면 false를 반환한다', () => {
      const { result } = renderHook(() =>
        useDraftManager({
          ...defaultProps,
          content: 'A'.repeat(1001),
          maxContentLength: 1000,
        })
      );

      expect(result.current.canSaveDraft).toBe(false);
    });

    it('중복된 draft가 있으면 false를 반환한다', () => {
      const existingDraft: PostDraft = {
        title: 'Test Title',
        content: 'Test Content',
        category: 'NOTICE',
        timestamp: Date.now(),
      };
      localStorage.setItem('board-drafts', JSON.stringify([existingDraft]));

      const { result } = renderHook(() => useDraftManager(defaultProps));

      expect(result.current.canSaveDraft).toBe(false);
    });

    it('모든 조건을 만족하면 true를 반환한다', () => {
      const { result } = renderHook(() =>
        useDraftManager({
          ...defaultProps,
          title: 'Valid Title',
          content: 'Valid Content',
        })
      );

      expect(result.current.canSaveDraft).toBe(true);
    });
  });

  describe('getSaveDisabledReason', () => {
    it('제목이 2자 미만일 때 적절한 메시지를 반환한다', () => {
      const { result } = renderHook(() =>
        useDraftManager({ ...defaultProps, title: 'A' })
      );

      expect(result.current.getSaveDisabledReason()).toBe('제목은 2자 이상이어야 합니다');
    });

    it('내용이 5자 미만일 때 적절한 메시지를 반환한다', () => {
      const { result } = renderHook(() =>
        useDraftManager({ ...defaultProps, content: '1234' })
      );

      expect(result.current.getSaveDisabledReason()).toBe('내용은 5자 이상이어야 합니다');
    });

    it('제목이 maxTitleLength를 초과할 때 적절한 메시지를 반환한다', () => {
      const { result } = renderHook(() =>
        useDraftManager({ ...defaultProps, title: 'A'.repeat(101), maxTitleLength: 100 })
      );

      expect(result.current.getSaveDisabledReason()).toBe('제목은 100자 이하여야 합니다');
    });

    it('내용이 maxContentLength를 초과할 때 적절한 메시지를 반환한다', () => {
      const { result } = renderHook(() =>
        useDraftManager({
          ...defaultProps,
          content: 'A'.repeat(1001),
          maxContentLength: 1000,
        })
      );

      expect(result.current.getSaveDisabledReason()).toBe('내용은 1000자 이하여야 합니다');
    });

    it('중복된 draft가 있을 때 적절한 메시지를 반환한다', () => {
      const existingDraft: PostDraft = {
        title: 'Test Title',
        content: 'Test Content',
        category: 'NOTICE',
        timestamp: Date.now(),
      };
      localStorage.setItem('board-drafts', JSON.stringify([existingDraft]));

      const { result } = renderHook(() => useDraftManager(defaultProps));

      expect(result.current.getSaveDisabledReason()).toBe(
        '이미 동일한 내용의 임시저장이 있습니다'
      );
    });

    it('모든 조건을 만족하면 빈 문자열을 반환한다', () => {
      const { result } = renderHook(() =>
        useDraftManager({
          ...defaultProps,
          title: 'Valid Title',
          content: 'Valid Content',
        })
      );

      expect(result.current.getSaveDisabledReason()).toBe('');
    });
  });

  describe('saveDraft', () => {
    it('유효한 draft를 localStorage에 저장한다', () => {
      const { result } = renderHook(() =>
        useDraftManager({
          ...defaultProps,
          title: 'New Draft',
          content: 'New Content',
        })
      );

      act(() => {
        result.current.saveDraft();
      });

      const saved = JSON.parse(localStorage.getItem('board-drafts') || '[]');
      expect(saved).toHaveLength(1);
      expect(saved[0].title).toBe('New Draft');
      expect(saved[0].content).toBe('New Content');
    });

    it('draft를 저장하면 drafts state가 업데이트된다', () => {
      const { result } = renderHook(() =>
        useDraftManager({
          ...defaultProps,
          title: 'New Draft',
          content: 'New Content',
        })
      );

      act(() => {
        result.current.saveDraft();
      });

      expect(result.current.drafts).toHaveLength(1);
      expect(result.current.drafts[0].title).toBe('New Draft');
    });

    it('성공적으로 저장되면 true를 반환한다', () => {
      const { result } = renderHook(() =>
        useDraftManager({
          ...defaultProps,
          title: 'New Draft',
          content: 'New Content',
        })
      );

      let saved = false;
      act(() => {
        saved = result.current.saveDraft();
      });

      expect(saved).toBe(true);
    });

    it('중복된 draft는 저장되지 않고 false를 반환한다', () => {
      const existingDraft: PostDraft = {
        title: 'Test Title',
        content: 'Test Content',
        category: 'NOTICE',
        timestamp: Date.now(),
      };
      localStorage.setItem('board-drafts', JSON.stringify([existingDraft]));

      const { result } = renderHook(() => useDraftManager(defaultProps));

      let saved = true;
      act(() => {
        saved = result.current.saveDraft();
      });

      expect(saved).toBe(false);
      expect(toast.error).toHaveBeenCalledWith('이미 동일한 내용의 임시저장이 있습니다.');
    });
  });

  describe('handleManualSave', () => {
    it('draft를 저장하고 성공 toast를 표시한다', () => {
      const { result } = renderHook(() =>
        useDraftManager({
          ...defaultProps,
          title: 'New Draft',
          content: 'New Content',
        })
      );

      act(() => {
        result.current.handleManualSave();
      });

      expect(toast.success).toHaveBeenCalledWith('임시 저장되었습니다!');
    });

    it('중복된 draft는 성공 toast를 표시하지 않는다', () => {
      const existingDraft: PostDraft = {
        title: 'Test Title',
        content: 'Test Content',
        category: 'NOTICE',
        timestamp: Date.now(),
      };
      localStorage.setItem('board-drafts', JSON.stringify([existingDraft]));

      const { result } = renderHook(() => useDraftManager(defaultProps));

      act(() => {
        result.current.handleManualSave();
      });

      expect(toast.success).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith('이미 동일한 내용의 임시저장이 있습니다.');
    });
  });

  describe('handleLoadDraft', () => {
    it('draft를 불러와서 setValue로 폼에 설정한다', () => {
      const { result } = renderHook(() => useDraftManager(defaultProps));

      const draft: PostDraft = {
        title: 'Loaded Title',
        content: 'Loaded Content',
        category: 'FREE',
        timestamp: Date.now(),
      };

      act(() => {
        result.current.handleLoadDraft(draft);
      });

      expect(mockSetValue).toHaveBeenCalledWith('title', 'Loaded Title');
      expect(mockSetValue).toHaveBeenCalledWith('content', 'Loaded Content');
      expect(mockSetValue).toHaveBeenCalledWith('category', 'FREE');
      expect(toast.success).toHaveBeenCalledWith('임시 저장된 내용을 불러왔습니다');
    });
  });

  describe('handleDeleteDraft', () => {
    it('특정 timestamp의 draft를 삭제한다', () => {
      const now = Date.now();
      const draft1: PostDraft = {
        title: 'Draft 1',
        content: 'Content 1',
        category: 'NOTICE',
        timestamp: now - 1000,
      };
      const draft2: PostDraft = {
        title: 'Draft 2',
        content: 'Content 2',
        category: 'FREE',
        timestamp: now,
      };
      localStorage.setItem('board-drafts', JSON.stringify([draft1, draft2]));

      const { result } = renderHook(() => useDraftManager(defaultProps));

      act(() => {
        result.current.handleDeleteDraft(now - 1000);
      });

      expect(result.current.drafts).toHaveLength(1);
      expect(result.current.drafts[0].timestamp).toBe(now);

      const saved = JSON.parse(localStorage.getItem('board-drafts') || '[]');
      expect(saved).toHaveLength(1);
      expect(saved[0].timestamp).toBe(now);
    });
  });

  describe('isDraftsExpanded state', () => {
    it('초기값은 false이다', () => {
      const { result } = renderHook(() => useDraftManager(defaultProps));

      expect(result.current.isDraftsExpanded).toBe(false);
    });

    it('setIsDraftsExpanded로 상태를 변경할 수 있다', () => {
      const { result } = renderHook(() => useDraftManager(defaultProps));

      act(() => {
        result.current.setIsDraftsExpanded(true);
      });

      expect(result.current.isDraftsExpanded).toBe(true);
    });
  });
});
