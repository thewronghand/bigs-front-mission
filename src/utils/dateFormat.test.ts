import { describe, it, expect } from 'vitest';
import { formatDate } from './dateFormat';

describe('formatDate', () => {
  it('ISO 날짜 문자열을 한국 로케일로 포맷팅한다', () => {
    const isoDate = '2024-11-13T10:46:29.278927';
    const result = formatDate(isoDate);

    // 한국 로케일 포맷 확인 (브라우저/환경마다 다를 수 있음)
    expect(result).toContain('2024');
    expect(result).toContain('11');
    expect(result).toContain('13');
  });

  it('다양한 날짜 형식을 처리한다', () => {
    const date1 = '2024-01-01T00:00:00';
    const date2 = '2024-12-31T23:59:59';

    const result1 = formatDate(date1);
    const result2 = formatDate(date2);

    expect(result1).toContain('2024');
    expect(result1).toContain('1');
    expect(result2).toContain('2024');
    expect(result2).toContain('12');
    expect(result2).toContain('31');
  });

  it('유효하지 않은 날짜 문자열은 "Invalid Date"를 포함한다', () => {
    const invalidDate = 'not-a-date';
    const result = formatDate(invalidDate);

    expect(result).toContain('Invalid Date');
  });

  it('빈 문자열은 "Invalid Date"를 포함한다', () => {
    const result = formatDate('');

    expect(result).toContain('Invalid Date');
  });
});
