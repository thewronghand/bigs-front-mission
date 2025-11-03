import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { IoClose } from 'react-icons/io5';
import toast from 'react-hot-toast';
import { createPost, getCategories, getPostDetail, updatePost } from '../api';
import { ErrorMessage } from '../components/auth';
import { Button, ExitConfirmModal, DraftsList, Spinner } from '../components';
import { useAuthStore } from '../store/authStore';
import { handlePostFormApiError, API_BASE_URL } from '../utils';
import { useNavigationBlocker } from '../contexts/NavigationBlockerContext';
import type { PostCategory } from '../types/post';

interface PostFormData {
  title: string;
  content: string;
  category: PostCategory;
}

interface PostDraft {
  title: string;
  content: string;
  category: PostCategory;
  timestamp: number;
}

// 보안 상수
const MAX_TITLE_LENGTH = 100;
const MAX_CONTENT_LENGTH = 5000;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGE_DIMENSION = 4096; // 최대 4096x4096 (검증용)
const RESIZE_DIMENSION = 1920; // 리사이징 기준 (1920px)
const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

// 임시 저장 관리 상수
const MAX_DRAFTS_COUNT = 10; // 최대 임시저장 개수
const DRAFT_EXPIRY_DAYS = 7; // 임시저장 만료 기간 (일)

// 임시 저장 관리 유틸리티
const cleanExpiredDrafts = (drafts: PostDraft[]): PostDraft[] => {
  const now = Date.now();
  const expiryTime = DRAFT_EXPIRY_DAYS * 24 * 60 * 60 * 1000; // 7일을 밀리초로
  return drafts.filter((draft) => now - draft.timestamp < expiryTime);
};

const isDuplicateDraft = (drafts: PostDraft[], newDraft: PostDraft): boolean => {
  return drafts.some(
    (draft) =>
      draft.title.trim() === newDraft.title.trim() &&
      draft.content.trim() === newDraft.content.trim() &&
      draft.category === newDraft.category
  );
};

const limitDraftsCount = (drafts: PostDraft[]): PostDraft[] => {
  if (drafts.length <= MAX_DRAFTS_COUNT) return drafts;
  // timestamp 기준 내림차순 정렬 후 최신 MAX_DRAFTS_COUNT개만 유지
  return drafts.sort((a, b) => b.timestamp - a.timestamp).slice(0, MAX_DRAFTS_COUNT);
};

// 이미지 리사이징 함수
const resizeImage = (file: File, maxDimension: number): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const { width, height } = img;

      // 리사이징이 필요없으면 원본 반환
      if (width <= maxDimension && height <= maxDimension) {
        resolve(file);
        return;
      }

      // 비율 유지하면서 리사이징
      let newWidth = width;
      let newHeight = height;

      if (width > height) {
        if (width > maxDimension) {
          newWidth = maxDimension;
          newHeight = (height * maxDimension) / width;
        }
      } else {
        if (height > maxDimension) {
          newHeight = maxDimension;
          newWidth = (width * maxDimension) / height;
        }
      }

      // Canvas로 리사이징
      const canvas = document.createElement('canvas');
      canvas.width = newWidth;
      canvas.height = newHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context를 가져올 수 없습니다'));
        return;
      }

      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      // Blob으로 변환
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('이미지 변환에 실패했습니다'));
            return;
          }

          // File 객체 생성
          const resizedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });

          resolve(resizedFile);
        },
        file.type,
        0.9 // 품질 90%
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('이미지 로드에 실패했습니다'));
    };

    img.src = objectUrl;
  });
};

export default function PostForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const logout = useAuthStore((state) => state.logout);
  const { registerBlocker, unregisterBlocker } = useNavigationBlocker();
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

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [existingImageUrl, setExistingImageUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [initialDataLoading, setInitialDataLoading] = useState(isEditMode);
  const [isDragging, setIsDragging] = useState(false);

  // 수정 모드에서 초기 데이터 저장
  const [initialData, setInitialData] = useState<{
    title: string;
    content: string;
    category: string;
    imageUrl: string;
  } | null>(null);

  // 카테고리 목록 (API에서 가져옴)
  const [categories, setCategories] = useState<Record<string, string> | null>(null);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // 임시 저장된 글 목록
  const [drafts, setDrafts] = useState<PostDraft[]>([]);
  const [isDraftsExpanded, setIsDraftsExpanded] = useState(false);

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

        // 이미지가 있으면 설정
        if (data.imageUrl) {
          setExistingImageUrl(data.imageUrl);
          setPreview(`${API_BASE_URL}${data.imageUrl}`);
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
  }, [isEditMode, id, navigate, setValue]);

  // 페이지 로드 시 임시 저장 목록 불러오기 및 정리 (작성 모드에서만)
  useEffect(() => {
    if (isEditMode) return; // 수정 모드에서는 임시저장 사용 안 함

    const savedDrafts = localStorage.getItem('board-drafts');
    if (savedDrafts) {
      let drafts = JSON.parse(savedDrafts);
      // 만료된 임시저장 제거
      drafts = cleanExpiredDrafts(drafts);
      // 개수 제한 적용
      drafts = limitDraftsCount(drafts);
      // 정리된 목록 저장
      localStorage.setItem('board-drafts', JSON.stringify(drafts));
      setDrafts(drafts);
    }
  }, [isEditMode]);

  const title = watch('title', '');
  const content = watch('content', '');
  const category = watch('category', 'FREE');

  // 제목과 내용이 모두 있어야 활성화
  const isFormValid = title.trim().length >= 2 && content.trim().length >= 5;

  // 임시 저장 버튼 활성화 조건
  const canSaveDraft = (() => {
    // 기본 조건
    if (title.trim().length < 2 || content.trim().length < 5) return false;
    if (title.length > MAX_TITLE_LENGTH || content.length > MAX_CONTENT_LENGTH) return false;

    // 중복 체크
    const currentDraft: PostDraft = {
      title,
      content,
      category: watch('category'),
      timestamp: Date.now(),
    };
    if (isDuplicateDraft(drafts, currentDraft)) return false;

    return true;
  })();

  // 작성 중인 내용이 있는지 확인
  const hasUnsavedChanges = (() => {
    if (isEditMode && initialData) {
      // 수정 모드: 초기 데이터와 비교
      const titleChanged = title !== initialData.title;
      const contentChanged = content !== initialData.content;
      const categoryChanged = category !== initialData.category;

      // 이미지 변경 감지
      const imageChanged = (() => {
        // 새 이미지 선택한 경우
        if (selectedFile) return true;
        // 기존 이미지 삭제한 경우
        if (initialData.imageUrl && !preview) return true;
        return false;
      })();

      return titleChanged || contentChanged || categoryChanged || imageChanged;
    } else {
      // 작성 모드: 입력값이 있는지만 확인
      return title.trim().length > 0 || content.trim().length > 0 || selectedFile !== null;
    }
  })();

  // 페이지 벗어날 때 브라우저 경고 (새로고침, 탭 닫기 등)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !isSubmitted) {
        e.preventDefault();
        e.returnValue = ''; // Chrome에서 필요
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, isSubmitted]);

  // 브라우저 뒤로가기 감지
  useEffect(() => {
    if (!hasUnsavedChanges || isSubmitted) return;

    // history에 임시 상태 추가
    window.history.pushState(null, '', window.location.pathname);

    const handlePopState = () => {
      if (hasUnsavedChanges && !isSubmitted) {
        // 뒤로가기를 막고 다시 현재 위치로
        window.history.pushState(null, '', window.location.pathname);
        setShowExitModal(true);
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasUnsavedChanges, isSubmitted]);

  // 나가기 확인 모달
  const [showExitModal, setShowExitModal] = useState(false);

  // Context를 통한 navigation blocker 등록
  useEffect(() => {
    const blocker = (to: string) => {
      if (hasUnsavedChanges && !isSubmitted) {
        setShowExitModal(true);
        return true; // block navigation
      }
      return false; // allow navigation
    };

    registerBlocker(blocker);

    return () => {
      unregisterBlocker();
    };
  }, [hasUnsavedChanges, isSubmitted, registerBlocker, unregisterBlocker]);

  const handleNavigateBack = () => {
    if (hasUnsavedChanges && !isSubmitted) {
      setShowExitModal(true);
    } else {
      navigate('/boards');
    }
  };

  const handleExitWithoutSaving = () => {
    setShowExitModal(false);
    // blocker 무시하고 강제로 navigation
    setIsSubmitted(true); // blocker가 더 이상 동작하지 않도록
    navigate('/boards');
  };

  // 임시 저장 함수
  const saveDraft = (): boolean => {
    const newDraft: PostDraft = {
      title,
      content,
      category: watch('category'),
      timestamp: Date.now(),
    };

    let savedDrafts = JSON.parse(localStorage.getItem('board-drafts') || '[]');

    // 1. 중복 체크
    if (isDuplicateDraft(savedDrafts, newDraft)) {
      alert('이미 동일한 내용의 임시저장이 있습니다.');
      return false;
    }

    // 2. 새 draft 추가
    savedDrafts.push(newDraft);

    // 3. 만료된 임시저장 제거
    savedDrafts = cleanExpiredDrafts(savedDrafts);

    // 4. 개수 제한 (최신순으로 정렬 후 10개만 유지)
    savedDrafts = limitDraftsCount(savedDrafts);

    localStorage.setItem('board-drafts', JSON.stringify(savedDrafts));
    setDrafts(savedDrafts);
    return true;
  };

  const handleSaveAndExit = () => {
    const saved = saveDraft();
    if (saved) {
      setShowExitModal(false);
      // blocker 무시하고 강제로 navigation
      setIsSubmitted(true); // blocker가 더 이상 동작하지 않도록
      navigate('/boards');
    }
    // 저장 실패 시 모달은 유지 (saveDraft 내부에서 alert 표시)
  };

  // 임시저장 불가 이유 메시지
  const getSaveDisabledReason = (): string => {
    if (title.trim().length < 2) return '제목은 2자 이상이어야 합니다';
    if (content.trim().length < 5) return '내용은 5자 이상이어야 합니다';
    if (title.length > MAX_TITLE_LENGTH) return `제목은 ${MAX_TITLE_LENGTH}자 이하여야 합니다`;
    if (content.length > MAX_CONTENT_LENGTH) return `내용은 ${MAX_CONTENT_LENGTH}자 이하여야 합니다`;

    // 중복 체크
    const currentDraft: PostDraft = {
      title,
      content,
      category: watch('category'),
      timestamp: Date.now(),
    };
    if (isDuplicateDraft(drafts, currentDraft)) return '이미 동일한 내용의 임시저장이 있습니다';

    return '';
  };

  const handleManualSave = () => {
    const saved = saveDraft();
    if (saved) {
      alert('임시 저장되었습니다!');
    }
  };

  const handleCancelExit = () => {
    setShowExitModal(false);
    // 모달만 닫고 navigation은 취소됨 (blocker가 이미 막았음)
  };

  // 임시 저장된 글 불러오기
  const handleLoadDraft = (draft: PostDraft) => {
    setValue('title', draft.title);
    setValue('content', draft.content);
    setValue('category', draft.category);
  };

  // 임시 저장된 글 삭제
  const handleDeleteDraft = (timestamp: number) => {
    const updatedDrafts = drafts.filter((d) => d.timestamp !== timestamp);
    setDrafts(updatedDrafts);
    localStorage.setItem('board-drafts', JSON.stringify(updatedDrafts));
  };

  const [fileError, setFileError] = useState('');

  // 파일 크기 포맷팅 함수
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  // 공통 파일 처리 함수
  const processFile = async (file: File, clearInput?: () => void) => {
    setFileError('');

    // 1. 파일 크기 제한
    if (file.size > MAX_FILE_SIZE) {
      setFileError('파일 크기는 5MB 이하여야 합니다');
      clearInput?.();
      return;
    }

    // 2. MIME 타입 확인
    if (!file.type.startsWith('image/')) {
      setFileError('이미지 파일만 업로드 가능합니다');
      clearInput?.();
      return;
    }

    // 3. 파일 확장자 확인 (MIME 타입 우회 방지)
    const fileName = file.name.toLowerCase();
    const extension = fileName.split('.').pop() || '';
    if (!ALLOWED_IMAGE_EXTENSIONS.includes(extension)) {
      setFileError(`허용된 이미지 형식: ${ALLOWED_IMAGE_EXTENSIONS.join(', ')}`);
      clearInput?.();
      return;
    }

    // 4. 이미지 해상도 확인 및 리사이징
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = async () => {
      URL.revokeObjectURL(objectUrl);

      if (img.width > MAX_IMAGE_DIMENSION || img.height > MAX_IMAGE_DIMENSION) {
        setFileError(`이미지 크기는 ${MAX_IMAGE_DIMENSION}x${MAX_IMAGE_DIMENSION} 이하여야 합니다`);
        clearInput?.();
        return;
      }

      try {
        // 이미지 리사이징 (1920px 기준)
        const resizedFile = await resizeImage(file, RESIZE_DIMENSION);

        // 리사이징 후 파일 크기 재확인
        if (resizedFile.size > MAX_FILE_SIZE) {
          setFileError('리사이징 후에도 파일 크기가 5MB를 초과합니다');
          clearInput?.();
          return;
        }

        // 모든 검증 통과 - 파일 설정 및 미리보기
        setSelectedFile(resizedFile);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(resizedFile);
      } catch (error) {
        console.error('이미지 리사이징 실패:', error);
        setFileError('이미지 처리 중 오류가 발생했습니다');
        clearInput?.();
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setFileError('유효하지 않은 이미지 파일입니다');
      clearInput?.();
    };

    img.src = objectUrl;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file, () => {
      e.target.value = '';
    });
  };

  // 드래그 앤 드롭 핸들러
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreview('');
    setFileError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const [apiError, setApiError] = useState('');

  const onSubmit = async (data: PostFormData) => {
    setApiError('');

    // 서버 전송 전 최종 검증 (클라이언트 우회 방지)
    if (data.title.length < 2 || data.title.length > MAX_TITLE_LENGTH) {
      setApiError(`제목은 2자 이상 ${MAX_TITLE_LENGTH}자 이하여야 합니다`);
      return;
    }

    if (data.content.length < 5 || data.content.length > MAX_CONTENT_LENGTH) {
      setApiError(`내용은 5자 이상 ${MAX_CONTENT_LENGTH}자 이하여야 합니다`);
      return;
    }

    if (selectedFile) {
      if (selectedFile.size > MAX_FILE_SIZE) {
        setApiError('파일 크기는 5MB 이하여야 합니다');
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
        console.log('게시글 수정 요청:', data);
        console.log('첨부 파일:', selectedFile);

        await updatePost(Number(id), data, selectedFile || undefined);

        console.log('수정 완료! 게시글 ID:', id);

        // 제출 완료 표시 (나가기 경고 비활성화)
        setIsSubmitted(true);

        // 성공 toast
        toast.success('게시글이 수정되었습니다!');

        // 상세 페이지로 이동 (toast 표시 후)
        setTimeout(() => navigate(`/boards/${id}`), 500);
      } else {
        // 작성 모드
        console.log('게시글 작성 요청:', data);
        console.log('첨부 파일:', selectedFile);

        const response = await createPost(data, selectedFile || undefined);

        console.log('작성 완료! 게시글 ID:', response.id);

        // 제출 완료 표시 (나가기 경고 비활성화)
        setIsSubmitted(true);

        // 성공 toast
        toast.success('게시글이 작성되었습니다!');

        // 목록으로 이동 (toast 표시 후)
        setTimeout(() => navigate('/boards'), 500);
      }
    } catch (error) {
      handlePostFormApiError(error, { logout, navigate, setApiError });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 본문 */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 초기 데이터 로딩 중 (수정 모드) */}
        {initialDataLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Spinner size="lg" />
            <p className="text-gray-500 mt-6">게시글 정보를 불러오는 중...</p>
          </div>
        )}

        {!initialDataLoading && (
          <>
            {/* 임시 저장된 글 목록 (작성 모드에서만) */}
            {!isEditMode && (
              <DraftsList
                drafts={drafts}
                isExpanded={isDraftsExpanded}
                onToggle={() => setIsDraftsExpanded(!isDraftsExpanded)}
                onLoadDraft={handleLoadDraft}
                onDeleteDraft={handleDeleteDraft}
              />
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-8 rounded-lg shadow">
          {/* 카테고리 */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              카테고리
            </label>
            {categoriesLoading || !categories ? (
              <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white flex items-center min-h-[46px]">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            ) : (
              <select
                id="category"
                {...register('category', { required: '카테고리를 선택해주세요' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                제목
              </label>
              <span className={`text-sm ${title.length > MAX_TITLE_LENGTH ? 'text-red-500' : 'text-gray-500'}`}>
                {title.length}/{MAX_TITLE_LENGTH}
              </span>
            </div>
            <input
              type="text"
              id="title"
              {...register('title', {
                required: '제목을 입력해주세요',
                minLength: { value: 2, message: '제목은 2자 이상이어야 합니다' },
                maxLength: { value: MAX_TITLE_LENGTH, message: `제목은 ${MAX_TITLE_LENGTH}자 이하여야 합니다` },
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="제목을 입력하세요"
            />
            {errors.title && (
              <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* 내용 */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">
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
                          <span className="relative z-10">{getSaveDisabledReason()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <span className={`text-sm ${content.length > MAX_CONTENT_LENGTH ? 'text-red-500' : 'text-gray-500'}`}>
                {content.length}/{MAX_CONTENT_LENGTH}
              </span>
            </div>
            <textarea
              id="content"
              {...register('content', {
                required: '내용을 입력해주세요',
                minLength: { value: 5, message: '내용은 5자 이상이어야 합니다' },
                maxLength: { value: MAX_CONTENT_LENGTH, message: `내용은 ${MAX_CONTENT_LENGTH}자 이하여야 합니다` },
              })}
              rows={10}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="내용을 입력하세요"
            />
            {errors.content && (
              <p className="text-sm text-red-500 mt-1">{errors.content.message}</p>
            )}
          </div>

          {/* 이미지 첨부 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이미지 첨부 (선택)
            </label>

            {/* Hidden file input */}
            <input
              type="file"
              id="file"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden"
            />

            {/* 카드 스타일 업로드 영역 */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50">
              {!preview ? (
                // 업로드 전
                <div
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={handleUploadClick}
                  className={`cursor-pointer h-64 flex items-center justify-center ${
                    isDragging
                      ? 'bg-blue-50'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center">
                    <svg
                      className="w-12 h-12 text-gray-400 mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-gray-600 mb-1">
                      {isDragging ? '이미지를 놓아주세요' : '이미지를 드래그하거나 클릭하여 업로드'}
                    </p>
                    <p className="text-xs text-gray-500">최대 5MB, JPG/PNG/GIF/WEBP</p>
                  </div>
                </div>
              ) : (
                // 업로드 후
                <div className="relative bg-white">
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 hover:scale-110 shadow-lg cursor-pointer transition-transform"
                    aria-label="이미지 삭제"
                  >
                    <IoClose className="text-xl" />
                  </button>
                  {/* 고정 높이 이미지 영역 */}
                  <div className="h-64 flex items-center justify-center bg-gray-100">
                    <img
                      src={preview}
                      alt="업로드된 이미지"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  {/* 파일 정보 */}
                  {selectedFile && (
                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                      <p className="text-sm text-gray-700 font-medium truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {fileError && (
              <p className="text-sm text-red-500 mt-2">{fileError}</p>
            )}
          </div>

          {/* 에러 메시지 */}
          <ErrorMessage message={apiError} />

          {/* 버튼 */}
          <div className="flex gap-4">
            <Button
              type="button"
              onClick={handleNavigateBack}
              variant="secondary"
              size="lg"
              fullWidth
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || isSubmitting || (isEditMode && !hasUnsavedChanges)}
              variant="primary"
              size="lg"
              fullWidth
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
        isOpen={showExitModal}
        onSaveAndExit={!isEditMode ? handleSaveAndExit : undefined}
        onExitWithoutSaving={handleExitWithoutSaving}
        onCancel={handleCancelExit}
        canSave={!isEditMode ? canSaveDraft : undefined}
        saveDisabledReason={!isEditMode ? getSaveDisabledReason() : undefined}
        isEditMode={isEditMode}
      />
    </div>
  );
}
