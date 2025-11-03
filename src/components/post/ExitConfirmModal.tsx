import { Button } from '../common';

interface ExitConfirmModalProps {
  isOpen: boolean;
  onSaveAndExit?: () => void;
  onExitWithoutSaving: () => void;
  onCancel: () => void;
  canSave?: boolean;
  saveDisabledReason?: string;
  isEditMode?: boolean;
}

export default function ExitConfirmModal({
  isOpen,
  onSaveAndExit,
  onExitWithoutSaving,
  onCancel,
  canSave,
  saveDisabledReason,
  isEditMode = false,
}: ExitConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-3 xs:px-4">
      <div className="bg-white rounded-lg p-4 xs:p-6 max-w-md w-full shadow-xl">
        <h3 className="text-lg xs:text-xl font-bold text-gray-800 mb-3 xs:mb-4">
          {isEditMode ? '수정을 중단하시겠습니까?' : '작성을 중단하시겠습니까?'}
        </h3>
        <p className="text-sm xs:text-base text-gray-600 mb-4 xs:mb-6">
          {isEditMode
            ? '수정한 내용이 저장되지 않습니다. 정말 나가시겠습니까?'
            : '작성 중인 내용이 있습니다. 임시 저장하거나 그대로 나갈 수 있습니다.'}
        </p>
        <div className="flex flex-col gap-2 xs:gap-3">
          {!isEditMode && onSaveAndExit && (
            <div>
              <Button
                onClick={onSaveAndExit}
                variant="primary"
                size="lg"
                disabled={!canSave}
                className="w-full text-sm xs:text-base"
              >
                임시 저장하고 나가기
              </Button>
              {!canSave && saveDisabledReason && (
                <p className="text-[10px] xs:text-xs text-red-500 mt-1 ml-1">{saveDisabledReason}</p>
              )}
            </div>
          )}
          <Button onClick={onExitWithoutSaving} variant="danger" size="lg" className="w-full text-sm xs:text-base">
            {isEditMode ? '나가기' : '저장하지 않고 나가기'}
          </Button>
          <Button onClick={onCancel} variant="secondary" size="lg" className="w-full text-sm xs:text-base">
            {isEditMode ? '계속 수정하기' : '계속 작성하기'}
          </Button>
        </div>
      </div>
    </div>
  );
}
