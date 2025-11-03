import { Button } from '../common';
import type { PostCategory } from '../../types/post';

interface PostDraft {
  title: string;
  content: string;
  category: PostCategory;
  timestamp: number;
}

interface DraftsListProps {
  drafts: PostDraft[];
  isExpanded: boolean;
  onToggle: () => void;
  onLoadDraft: (draft: PostDraft) => void;
  onDeleteDraft: (timestamp: number) => void;
}

export default function DraftsList({
  drafts,
  isExpanded,
  onToggle,
  onLoadDraft,
  onDeleteDraft,
}: DraftsListProps) {
  if (drafts.length === 0) return null;

  return (
    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg overflow-hidden">
      <div
        onClick={onToggle}
        className="p-3 xs:p-4 cursor-pointer hover:bg-blue-100 transition-colors flex justify-between items-center"
      >
        <h3 className="text-xs xs:text-sm font-medium text-blue-900 flex items-center gap-2">
          <span
            className={`text-blue-900 transition-transform duration-200 ${
              isExpanded ? 'rotate-90' : 'rotate-0'
            }`}
          >
            ▶
          </span>
          임시 저장된 글 ({drafts.length})
        </h3>
      </div>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-3 xs:px-4 pb-3 xs:pb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 xs:gap-3">
          {drafts.map((draft) => (
            <div
              key={draft.timestamp}
              className="bg-white rounded border border-blue-200 p-2.5 xs:p-3 flex lg:flex-col gap-2"
            >
              <div className="flex-1 cursor-pointer" onClick={() => onLoadDraft(draft)}>
                <p className="font-medium text-sm xs:text-base text-gray-800 line-clamp-2 mb-1.5 xs:mb-2">
                  {draft.title || '(제목 없음)'}
                </p>
                {/* 내용 미리보기 (태블릿/데스크톱만) */}
                <p className="hidden sm:line-clamp-1 text-xs xs:text-sm text-gray-600 mb-2">
                  {draft.content || '내용 없음'}
                </p>
                <p className="text-[10px] xs:text-xs text-gray-500">
                  {new Date(draft.timestamp).toLocaleString('ko-KR', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })} · {draft.category}
                </p>
              </div>
              <Button
                onClick={() => onDeleteDraft(draft.timestamp)}
                variant="danger"
                size="sm"
                className="lg:w-full text-xs self-start lg:self-auto shrink-0"
              >
                삭제
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
