import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExitConfirmModal from './ExitConfirmModal';

describe('ExitConfirmModal', () => {
  const mockOnSaveAndExit = vi.fn();
  const mockOnExitWithoutSaving = vi.fn();
  const mockOnCancel = vi.fn();

  const defaultProps = {
    isOpen: true,
    onSaveAndExit: mockOnSaveAndExit,
    onExitWithoutSaving: mockOnExitWithoutSaving,
    onCancel: mockOnCancel,
    canSave: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('렌더링', () => {
    it('isOpen이 true일 때 모달을 렌더링한다', () => {
      render(<ExitConfirmModal {...defaultProps} />);

      expect(screen.getByText('작성을 중단하시겠습니까?')).toBeInTheDocument();
    });

    it('isOpen이 false일 때 null을 반환한다', () => {
      const { container } = render(<ExitConfirmModal {...defaultProps} isOpen={false} />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('작성 모드 (isEditMode=false)', () => {
    it('작성 모드 제목을 표시한다', () => {
      render(<ExitConfirmModal {...defaultProps} isEditMode={false} />);

      expect(screen.getByText('작성을 중단하시겠습니까?')).toBeInTheDocument();
    });

    it('작성 모드 메시지를 표시한다', () => {
      render(<ExitConfirmModal {...defaultProps} isEditMode={false} />);

      expect(
        screen.getByText('작성 중인 내용이 있습니다. 임시 저장하거나 그대로 나갈 수 있습니다.')
      ).toBeInTheDocument();
    });

    it('세 개의 버튼을 렌더링한다', () => {
      render(<ExitConfirmModal {...defaultProps} isEditMode={false} />);

      expect(screen.getByText('임시 저장하고 나가기')).toBeInTheDocument();
      expect(screen.getByText('저장하지 않고 나가기')).toBeInTheDocument();
      expect(screen.getByText('계속 작성하기')).toBeInTheDocument();
    });

    it('임시 저장 버튼은 primary 스타일이다', () => {
      render(<ExitConfirmModal {...defaultProps} isEditMode={false} />);

      const saveButton = screen.getByText('임시 저장하고 나가기');
      expect(saveButton.className).toContain('bg-blue-600');
    });
  });

  describe('수정 모드 (isEditMode=true)', () => {
    it('수정 모드 제목을 표시한다', () => {
      render(<ExitConfirmModal {...defaultProps} isEditMode={true} />);

      expect(screen.getByText('수정을 중단하시겠습니까?')).toBeInTheDocument();
    });

    it('수정 모드 메시지를 표시한다', () => {
      render(<ExitConfirmModal {...defaultProps} isEditMode={true} />);

      expect(
        screen.getByText('수정한 내용이 저장되지 않습니다. 정말 나가시겠습니까?')
      ).toBeInTheDocument();
    });

    it('임시 저장 버튼을 표시하지 않는다', () => {
      render(<ExitConfirmModal {...defaultProps} isEditMode={true} />);

      expect(screen.queryByText('임시 저장하고 나가기')).not.toBeInTheDocument();
    });

    it('두 개의 버튼만 렌더링한다', () => {
      render(<ExitConfirmModal {...defaultProps} isEditMode={true} />);

      expect(screen.getByText('나가기')).toBeInTheDocument();
      expect(screen.getByText('계속 수정하기')).toBeInTheDocument();
    });
  });

  describe('버튼 클릭 - 작성 모드', () => {
    it('임시 저장 버튼 클릭 시 onSaveAndExit이 호출된다', async () => {
      const user = userEvent.setup();
      render(<ExitConfirmModal {...defaultProps} isEditMode={false} />);

      const saveButton = screen.getByText('임시 저장하고 나가기');
      await user.click(saveButton);

      expect(mockOnSaveAndExit).toHaveBeenCalledTimes(1);
    });

    it('저장하지 않고 나가기 버튼 클릭 시 onExitWithoutSaving이 호출된다', async () => {
      const user = userEvent.setup();
      render(<ExitConfirmModal {...defaultProps} isEditMode={false} />);

      const exitButton = screen.getByText('저장하지 않고 나가기');
      await user.click(exitButton);

      expect(mockOnExitWithoutSaving).toHaveBeenCalledTimes(1);
    });

    it('계속 작성하기 버튼 클릭 시 onCancel이 호출된다', async () => {
      const user = userEvent.setup();
      render(<ExitConfirmModal {...defaultProps} isEditMode={false} />);

      const cancelButton = screen.getByText('계속 작성하기');
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('버튼 클릭 - 수정 모드', () => {
    it('나가기 버튼 클릭 시 onExitWithoutSaving이 호출된다', async () => {
      const user = userEvent.setup();
      render(<ExitConfirmModal {...defaultProps} isEditMode={true} />);

      const exitButton = screen.getByText('나가기');
      await user.click(exitButton);

      expect(mockOnExitWithoutSaving).toHaveBeenCalledTimes(1);
    });

    it('계속 수정하기 버튼 클릭 시 onCancel이 호출된다', async () => {
      const user = userEvent.setup();
      render(<ExitConfirmModal {...defaultProps} isEditMode={true} />);

      const cancelButton = screen.getByText('계속 수정하기');
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('임시 저장 비활성화', () => {
    it('canSave가 false일 때 임시 저장 버튼이 비활성화된다', () => {
      render(<ExitConfirmModal {...defaultProps} canSave={false} />);

      const saveButton = screen.getByText('임시 저장하고 나가기');
      expect(saveButton).toBeDisabled();
    });

    it('canSave가 true일 때 임시 저장 버튼이 활성화된다', () => {
      render(<ExitConfirmModal {...defaultProps} canSave={true} />);

      const saveButton = screen.getByText('임시 저장하고 나가기');
      expect(saveButton).not.toBeDisabled();
    });

    it('저장 불가 사유를 표시한다', () => {
      render(
        <ExitConfirmModal
          {...defaultProps}
          canSave={false}
          saveDisabledReason="제목과 내용을 입력해주세요"
        />
      );

      expect(screen.getByText('제목과 내용을 입력해주세요')).toBeInTheDocument();
    });

    it('canSave가 true일 때 사유를 표시하지 않는다', () => {
      render(
        <ExitConfirmModal
          {...defaultProps}
          canSave={true}
          saveDisabledReason="제목과 내용을 입력해주세요"
        />
      );

      expect(screen.queryByText('제목과 내용을 입력해주세요')).not.toBeInTheDocument();
    });

    it('저장 불가 사유는 빨간색 작은 글씨다', () => {
      render(
        <ExitConfirmModal
          {...defaultProps}
          canSave={false}
          saveDisabledReason="제목을 입력하세요"
        />
      );

      const reasonText = screen.getByText('제목을 입력하세요');
      expect(reasonText.className).toContain('text-red-500');
      expect(reasonText.className).toMatch(/text-\[10px\]|text-xs/);
    });
  });

  describe('onSaveAndExit가 없을 때', () => {
    it('임시 저장 버튼을 렌더링하지 않는다', () => {
      const propsWithoutSave = {
        ...defaultProps,
        onSaveAndExit: undefined,
      };
      render(<ExitConfirmModal {...propsWithoutSave} />);

      expect(screen.queryByText('임시 저장하고 나가기')).not.toBeInTheDocument();
    });
  });

  describe('스타일링', () => {
    it('배경 오버레이는 어두운 반투명 배경을 가진다', () => {
      const { container } = render(<ExitConfirmModal {...defaultProps} />);

      const overlay = container.firstChild as HTMLElement;
      expect(overlay.className).toContain('bg-black/50');
      expect(overlay.className).toContain('fixed');
      expect(overlay.className).toContain('inset-0');
    });

    it('모달은 중앙 정렬된다', () => {
      const { container } = render(<ExitConfirmModal {...defaultProps} />);

      const overlay = container.firstChild as HTMLElement;
      expect(overlay.className).toContain('flex');
      expect(overlay.className).toContain('items-center');
      expect(overlay.className).toContain('justify-center');
    });

    it('모달 카드는 흰색 배경과 그림자를 가진다', () => {
      const { container } = render(<ExitConfirmModal {...defaultProps} />);

      const modal = container.querySelector('.bg-white');
      expect(modal).toBeInTheDocument();
      expect(modal?.className).toContain('rounded-lg');
      expect(modal?.className).toContain('shadow-xl');
    });

    it('z-index 50을 가진다', () => {
      const { container } = render(<ExitConfirmModal {...defaultProps} />);

      const overlay = container.firstChild as HTMLElement;
      expect(overlay.className).toContain('z-50');
    });
  });

  describe('버튼 스타일', () => {
    it('저장하지 않고 나가기 버튼은 danger 스타일이다', () => {
      render(<ExitConfirmModal {...defaultProps} isEditMode={false} />);

      const exitButton = screen.getByText('저장하지 않고 나가기');
      expect(exitButton.className).toContain('bg-red-400');
    });

    it('계속 작성하기 버튼은 secondary 스타일이다', () => {
      render(<ExitConfirmModal {...defaultProps} isEditMode={false} />);

      const cancelButton = screen.getByText('계속 작성하기');
      expect(cancelButton.className).toContain('bg-gray-200');
    });

    it('모든 버튼은 full width다', () => {
      render(<ExitConfirmModal {...defaultProps} isEditMode={false} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button.className).toContain('w-full');
      });
    });
  });

  describe('레이아웃', () => {
    it('버튼들은 세로로 배치된다', () => {
      const { container } = render(<ExitConfirmModal {...defaultProps} />);

      const buttonContainer = container.querySelector('.flex-col');
      expect(buttonContainer).toBeInTheDocument();
    });

    it('버튼들 사이에 gap이 있다', () => {
      const { container } = render(<ExitConfirmModal {...defaultProps} />);

      const buttonContainer = container.querySelector('.flex-col');
      expect(buttonContainer?.className).toContain('gap-2');
      expect(buttonContainer?.className).toContain('xs:gap-3');
    });
  });

  describe('반응형', () => {
    it('반응형 패딩 클래스를 가진다', () => {
      const { container } = render(<ExitConfirmModal {...defaultProps} />);

      const modal = container.querySelector('.bg-white');
      expect(modal?.className).toContain('p-4');
      expect(modal?.className).toContain('xs:p-6');
    });

    it('오버레이는 반응형 패딩을 가진다', () => {
      const { container } = render(<ExitConfirmModal {...defaultProps} />);

      const overlay = container.firstChild as HTMLElement;
      expect(overlay.className).toContain('px-3');
      expect(overlay.className).toContain('xs:px-4');
    });
  });
});
