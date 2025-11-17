import { describe, it, expect } from 'vitest';
import {
  isValidEmail,
  isValidPassword,
  getPasswordErrorMessage,
  getPasswordMismatchMessage,
} from './validation';

describe('isValidEmail', () => {
  it('유효한 이메일 형식을 인식한다', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@company.co.kr')).toBe(true);
    expect(isValidEmail('test+tag@domain.com')).toBe(true);
  });

  it('잘못된 이메일 형식을 거부한다', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
    expect(isValidEmail('test@')).toBe(false);
    expect(isValidEmail('test @example.com')).toBe(false);
  });
});

describe('isValidPassword', () => {
  it('유효한 비밀번호를 인식한다', () => {
    // 8자 이상 + 숫자 + 영문 + 특수문자(!%*#?&)
    expect(isValidPassword('Test123!')).toBe(true);
    expect(isValidPassword('Password1#')).toBe(true);
    expect(isValidPassword('Abc12345%')).toBe(true);
  });

  it('8자 미만 비밀번호를 거부한다', () => {
    expect(isValidPassword('Test1!')).toBe(false);
  });

  it('숫자가 없는 비밀번호를 거부한다', () => {
    expect(isValidPassword('TestTest!')).toBe(false);
  });

  it('영문자가 없는 비밀번호를 거부한다', () => {
    expect(isValidPassword('12345678!')).toBe(false);
  });

  it('특수문자가 없는 비밀번호를 거부한다', () => {
    expect(isValidPassword('Test12345')).toBe(false);
  });

  it('허용되지 않은 특수문자를 거부한다', () => {
    expect(isValidPassword('Test1234@')).toBe(false); // @ 는 불허
    expect(isValidPassword('Test1234$')).toBe(false); // $ 는 불허
  });
});

describe('getPasswordErrorMessage', () => {
  it('8자 미만일 때 적절한 메시지를 반환한다', () => {
    const message = getPasswordErrorMessage('Test1!');
    expect(message).toContain('8자 이상');
  });

  it('숫자가 없을 때 적절한 메시지를 반환한다', () => {
    const message = getPasswordErrorMessage('TestTest!');
    expect(message).toContain('숫자');
  });

  it('영문자가 없을 때 적절한 메시지를 반환한다', () => {
    const message = getPasswordErrorMessage('12345678!');
    expect(message).toContain('영문자');
  });

  it('특수문자가 없을 때 적절한 메시지를 반환한다', () => {
    const message = getPasswordErrorMessage('Test12345');
    expect(message).toContain('특수문자');
  });
});

describe('getPasswordMismatchMessage', () => {
  it('비밀번호가 일치하면 true를 반환한다', () => {
    const result = getPasswordMismatchMessage('Test123!', 'Test123!', false);
    expect(result).toBe(true);
  });

  it('비밀번호가 일치하지 않으면 에러 메시지를 반환한다', () => {
    const result = getPasswordMismatchMessage('Test123!', 'Different1!', false);
    expect(typeof result).toBe('string');
    expect(result).toContain('일치');
  });

  it('CapsLock이 켜져있을 때 경고를 포함한다', () => {
    const result = getPasswordMismatchMessage('Test123!', 'Different1!', true);
    expect(typeof result).toBe('string');
    expect(result).toContain('Caps Lock'); // 공백 있음
  });
});
