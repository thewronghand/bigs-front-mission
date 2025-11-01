import { Button } from '../common';

interface ExitConfirmModalProps {
  isOpen: boolean;
  onSaveAndExit: () => void;
  onExitWithoutSaving: () => void;
  onCancel: () => void;
  canSave: boolean;
  saveDisabledReason: string;
}

export default function ExitConfirmModal({
  isOpen,
  onSaveAndExit,
  onExitWithoutSaving,
  onCancel,
  canSave,
  saveDisabledReason,
}: ExitConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <h3 className="text-xl font-bold text-gray-800 mb-4">작성을 중단하시겠습니까?</h3>
        <p className="text-gray-600 mb-6">
          작성 중인 내용이 있습니다. 임시 저장하거나 그대로 나갈 수 있습니다.
        </p>
        <div className="flex flex-col gap-3">
          <div>
            <Button
              onClick={onSaveAndExit}
              variant="primary"
              size="lg"
              disabled={!canSave}
              className="w-full"
            >
              임시 저장하고 나가기
            </Button>
            {!canSave && (
              <p className="text-xs text-red-500 mt-1 ml-1">{saveDisabledReason}</p>
            )}
          </div>
          <Button onClick={onExitWithoutSaving} variant="danger" size="lg" className="w-full">
            저장하지 않고 나가기
          </Button>
          <Button onClick={onCancel} variant="secondary" size="lg" className="w-full">
            계속 작성하기
          </Button>
        </div>
      </div>
    </div>
  );
}
