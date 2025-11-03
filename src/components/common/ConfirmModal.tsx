import { Button } from './';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '확인',
  cancelText = '취소',
  loading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fadeIn px-3 xs:px-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-slideUp">
        {/* 헤더 */}
        <div className="px-4 xs:px-6 py-3 xs:py-4 border-b border-gray-200">
          <h3 className="text-base xs:text-lg font-semibold text-gray-800">{title}</h3>
        </div>

        {/* 내용 */}
        <div className="px-4 xs:px-6 py-3 xs:py-4">
          <p className="text-sm xs:text-base text-gray-600 whitespace-pre-line">{message}</p>
        </div>

        {/* 버튼 */}
        <div className="px-4 xs:px-6 py-3 xs:py-4 border-t border-gray-200 flex justify-end gap-1.5 xs:gap-2">
          <Button onClick={onClose} disabled={loading} variant="secondary" size="md" className="text-xs xs:text-sm px-3 xs:px-4 py-1.5 xs:py-2">
            {cancelText}
          </Button>
          <Button onClick={onConfirm} disabled={loading} variant="danger" size="md" className="text-xs xs:text-sm px-3 xs:px-4 py-1.5 xs:py-2">
            {loading ? '처리 중...' : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
