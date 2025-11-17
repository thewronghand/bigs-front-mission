import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { fireEvent } from '@testing-library/react';
import ImageUploadSection from './ImageUploadSection';
import { createRef } from 'react';

// Mock react-icons
vi.mock('react-icons/io5', () => ({
  IoClose: () => <span data-testid="close-icon">×</span>,
}));

// Mock formatFileSize
vi.mock('../../utils/imageUtils', () => ({
  formatFileSize: (size: number) => `${(size / 1024).toFixed(1)}KB`,
}));

describe('ImageUploadSection', () => {
  const mockHandleFileChange = vi.fn();
  const mockHandleDragEnter = vi.fn();
  const mockHandleDragLeave = vi.fn();
  const mockHandleDragOver = vi.fn();
  const mockHandleDrop = vi.fn();
  const mockHandleUploadClick = vi.fn();
  const mockHandleRemoveImage = vi.fn();

  const fileInputRef = createRef<HTMLInputElement>();

  const defaultProps = {
    preview: '',
    selectedFile: null,
    fileError: '',
    isDragging: false,
    fileInputRef,
    handleFileChange: mockHandleFileChange,
    handleDragEnter: mockHandleDragEnter,
    handleDragLeave: mockHandleDragLeave,
    handleDragOver: mockHandleDragOver,
    handleDrop: mockHandleDrop,
    handleUploadClick: mockHandleUploadClick,
    handleRemoveImage: mockHandleRemoveImage,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('렌더링', () => {
    it('라벨을 렌더링한다', () => {
      render(<ImageUploadSection {...defaultProps} />);

      expect(screen.getByText('이미지 첨부 (선택)')).toBeInTheDocument();
    });

    it('숨겨진 파일 입력창을 렌더링한다', () => {
      const { container } = render(<ImageUploadSection {...defaultProps} />);

      const fileInput = container.querySelector('input[type="file"]');
      expect(fileInput).toBeInTheDocument();
      expect(fileInput?.className).toContain('hidden');
    });

    it('파일 입력창은 이미지만 허용한다', () => {
      const { container } = render(<ImageUploadSection {...defaultProps} />);

      const fileInput = container.querySelector('input[type="file"]');
      expect(fileInput).toHaveAttribute('accept', 'image/*');
    });
  });

  describe('업로드 전 상태', () => {
    it('업로드 영역을 렌더링한다', () => {
      render(<ImageUploadSection {...defaultProps} />);

      expect(screen.getByText(/이미지를 드래그하거나 클릭하여 업로드/)).toBeInTheDocument();
    });

    it('업로드 아이콘을 렌더링한다', () => {
      const { container } = render(<ImageUploadSection {...defaultProps} />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('파일 크기 제한 안내를 표시한다', () => {
      render(<ImageUploadSection {...defaultProps} />);

      expect(screen.getByText('최대 1MB, JPG/PNG/GIF/WEBP')).toBeInTheDocument();
    });

    it('업로드 영역 클릭 시 handleUploadClick이 호출된다', async () => {
      const user = userEvent.setup();
      const { container } = render(<ImageUploadSection {...defaultProps} />);

      const uploadArea = container.querySelector('.cursor-pointer');
      await user.click(uploadArea!);

      expect(mockHandleUploadClick).toHaveBeenCalled();
    });
  });

  describe('드래그 앤 드롭', () => {
    it('드래그 진입 시 handleDragEnter가 호출된다', () => {
      const { container } = render(<ImageUploadSection {...defaultProps} />);

      const uploadArea = container.querySelector('.cursor-pointer');
      fireEvent.dragEnter(uploadArea!);

      expect(mockHandleDragEnter).toHaveBeenCalled();
    });

    it('드래그 나가기 시 handleDragLeave가 호출된다', () => {
      const { container } = render(<ImageUploadSection {...defaultProps} />);

      const uploadArea = container.querySelector('.cursor-pointer');
      fireEvent.dragLeave(uploadArea!);

      expect(mockHandleDragLeave).toHaveBeenCalled();
    });

    it('드래그 오버 시 handleDragOver가 호출된다', () => {
      const { container } = render(<ImageUploadSection {...defaultProps} />);

      const uploadArea = container.querySelector('.cursor-pointer');
      fireEvent.dragOver(uploadArea!);

      expect(mockHandleDragOver).toHaveBeenCalled();
    });

    it('드롭 시 handleDrop이 호출된다', () => {
      const { container } = render(<ImageUploadSection {...defaultProps} />);

      const uploadArea = container.querySelector('.cursor-pointer');
      fireEvent.drop(uploadArea!);

      expect(mockHandleDrop).toHaveBeenCalled();
    });

    it('드래깅 중일 때 배경색이 파란색으로 변한다', () => {
      const { container } = render(<ImageUploadSection {...defaultProps} isDragging={true} />);

      // cursor-pointer를 가진 div가 bg-blue-50을 가짐
      const uploadArea = container.querySelector('.cursor-pointer');
      expect(uploadArea?.className).toContain('bg-blue-50');
    });

    it('드래깅 중이 아닐 때 호버 효과가 있다', () => {
      const { container } = render(<ImageUploadSection {...defaultProps} isDragging={false} />);

      const uploadArea = container.querySelector('.cursor-pointer');
      expect(uploadArea?.className).toContain('hover:bg-gray-100');
    });

    it('드래깅 중일 때 "이미지를 놓아주세요" 메시지를 표시한다', () => {
      render(<ImageUploadSection {...defaultProps} isDragging={true} />);

      expect(screen.getByText('이미지를 놓아주세요')).toBeInTheDocument();
    });
  });

  describe('업로드 후 상태', () => {
    const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
    Object.defineProperty(mockFile, 'size', { value: 1024 * 500 }); // 500KB

    const propsWithPreview = {
      ...defaultProps,
      preview: 'data:image/png;base64,test',
      selectedFile: mockFile,
    };

    it('업로드된 이미지를 렌더링한다', () => {
      render(<ImageUploadSection {...propsWithPreview} />);

      const image = screen.getByAltText('업로드된 이미지');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'data:image/png;base64,test');
    });

    it('삭제 버튼을 렌더링한다', () => {
      render(<ImageUploadSection {...propsWithPreview} />);

      const deleteButton = screen.getByLabelText('이미지 삭제');
      expect(deleteButton).toBeInTheDocument();
    });

    it('삭제 버튼 클릭 시 handleRemoveImage가 호출된다', async () => {
      const user = userEvent.setup();
      render(<ImageUploadSection {...propsWithPreview} />);

      const deleteButton = screen.getByLabelText('이미지 삭제');
      await user.click(deleteButton);

      expect(mockHandleRemoveImage).toHaveBeenCalled();
    });

    it('파일 이름을 표시한다', () => {
      render(<ImageUploadSection {...propsWithPreview} />);

      expect(screen.getByText('test.png')).toBeInTheDocument();
    });

    it('파일 크기를 포맷하여 표시한다', () => {
      render(<ImageUploadSection {...propsWithPreview} />);

      expect(screen.getByText('500.0KB')).toBeInTheDocument();
    });

    it('파일 정보가 없으면 파일 이름과 크기를 표시하지 않는다', () => {
      const propsWithoutFile = {
        ...defaultProps,
        preview: 'data:image/png;base64,test',
        selectedFile: null,
      };

      render(<ImageUploadSection {...propsWithoutFile} />);

      expect(screen.queryByText('test.png')).not.toBeInTheDocument();
    });
  });

  describe('에러 표시', () => {
    it('파일 에러가 있으면 에러 메시지를 표시한다', () => {
      render(<ImageUploadSection {...defaultProps} fileError="파일이 너무 큽니다" />);

      expect(screen.getByText('파일이 너무 큽니다')).toBeInTheDocument();
    });

    it('파일 에러가 없으면 에러 메시지를 표시하지 않는다', () => {
      render(<ImageUploadSection {...defaultProps} fileError="" />);

      const { container } = render(<ImageUploadSection {...defaultProps} />);
      const errorText = container.querySelector('.text-red-500');
      expect(errorText).not.toBeInTheDocument();
    });

    it('에러 메시지는 빨간색이다', () => {
      render(<ImageUploadSection {...defaultProps} fileError="에러 메시지" />);

      const errorText = screen.getByText('에러 메시지');
      expect(errorText.className).toContain('text-red-500');
    });
  });

  describe('스타일링', () => {
    it('업로드 영역은 점선 테두리를 가진다', () => {
      const { container } = render(<ImageUploadSection {...defaultProps} />);

      const uploadArea = container.querySelector('.border-dashed');
      expect(uploadArea).toBeInTheDocument();
      expect(uploadArea?.className).toContain('border-2');
      expect(uploadArea?.className).toContain('border-gray-300');
    });

    it('업로드 영역은 둥근 모서리를 가진다', () => {
      const { container } = render(<ImageUploadSection {...defaultProps} />);

      const uploadArea = container.querySelector('.border-dashed');
      expect(uploadArea?.className).toContain('rounded-lg');
    });

    it('업로드 영역은 회색 배경을 가진다', () => {
      const { container } = render(<ImageUploadSection {...defaultProps} />);

      const uploadArea = container.querySelector('.border-dashed');
      expect(uploadArea?.className).toContain('bg-gray-50');
    });

    it('이미지 영역은 고정 높이를 가진다', () => {
      const { container } = render(<ImageUploadSection {...defaultProps} />);

      const uploadArea = container.querySelector('.cursor-pointer');
      expect(uploadArea?.className).toContain('h-64');
    });

    it('삭제 버튼은 빨간색 배경을 가진다', () => {
      const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
      const propsWithPreview = {
        ...defaultProps,
        preview: 'data:image/png;base64,test',
        selectedFile: mockFile,
      };

      render(<ImageUploadSection {...propsWithPreview} />);

      const deleteButton = screen.getByLabelText('이미지 삭제');
      expect(deleteButton.className).toContain('bg-red-500');
      expect(deleteButton.className).toContain('hover:bg-red-600');
    });

    it('삭제 버튼은 둥근 모서리를 가진다', () => {
      const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
      const propsWithPreview = {
        ...defaultProps,
        preview: 'data:image/png;base64,test',
        selectedFile: mockFile,
      };

      render(<ImageUploadSection {...propsWithPreview} />);

      const deleteButton = screen.getByLabelText('이미지 삭제');
      expect(deleteButton.className).toContain('rounded-full');
    });
  });

  describe('레이아웃', () => {
    it('업로드 전 영역은 중앙 정렬이다', () => {
      const { container } = render(<ImageUploadSection {...defaultProps} />);

      const uploadArea = container.querySelector('.cursor-pointer');
      expect(uploadArea?.className).toContain('flex');
      expect(uploadArea?.className).toContain('items-center');
      expect(uploadArea?.className).toContain('justify-center');
    });

    it('삭제 버튼은 우측 상단에 위치한다', () => {
      const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
      const propsWithPreview = {
        ...defaultProps,
        preview: 'data:image/png;base64,test',
        selectedFile: mockFile,
      };

      render(<ImageUploadSection {...propsWithPreview} />);

      const deleteButton = screen.getByLabelText('이미지 삭제');
      expect(deleteButton.className).toContain('absolute');
      expect(deleteButton.className).toContain('top-2');
      expect(deleteButton.className).toContain('right-2');
    });

    it('파일 정보는 하단에 위치한다', () => {
      const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
      const propsWithPreview = {
        ...defaultProps,
        preview: 'data:image/png;base64,test',
        selectedFile: mockFile,
      };

      const { container } = render(<ImageUploadSection {...propsWithPreview} />);

      const fileInfo = container.querySelector('.border-t');
      expect(fileInfo).toBeInTheDocument();
    });
  });

  describe('반응형', () => {
    it('라벨은 반응형 텍스트 크기를 가진다', () => {
      render(<ImageUploadSection {...defaultProps} />);

      const label = screen.getByText('이미지 첨부 (선택)');
      expect(label.className).toContain('text-xs');
      expect(label.className).toContain('xs:text-sm');
    });

    it('에러 메시지는 반응형 텍스트 크기를 가진다', () => {
      render(<ImageUploadSection {...defaultProps} fileError="에러" />);

      const errorText = screen.getByText('에러');
      expect(errorText.className).toContain('text-xs');
      expect(errorText.className).toContain('xs:text-sm');
    });
  });

  describe('애니메이션', () => {
    it('삭제 버튼은 호버 시 확대된다', () => {
      const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
      const propsWithPreview = {
        ...defaultProps,
        preview: 'data:image/png;base64,test',
        selectedFile: mockFile,
      };

      render(<ImageUploadSection {...propsWithPreview} />);

      const deleteButton = screen.getByLabelText('이미지 삭제');
      expect(deleteButton.className).toContain('hover:scale-110');
      expect(deleteButton.className).toContain('transition-transform');
    });
  });
});
