import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Button } from '../common';
import type { PostFormData } from '../../types/post';

interface PostFormFieldsProps {
  register: UseFormRegister<PostFormData>;
  errors: FieldErrors<PostFormData>;
  categories: Record<string, string> | null;
  categoriesLoading: boolean;
  title: string;
  content: string;
  maxTitleLength: number;
  maxContentLength: number;
  isEditMode: boolean;
  canSaveDraft: boolean;
  getSaveDisabledReason: () => string;
  handleManualSave: () => void;
}

export default function PostFormFields({
  register,
  errors,
  categories,
  categoriesLoading,
  title,
  content,
  maxTitleLength,
  maxContentLength,
  isEditMode,
  canSaveDraft,
  getSaveDisabledReason,
  handleManualSave,
}: PostFormFieldsProps) {
  return (
    <>
      {/* 카테고리 */}
      <div>
        <label
          htmlFor="category"
          className="block text-xs xs:text-sm font-medium text-gray-700 mb-1.5 xs:mb-2"
        >
          카테고리
        </label>
        {categoriesLoading || !categories ? (
          <div className="w-full px-3 xs:px-4 py-2 xs:py-3 border border-gray-300 rounded-lg bg-white flex items-center min-h-10 xs:min-h-[46px]">
            <div className="flex gap-1">
              <span
                className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: '0ms' }}
              ></span>
              <span
                className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: '150ms' }}
              ></span>
              <span
                className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: '300ms' }}
              ></span>
            </div>
          </div>
        ) : (
          <select
            id="category"
            {...register('category', { required: '카테고리를 선택해주세요' })}
            className="w-full px-3 xs:px-4 py-2 xs:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm xs:text-base"
          >
            {Object.entries(categories).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        )}
        {errors.category && (
          <p className="text-sm text-red-500 mt-1">{errors.category.message}</p>
        )}
      </div>

      {/* 제목 */}
      <div>
        <div className="flex justify-between items-center mb-1.5 xs:mb-2">
          <label
            htmlFor="title"
            className="block text-xs xs:text-sm font-medium text-gray-700"
          >
            제목
          </label>
          <span
            className={`text-xs xs:text-sm ${
              title.length > maxTitleLength ? 'text-red-500' : 'text-gray-500'
            }`}
          >
            {title.length}/{maxTitleLength}
          </span>
        </div>
        <input
          type="text"
          id="title"
          {...register('title', {
            required: '제목을 입력해주세요',
            minLength: { value: 2, message: '제목은 2자 이상이어야 합니다' },
            maxLength: {
              value: maxTitleLength,
              message: `제목은 ${maxTitleLength}자 이하여야 합니다`,
            },
          })}
          className="w-full px-3 xs:px-4 py-2 xs:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm xs:text-base"
          placeholder="제목을 입력하세요"
        />
        {errors.title && (
          <p className="text-xs xs:text-sm text-red-500 mt-1">
            {errors.title.message}
          </p>
        )}
      </div>

      {/* 내용 */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700"
            >
              내용
            </label>
            {/* 임시저장 버튼 (작성 모드에서만) */}
            {!isEditMode && (
              <div className="relative group">
                <Button
                  type="button"
                  onClick={handleManualSave}
                  disabled={!canSaveDraft}
                  variant="secondary"
                  size="xs"
                >
                  임시저장
                </Button>
                {!canSaveDraft && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                    <div className="relative bg-gray-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg whitespace-nowrap">
                      {/* 위쪽 화살표 */}
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
                      {/* 메시지 */}
                      <span className="relative z-10">
                        {getSaveDisabledReason()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <span
            className={`text-xs xs:text-sm ${
              content.length > maxContentLength
                ? 'text-red-500'
                : 'text-gray-500'
            }`}
          >
            {content.length}/{maxContentLength}
          </span>
        </div>
        <textarea
          id="content"
          {...register('content', {
            required: '내용을 입력해주세요',
            minLength: { value: 5, message: '내용은 5자 이상이어야 합니다' },
            maxLength: {
              value: maxContentLength,
              message: `내용은 ${maxContentLength}자 이하여야 합니다`,
            },
          })}
          rows={10}
          className="w-full px-3 xs:px-4 py-2 xs:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm xs:text-base"
          placeholder="내용을 입력하세요"
        />
        {errors.content && (
          <p className="text-xs xs:text-sm text-red-500 mt-1">
            {errors.content.message}
          </p>
        )}
      </div>
    </>
  );
}
