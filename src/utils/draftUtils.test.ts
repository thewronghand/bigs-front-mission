import { describe, it, expect } from 'vitest';
import {
  cleanExpiredDrafts,
  isDuplicateDraft,
  limitDraftsCount,
  MAX_DRAFTS_COUNT,
  DRAFT_EXPIRY_DAYS,
  type PostDraft,
} from './draftUtils';

describe('draftUtils', () => {
  describe('cleanExpiredDrafts', () => {
    it('만료되지 않은 drafts는 유지한다', () => {
      const now = Date.now();
      const drafts: PostDraft[] = [
        {
          title: 'Recent 1',
          content: 'Content 1',
          category: 'NOTICE',
          timestamp: now - 1000, // 1초 전
        },
        {
          title: 'Recent 2',
          content: 'Content 2',
          category: 'FREE',
          timestamp: now - 24 * 60 * 60 * 1000, // 1일 전
        },
        {
          title: 'Recent 3',
          content: 'Content 3',
          category: 'NOTICE',
          timestamp: now - 6 * 24 * 60 * 60 * 1000, // 6일 전
        },
      ];

      const result = cleanExpiredDrafts(drafts);

      expect(result).toHaveLength(3);
    });

    it('만료된 drafts는 제거한다', () => {
      const now = Date.now();
      const expiryTime = DRAFT_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
      const drafts: PostDraft[] = [
        {
          title: 'Valid',
          content: 'Valid content',
          category: 'NOTICE',
          timestamp: now - 1000, // 1초 전
        },
        {
          title: 'Expired',
          content: 'Expired content',
          category: 'FREE',
          timestamp: now - expiryTime - 1000, // 7일 + 1초 전 (만료)
        },
      ];

      const result = cleanExpiredDrafts(drafts);

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Valid');
    });

    it('빈 배열을 처리할 수 있다', () => {
      const result = cleanExpiredDrafts([]);

      expect(result).toHaveLength(0);
    });

    it('정확히 7일 전 drafts는 유지한다', () => {
      const now = Date.now();
      const expiryTime = DRAFT_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
      const drafts: PostDraft[] = [
        {
          title: 'Exactly 7 days',
          content: 'Content',
          category: 'NOTICE',
          timestamp: now - expiryTime + 1000, // 7일 - 1초 전 (유효)
        },
      ];

      const result = cleanExpiredDrafts(drafts);

      expect(result).toHaveLength(1);
    });
  });

  describe('isDuplicateDraft', () => {
    const existingDrafts: PostDraft[] = [
      {
        title: 'Existing Title',
        content: 'Existing Content',
        category: 'NOTICE',
        timestamp: Date.now(),
      },
      {
        title: '  Title with spaces  ',
        content: '  Content with spaces  ',
        category: 'FREE',
        timestamp: Date.now(),
      },
    ];

    it('완전히 일치하는 draft를 중복으로 감지한다', () => {
      const newDraft: PostDraft = {
        title: 'Existing Title',
        content: 'Existing Content',
        category: 'NOTICE',
        timestamp: Date.now(),
      };

      expect(isDuplicateDraft(existingDrafts, newDraft)).toBe(true);
    });

    it('공백이 다른 경우에도 trim 후 일치하면 중복으로 감지한다', () => {
      const newDraft: PostDraft = {
        title: 'Title with spaces',
        content: 'Content with spaces',
        category: 'FREE',
        timestamp: Date.now(),
      };

      expect(isDuplicateDraft(existingDrafts, newDraft)).toBe(true);
    });

    it('제목이 다르면 중복이 아니다', () => {
      const newDraft: PostDraft = {
        title: 'Different Title',
        content: 'Existing Content',
        category: 'NOTICE',
        timestamp: Date.now(),
      };

      expect(isDuplicateDraft(existingDrafts, newDraft)).toBe(false);
    });

    it('내용이 다르면 중복이 아니다', () => {
      const newDraft: PostDraft = {
        title: 'Existing Title',
        content: 'Different Content',
        category: 'NOTICE',
        timestamp: Date.now(),
      };

      expect(isDuplicateDraft(existingDrafts, newDraft)).toBe(false);
    });

    it('카테고리가 다르면 중복이 아니다', () => {
      const newDraft: PostDraft = {
        title: 'Existing Title',
        content: 'Existing Content',
        category: 'FREE',
        timestamp: Date.now(),
      };

      expect(isDuplicateDraft(existingDrafts, newDraft)).toBe(false);
    });

    it('빈 배열에서는 항상 false를 반환한다', () => {
      const newDraft: PostDraft = {
        title: 'Any Title',
        content: 'Any Content',
        category: 'NOTICE',
        timestamp: Date.now(),
      };

      expect(isDuplicateDraft([], newDraft)).toBe(false);
    });
  });

  describe('limitDraftsCount', () => {
    it('drafts 개수가 MAX_DRAFTS_COUNT 이하면 모두 반환한다', () => {
      const drafts: PostDraft[] = Array.from({ length: 5 }, (_, i) => ({
        title: `Draft ${i}`,
        content: `Content ${i}`,
        category: 'NOTICE',
        timestamp: Date.now() - i * 1000,
      }));

      const result = limitDraftsCount(drafts);

      expect(result).toHaveLength(5);
    });

    it('drafts 개수가 MAX_DRAFTS_COUNT를 초과하면 최신 10개만 반환한다', () => {
      const now = Date.now();
      const drafts: PostDraft[] = Array.from({ length: 15 }, (_, i) => ({
        title: `Draft ${i}`,
        content: `Content ${i}`,
        category: 'NOTICE',
        timestamp: now - i * 1000, // 0이 가장 최신
      }));

      const result = limitDraftsCount(drafts);

      expect(result).toHaveLength(MAX_DRAFTS_COUNT);
    });

    it('timestamp 기준 내림차순(최신순)으로 정렬한다', () => {
      const now = Date.now();
      const drafts: PostDraft[] = Array.from({ length: 15 }, (_, i) => ({
        title: `Draft ${i}`,
        content: `Content ${i}`,
        category: 'NOTICE',
        timestamp: now - i * 1000, // 0이 가장 최신
      }));

      const result = limitDraftsCount(drafts);

      expect(result[0].title).toBe('Draft 0'); // 가장 최신
      expect(result[9].title).toBe('Draft 9'); // 10번째 최신
    });

    it('빈 배열을 처리할 수 있다', () => {
      const result = limitDraftsCount([]);

      expect(result).toHaveLength(0);
    });

    it('정확히 MAX_DRAFTS_COUNT 개의 drafts는 모두 반환한다', () => {
      const drafts: PostDraft[] = Array.from({ length: MAX_DRAFTS_COUNT }, (_, i) => ({
        title: `Draft ${i}`,
        content: `Content ${i}`,
        category: 'NOTICE',
        timestamp: Date.now() - i * 1000,
      }));

      const result = limitDraftsCount(drafts);

      expect(result).toHaveLength(MAX_DRAFTS_COUNT);
    });

    it('무작위 순서로 입력된 drafts를 정확히 정렬한다', () => {
      const now = Date.now();
      // 10개 초과로 만들어서 정렬이 실행되도록 함
      const drafts: PostDraft[] = [
        { title: 'Draft 5', content: 'Content', category: 'NOTICE', timestamp: now - 5000 },
        { title: 'Draft 0', content: 'Content', category: 'NOTICE', timestamp: now }, // 가장 최신
        { title: 'Draft 2', content: 'Content', category: 'NOTICE', timestamp: now - 2000 },
        { title: 'Draft 10', content: 'Content', category: 'NOTICE', timestamp: now - 10000 },
        { title: 'Draft 7', content: 'Content', category: 'NOTICE', timestamp: now - 7000 },
        { title: 'Draft 3', content: 'Content', category: 'NOTICE', timestamp: now - 3000 },
        { title: 'Draft 11', content: 'Content', category: 'NOTICE', timestamp: now - 11000 },
        { title: 'Draft 1', content: 'Content', category: 'NOTICE', timestamp: now - 1000 },
        { title: 'Draft 8', content: 'Content', category: 'NOTICE', timestamp: now - 8000 },
        { title: 'Draft 4', content: 'Content', category: 'NOTICE', timestamp: now - 4000 },
        { title: 'Draft 6', content: 'Content', category: 'NOTICE', timestamp: now - 6000 },
        { title: 'Draft 9', content: 'Content', category: 'NOTICE', timestamp: now - 9000 },
      ];

      const result = limitDraftsCount(drafts);

      // 10개로 제한되고, timestamp 기준 내림차순 정렬
      expect(result).toHaveLength(10);
      expect(result[0].title).toBe('Draft 0'); // 가장 최신
      expect(result[9].title).toBe('Draft 9'); // 10번째 최신
    });
  });
});
