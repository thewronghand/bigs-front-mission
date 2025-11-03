import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { UseFormSetValue } from 'react-hook-form';
import { createPost, getCategories, getPostDetail, updatePost } from '../api';
import { handlePostFormApiError, API_BASE_URL } from '../utils';
import { MAX_FILE_SIZE, ALLOWED_IMAGE_EXTENSIONS, createTransparentImageAsync } from '../utils/imageUtils';
import type { PostCategory } from '../types/post';

interface PostFormData {
  title: string;
  content: string;
  category: PostCategory;
}

interface UsePostFormDataProps {
  isEditMode: boolean;
  id: string | undefined;
  setValue: UseFormSetValue<PostFormData>;
  setPreview: (preview: string) => void;
  selectedFile: File | null;
  hasDeletedImage: boolean;
  setIsSubmitted: (submitted: boolean) => void;
  maxTitleLength: number;
  maxContentLength: number;
}

export const usePostFormData = ({
  isEditMode,
  id,
  setValue,
  setPreview,
  selectedFile,
  hasDeletedImage,
  setIsSubmitted,
  maxTitleLength,
  maxContentLength,
}: UsePostFormDataProps) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Record<string, string> | null>(null);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [initialData, setInitialData] = useState<{
    title: string;
    content: string;
    category: string;
    imageUrl: string;
  } | null>(null);
  const [initialDataLoading, setInitialDataLoading] = useState(isEditMode);
  const [apiError, setApiError] = useState('');

  // 페이지 로드 시 카테고리 목록 가져오기
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error('카테고리 목록 조회 실패:', error);
        // 실패해도 기본 카테고리는 사용 가능하도록
        setCategories({
          FREE: '자유',
          NOTICE: '공지',
          QNA: 'Q&A',
          ETC: '기타',
        });
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // 수정 모드일 때 기존 데이터 fetch
  useEffect(() => {
    if (!isEditMode || !id) return;

    const fetchPostData = async () => {
      try {
        setInitialDataLoading(true);
        const data = await getPostDetail(Number(id));

        // 폼에 데이터 채우기
        setValue('title', data.title);
        setValue('content', data.content);
        setValue('category', data.boardCategory);

        // 초기 데이터 저장 (변경사항 감지용)
        setInitialData({
          title: data.title,
          content: data.content,
          category: data.boardCategory,
          imageUrl: data.imageUrl || '',
        });

        // 이미지가 있으면 설정 (단, 1x1 투명 이미지는 제외)
        if (data.imageUrl) {
          const img = new Image();
          img.onload = () => {
            // 1x1 투명 이미지 감지 (삭제된 이미지로 간주)
            if (img.naturalWidth === 1 && img.naturalHeight === 1) {
              console.log('[Image Filter] 1x1 투명 이미지 감지, 표시 안 함');
              return;
            }

            // 정상 이미지만 미리보기 표시
            setPreview(`${API_BASE_URL}${data.imageUrl}`);
          };
          img.src = `${API_BASE_URL}${data.imageUrl}`;
        }
      } catch (error) {
        console.error('게시글 조회 실패:', error);
        toast.error('게시글을 불러오는데 실패했습니다');
        navigate('/boards');
      } finally {
        setInitialDataLoading(false);
      }
    };

    fetchPostData();
  }, [isEditMode, id, navigate, setValue, setPreview]);

  const onSubmit = async (data: PostFormData) => {
    setApiError('');

    // 서버 전송 전 최종 검증 (클라이언트 우회 방지)
    if (data.title.length < 2 || data.title.length > maxTitleLength) {
      setApiError(`제목은 2자 이상 ${maxTitleLength}자 이하여야 합니다`);
      return;
    }

    if (data.content.length < 5 || data.content.length > maxContentLength) {
      setApiError(`내용은 5자 이상 ${maxContentLength}자 이하여야 합니다`);
      return;
    }

    if (selectedFile) {
      if (selectedFile.size > MAX_FILE_SIZE) {
        setApiError('파일 크기는 1MB 이하여야 합니다');
        return;
      }

      if (!selectedFile.type.startsWith('image/')) {
        setApiError('이미지 파일만 업로드 가능합니다');
        return;
      }

      const extension = selectedFile.name.toLowerCase().split('.').pop() || '';
      if (!ALLOWED_IMAGE_EXTENSIONS.includes(extension)) {
        setApiError(`허용된 이미지 형식: ${ALLOWED_IMAGE_EXTENSIONS.join(', ')}`);
        return;
      }
    }

    try {
      if (isEditMode && id) {
        // 수정 모드
        let fileToSend: File | undefined = selectedFile || undefined;

        // 이미지 삭제 시 1x1 투명 PNG 전송
        if (hasDeletedImage && !selectedFile) {
          console.log('[Image Delete] 투명 이미지 생성 및 전송');
          fileToSend = await createTransparentImageAsync();
        }

        await updatePost(Number(id), data, fileToSend);

        // 제출 완료 표시 (나가기 경고 비활성화)
        setIsSubmitted(true);

        // 성공 toast
        toast.success('게시글이 수정되었습니다!');

        // 상세 페이지로 이동 (toast 표시 후)
        setTimeout(() => navigate(`/boards/${id}`), 500);
      } else {
        // 작성 모드
        await createPost(data, selectedFile || undefined);

        // 제출 완료 표시 (나가기 경고 비활성화)
        setIsSubmitted(true);

        // 성공 toast
        toast.success('게시글이 작성되었습니다!');

        // 목록으로 이동 (toast 표시 후)
        setTimeout(() => navigate('/boards'), 500);
      }
    } catch (error) {
      handlePostFormApiError(error, { setApiError });
    }
  };

  return {
    categories,
    categoriesLoading,
    initialData,
    initialDataLoading,
    apiError,
    setApiError,
    onSubmit,
  };
};
