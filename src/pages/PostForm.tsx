import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ErrorMessage } from '../components/auth';
import { Button, ExitConfirmModal, DraftsList, Spinner } from '../components';
import PostFormFields from '../components/board/PostFormFields';
import ImageUploadSection from '../components/board/ImageUploadSection';
import { useDraftManager } from '../hooks/useDraftManager';
import { useImageUpload } from '../hooks/useImageUpload';
import { usePostFormData } from '../hooks/usePostFormData';
import { useFormNavigation } from '../hooks/useFormNavigation';
import type { PostCategory } from '../types/post';

interface PostFormData {
  title: string;
  content: string;
  category: PostCategory;
}

// 보안 상수
const MAX_TITLE_LENGTH = 30;
const MAX_CONTENT_LENGTH = 5000;

export default function PostForm() {
  const { id } = useParams();
  const isEditMode = !!id;
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PostFormData>({
    mode: 'onChange',
    defaultValues: {
      category: 'FREE',
    },
  });

  const title = watch('title', '');
  const content = watch('content', '');
  const category = watch('category', 'FREE');

  // Image upload hook
  const imageUpload = useImageUpload();

  // Post form data hook (fetch & submit)
  const postFormData = usePostFormData({
    isEditMode,
    id,
    setValue,
    setPreview: imageUpload.setPreview,
    selectedFile: imageUpload.selectedFile,
    setIsSubmitted,
    maxTitleLength: MAX_TITLE_LENGTH,
    maxContentLength: MAX_CONTENT_LENGTH,
  });

  // Draft manager hook
  const draftManager = useDraftManager({
    isEditMode,
    title,
    content,
    category,
    maxTitleLength: MAX_TITLE_LENGTH,
    maxContentLength: MAX_CONTENT_LENGTH,
    setValue,
  });

  // Form navigation hook
  const formNavigation = useFormNavigation({
    isEditMode,
    title,
    content,
    category,
    selectedFile: imageUpload.selectedFile,
    preview: imageUpload.preview,
    initialData: postFormData.initialData,
    saveDraft: draftManager.saveDraft,
    canSaveDraft: draftManager.canSaveDraft,
    isSubmitted,
    setIsSubmitted,
  });

  // 제목과 내용이 모두 있어야 활성화
  const isFormValid = title.trim().length >= 2 && content.trim().length >= 5;

  const onSubmit = async (data: PostFormData) => {
    await postFormData.onSubmit(data);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 본문 */}
      <div className="max-w-4xl mx-auto px-3 xs:px-4 py-4 xs:py-6 sm:py-8">
        {/* 초기 데이터 로딩 중 (수정 모드) */}
        {postFormData.initialDataLoading && (
          <div className="flex flex-col items-center justify-center py-12 xs:py-16 sm:py-20">
            <Spinner size="lg" />
            <p className="text-gray-500 mt-4 xs:mt-6 text-sm xs:text-base">게시글 정보를 불러오는 중...</p>
          </div>
        )}

        {!postFormData.initialDataLoading && (
          <>
            {/* 임시 저장된 글 목록 (작성 모드에서만) */}
            {!isEditMode && (
              <DraftsList
                drafts={draftManager.drafts}
                isExpanded={draftManager.isDraftsExpanded}
                onToggle={() => draftManager.setIsDraftsExpanded(!draftManager.isDraftsExpanded)}
                onLoadDraft={draftManager.handleLoadDraft}
                onDeleteDraft={draftManager.handleDeleteDraft}
              />
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 xs:space-y-6 bg-white p-4 xs:p-6 sm:p-8 rounded-lg shadow">
              {/* 폼 필드들 (카테고리, 제목, 내용) */}
              <PostFormFields
                register={register}
                errors={errors}
                categories={postFormData.categories}
                categoriesLoading={postFormData.categoriesLoading}
                title={title}
                content={content}
                maxTitleLength={MAX_TITLE_LENGTH}
                maxContentLength={MAX_CONTENT_LENGTH}
                isEditMode={isEditMode}
                canSaveDraft={draftManager.canSaveDraft}
                getSaveDisabledReason={draftManager.getSaveDisabledReason}
                handleManualSave={draftManager.handleManualSave}
              />

              {/* 이미지 첨부 */}
              <ImageUploadSection
                preview={imageUpload.preview}
                selectedFile={imageUpload.selectedFile}
                fileError={imageUpload.fileError}
                isDragging={imageUpload.isDragging}
                fileInputRef={imageUpload.fileInputRef}
                handleFileChange={imageUpload.handleFileChange}
                handleDragEnter={imageUpload.handleDragEnter}
                handleDragLeave={imageUpload.handleDragLeave}
                handleDragOver={imageUpload.handleDragOver}
                handleDrop={imageUpload.handleDrop}
                handleUploadClick={imageUpload.handleUploadClick}
                handleRemoveImage={imageUpload.handleRemoveImage}
              />

              {/* 에러 메시지 */}
              <ErrorMessage message={postFormData.apiError} />

              {/* 버튼 */}
              <div className="flex gap-2 xs:gap-3 sm:gap-4">
                <Button
                  type="button"
                  onClick={formNavigation.handleNavigateBack}
                  variant="secondary"
                  size="lg"
                  fullWidth
                  className="text-sm xs:text-base"
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  disabled={!isFormValid || isSubmitting || (isEditMode && !formNavigation.hasUnsavedChanges)}
                  variant="primary"
                  size="lg"
                  fullWidth
                  className="text-sm xs:text-base"
                >
                  {isSubmitting
                    ? isEditMode
                      ? '수정 중...'
                      : '작성 중...'
                    : isEditMode
                      ? '수정하기'
                      : '작성하기'}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>

      {/* 나가기 확인 모달 */}
      <ExitConfirmModal
        isOpen={formNavigation.showExitModal}
        onSaveAndExit={formNavigation.handleSaveAndExit}
        onExitWithoutSaving={formNavigation.handleExitWithoutSaving}
        onCancel={formNavigation.handleCancelExit}
        canSave={formNavigation.canSaveOnExit}
        saveDisabledReason={!isEditMode ? draftManager.getSaveDisabledReason() : undefined}
        isEditMode={isEditMode}
      />
    </div>
  );
}
