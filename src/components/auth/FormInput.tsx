import type { UseFormRegisterReturn } from 'react-hook-form';

interface FormInputProps {
  label: string;
  id: string;
  type: string;
  placeholder: string;
  error?: string;
  registration: UseFormRegisterReturn;
}

export default function FormInput({
  label,
  id,
  type,
  placeholder,
  error,
  registration,
}: FormInputProps) {
  // 비밀번호 필드에서 한글/한자 등 비ASCII 문자 제거
  const handlePasswordInput = (e: React.FormEvent<HTMLInputElement>) => {
    if (type === 'password') {
      const input = e.currentTarget;
      const cursorPosition = input.selectionStart;
      // 영문, 숫자, 특수문자만 허용 (ASCII 범위: 33-126)
      const filtered = input.value.replace(/[^\x21-\x7E]/g, '');

      if (input.value !== filtered) {
        input.value = filtered;
        // 커서 위치 복원
        if (cursorPosition !== null) {
          input.setSelectionRange(cursorPosition - 1, cursorPosition - 1);
        }
        // react-hook-form에 변경사항 반영
        const event = new Event('input', { bubbles: true });
        input.dispatchEvent(event);
      }
    }
  };

  // 한글 조합 시작 차단
  const handleCompositionStart = (e: React.CompositionEvent<HTMLInputElement>) => {
    if (type === 'password') {
      e.preventDefault();
    }
  };

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        id={id}
        {...registration}
        onInput={handlePasswordInput}
        onCompositionStart={handleCompositionStart}
        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:ring-blue-500'
        }`}
        placeholder={placeholder}
      />
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          error ? 'max-h-10 opacity-100 mt-1' : 'max-h-0 opacity-0 mt-0'
        }`}
      >
        <p className="text-sm text-red-500">{error}</p>
      </div>
    </div>
  );
}
