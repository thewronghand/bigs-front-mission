import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfirmModal from './ConfirmModal';

describe('ConfirmModal', () => {
  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onConfirm: mockOnConfirm,
    title: '삭제 확인',
    message: '정말 삭제하시겠습니까?',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('렌더링', () => {
    it('isOpen이 true일 때 모달을 렌더링한다', () => {
      render(<ConfirmModal {...defaultProps} />);

      expect(screen.getByText('삭제 확인')).toBeInTheDocument();
      expect(screen.getByText('정말 삭제하시겠습니까?')).toBeInTheDocument();
    });

    it('isOpen이 false일 때 null을 반환한다', () => {
      const { container } = render(<ConfirmModal {...defaultProps} isOpen={false} />);

      expect(container.firstChild).toBeNull();
    });

    it('제목을 렌더링한다', () => {
      render(<ConfirmModal {...defaultProps} />);

      const title = screen.getByText('삭제 확인');
      expect(title.tagName).toBe('H3');
    });

    it('메시지를 렌더링한다', () => {
      render(<ConfirmModal {...defaultProps} />);

      expect(screen.getByText('정말 삭제하시겠습니까?')).toBeInTheDocument();
    });

    it('여러 줄 메시지를 렌더링한다', () => {
      const multilineMessage = '첫 번째 줄\n두 번째 줄\n세 번째 줄';
      const { container } = render(<ConfirmModal {...defaultProps} message={multilineMessage} />);

      const messageElement = container.querySelector('.whitespace-pre-line');
      expect(messageElement).toBeInTheDocument();
      expect(messageElement?.textContent).toBe(multilineMessage);
    });
  });

  describe('버튼', () => {
    it('기본 확인/취소 버튼을 렌더링한다', () => {
      render(<ConfirmModal {...defaultProps} />);

      expect(screen.getByText('확인')).toBeInTheDocument();
      expect(screen.getByText('취소')).toBeInTheDocument();
    });

    it('커스텀 버튼 텍스트를 렌더링한다', () => {
      render(
        <ConfirmModal
          {...defaultProps}
          confirmText="삭제하기"
          cancelText="돌아가기"
        />
      );

      expect(screen.getByText('삭제하기')).toBeInTheDocument();
      expect(screen.getByText('돌아가기')).toBeInTheDocument();
    });

    it('확인 버튼은 danger 스타일이다', () => {
      render(<ConfirmModal {...defaultProps} />);

      const confirmButton = screen.getByText('확인');
      // Button 컴포넌트의 danger variant 확인
      expect(confirmButton.className).toContain('bg-red-400');
    });

    it('취소 버튼은 secondary 스타일이다', () => {
      render(<ConfirmModal {...defaultProps} />);

      const cancelButton = screen.getByText('취소');
      // Button 컴포넌트의 secondary variant 확인
      expect(cancelButton.className).toContain('bg-gray-200');
    });
  });

  describe('버튼 클릭', () => {
    it('확인 버튼 클릭 시 onConfirm이 호출된다', async () => {
      const user = userEvent.setup();
      render(<ConfirmModal {...defaultProps} />);

      const confirmButton = screen.getByText('확인');
      await user.click(confirmButton);

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    it('취소 버튼 클릭 시 onClose가 호출된다', async () => {
      const user = userEvent.setup();
      render(<ConfirmModal {...defaultProps} />);

      const cancelButton = screen.getByText('취소');
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('로딩 상태', () => {
    it('로딩 중일 때 "처리 중..." 텍스트를 표시한다', () => {
      render(<ConfirmModal {...defaultProps} loading={true} />);

      expect(screen.getByText('처리 중...')).toBeInTheDocument();
      expect(screen.queryByText('확인')).not.toBeInTheDocument();
    });

    it('로딩 중일 때 버튼들이 비활성화된다', () => {
      render(<ConfirmModal {...defaultProps} loading={true} />);

      const confirmButton = screen.getByText('처리 중...');
      const cancelButton = screen.getByText('취소');

      expect(confirmButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
    });

    it('로딩 중이 아닐 때 버튼들이 활성화된다', () => {
      render(<ConfirmModal {...defaultProps} loading={false} />);

      const confirmButton = screen.getByText('확인');
      const cancelButton = screen.getByText('취소');

      expect(confirmButton).not.toBeDisabled();
      expect(cancelButton).not.toBeDisabled();
    });
  });

  describe('스타일링', () => {
    it('배경 오버레이는 어두운 반투명 배경을 가진다', () => {
      const { container } = render(<ConfirmModal {...defaultProps} />);

      const overlay = container.firstChild as HTMLElement;
      expect(overlay.className).toContain('bg-black/50');
      expect(overlay.className).toContain('fixed');
      expect(overlay.className).toContain('inset-0');
    });

    it('모달 카드는 흰색 배경과 그림자를 가진다', () => {
      const { container } = render(<ConfirmModal {...defaultProps} />);

      const modal = container.querySelector('.bg-white');
      expect(modal).toBeInTheDocument();
      expect(modal?.className).toContain('rounded-lg');
      expect(modal?.className).toContain('shadow-xl');
    });

    it('z-index 50을 가진다', () => {
      const { container } = render(<ConfirmModal {...defaultProps} />);

      const overlay = container.firstChild as HTMLElement;
      expect(overlay.className).toContain('z-50');
    });

    it('모달은 중앙 정렬된다', () => {
      const { container } = render(<ConfirmModal {...defaultProps} />);

      const overlay = container.firstChild as HTMLElement;
      expect(overlay.className).toContain('flex');
      expect(overlay.className).toContain('items-center');
      expect(overlay.className).toContain('justify-center');
    });
  });

  describe('애니메이션', () => {
    it('오버레이는 fadeIn 애니메이션을 가진다', () => {
      const { container } = render(<ConfirmModal {...defaultProps} />);

      const overlay = container.firstChild as HTMLElement;
      expect(overlay.className).toContain('animate-fadeIn');
    });

    it('모달 카드는 slideUp 애니메이션을 가진다', () => {
      const { container } = render(<ConfirmModal {...defaultProps} />);

      const modal = container.querySelector('.bg-white');
      expect(modal?.className).toContain('animate-slideUp');
    });
  });

  describe('레이아웃', () => {
    it('헤더는 border-bottom을 가진다', () => {
      const { container } = render(<ConfirmModal {...defaultProps} />);

      const header = container.querySelector('.border-b');
      expect(header).toBeInTheDocument();
      expect(header?.textContent).toContain('삭제 확인');
    });

    it('버튼 영역은 border-top을 가진다', () => {
      const { container } = render(<ConfirmModal {...defaultProps} />);

      const buttonArea = container.querySelector('.border-t');
      expect(buttonArea).toBeInTheDocument();
    });

    it('버튼들은 오른쪽 정렬된다', () => {
      const { container } = render(<ConfirmModal {...defaultProps} />);

      const buttonArea = container.querySelector('.border-t');
      expect(buttonArea?.className).toContain('justify-end');
    });
  });

  describe('반응형', () => {
    it('반응형 패딩 클래스를 가진다', () => {
      const { container } = render(<ConfirmModal {...defaultProps} />);

      const modal = container.querySelector('.bg-white');
      // xs: 브레이크포인트 클래스 확인
      expect(modal?.innerHTML).toContain('xs:px-6');
      expect(modal?.innerHTML).toContain('xs:py-4');
    });

    it('오버레이는 반응형 패딩을 가진다', () => {
      const { container } = render(<ConfirmModal {...defaultProps} />);

      const overlay = container.firstChild as HTMLElement;
      expect(overlay.className).toContain('px-3');
      expect(overlay.className).toContain('xs:px-4');
    });
  });
});
