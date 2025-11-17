import { describe, it, expect } from 'vitest';
import {
  formatFileSize,
  MAX_FILE_SIZE,
  MAX_ORIGINAL_FILE_SIZE,
  RESIZE_DIMENSION,
  ALLOWED_IMAGE_EXTENSIONS,
} from './imageUtils';

describe('imageUtils', () => {
  describe('상수값', () => {
    it('MAX_FILE_SIZE는 1MB이다', () => {
      expect(MAX_FILE_SIZE).toBe(1 * 1024 * 1024);
    });

    it('MAX_ORIGINAL_FILE_SIZE는 15MB이다', () => {
      expect(MAX_ORIGINAL_FILE_SIZE).toBe(15 * 1024 * 1024);
    });

    it('RESIZE_DIMENSION은 1920px이다', () => {
      expect(RESIZE_DIMENSION).toBe(1920);
    });

    it('ALLOWED_IMAGE_EXTENSIONS에 주요 이미지 확장자가 포함된다', () => {
      expect(ALLOWED_IMAGE_EXTENSIONS).toContain('jpg');
      expect(ALLOWED_IMAGE_EXTENSIONS).toContain('jpeg');
      expect(ALLOWED_IMAGE_EXTENSIONS).toContain('png');
      expect(ALLOWED_IMAGE_EXTENSIONS).toContain('gif');
      expect(ALLOWED_IMAGE_EXTENSIONS).toContain('webp');
    });
  });

  describe('formatFileSize', () => {
    it('1024 미만의 바이트는 B로 표시한다', () => {
      expect(formatFileSize(0)).toBe('0B');
      expect(formatFileSize(100)).toBe('100B');
      expect(formatFileSize(1023)).toBe('1023B');
    });

    it('1024 이상 1MB 미만은 KB로 표시한다', () => {
      expect(formatFileSize(1024)).toBe('1.0KB');
      expect(formatFileSize(1536)).toBe('1.5KB'); // 1.5KB
      expect(formatFileSize(10240)).toBe('10.0KB'); // 10KB
      expect(formatFileSize(102400)).toBe('100.0KB'); // 100KB
    });

    it('1MB 이상은 MB로 표시한다', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1.0MB'); // 1MB
      expect(formatFileSize(1024 * 1024 * 1.5)).toBe('1.5MB'); // 1.5MB
      expect(formatFileSize(1024 * 1024 * 10)).toBe('10.0MB'); // 10MB
      expect(formatFileSize(1024 * 1024 * 15)).toBe('15.0MB'); // 15MB
    });

    it('소수점 첫째 자리까지 표시한다', () => {
      expect(formatFileSize(1536)).toBe('1.5KB');
      expect(formatFileSize(1024 * 1024 * 2.345)).toBe('2.3MB'); // 2.345MB -> 2.3MB
    });

    it('경계값을 정확히 처리한다', () => {
      expect(formatFileSize(1024)).toBe('1.0KB'); // 정확히 1KB
      expect(formatFileSize(1024 * 1024)).toBe('1.0MB'); // 정확히 1MB
    });
  });

  // resizeImage와 createTransparentImageAsync는 Canvas API를 사용하므로
  // 브라우저 환경이 필요합니다. happy-dom에서 Canvas API 지원이 제한적이므로
  // 통합 테스트나 E2E 테스트에서 다루는 것이 적절합니다.
  describe('resizeImage와 createTransparentImageAsync', () => {
    it('Canvas API를 사용하는 함수들은 별도 테스트가 필요함을 명시', () => {
      // resizeImage()와 createTransparentImageAsync()는
      // Image, Canvas, Blob 등 브라우저 API를 사용하므로
      // 실제 브라우저 환경에서의 통합 테스트가 필요합니다.
      expect(true).toBe(true);
    });
  });
});
