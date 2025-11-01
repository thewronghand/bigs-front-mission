import { Button } from '../common';
import type { BoardCategory } from '../../types/board';

interface BoardDraft {
  title: string;
  content: string;
  category: BoardCategory;
  timestamp: number;
}

interface DraftsListProps {
  drafts: BoardDraft[];
  isExpanded: boolean;
  onToggle: () => void;
  onLoadDraft: (draft: BoardDraft) => void;
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
        className="p-4 cursor-pointer hover:bg-blue-100 transition-colors flex justify-between items-center"
      >
        <h3 className="text-sm font-medium text-blue-900 flex items-center gap-2">
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
          isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-4 space-y-2">
          {drafts.map((draft) => (
            <div
              key={draft.timestamp}
              className="bg-white rounded border border-blue-200 p-3 flex justify-between items-center"
            >
              <div className="flex-1 cursor-pointer" onClick={() => onLoadDraft(draft)}>
                <p className="font-medium text-gray-800 truncate">
                  {draft.title || '(제목 없음)'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(draft.timestamp).toLocaleString('ko-KR')} · {draft.category}
                </p>
              </div>
              <Button
                onClick={() => onDeleteDraft(draft.timestamp)}
                variant="danger"
                size="sm"
                className="ml-3"
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
