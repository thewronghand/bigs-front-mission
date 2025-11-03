import { MdError } from 'react-icons/md';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

interface SessionExpiredOverlayProps {
  isVisible: boolean;
}

export default function SessionExpiredOverlay({ isVisible }: SessionExpiredOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl animate-scaleIn">
        <div className="text-center">
          <MdError className="text-red-500 text-6xl mx-auto mb-4 animate-bounce" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">로그인이 만료되었습니다</h2>
          <p className="text-gray-600 mb-6">로그인 페이지로 이동합니다.</p>
          <AiOutlineLoading3Quarters className="text-blue-500 text-3xl mx-auto animate-spin" />
        </div>
      </div>
    </div>
  );
}
