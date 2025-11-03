import { useState, useRef, useEffect } from 'react';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { formatDate } from '../../utils/dateFormat';
import type { PostListItem } from '../../types/post';

interface PostCardProps {
  post: PostListItem;
  onClick: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function PostCard({ post, onClick, onEdit, onDelete }: PostCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onEdit(post.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onDelete(post.id);
  };

  return (
    <div
      className={`p-3 xs:p-4 bg-white rounded-lg shadow cursor-pointer transition-all relative ${
        showMenu ? 'shadow-md z-30' : 'hover:shadow-md hover:scale-[1.01]'
      }`}
      onClick={() => onClick(post.id)}
    >
      <div className="flex justify-between items-center mb-1.5 xs:mb-2">
        <span className="text-[10px] xs:text-xs bg-blue-100 text-blue-800 px-1.5 xs:px-2 py-0.5 xs:py-1 rounded">
          {post.category}
        </span>
        <div className="flex items-center gap-1.5 xs:gap-2">
          <p className="text-[10px] xs:text-xs text-gray-500">{formatDate(post.createdAt)}</p>

          {/* ... 메뉴 버튼 */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={handleMenuClick}
              className="p-0.5 xs:p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
              aria-label="메뉴"
            >
              <BsThreeDotsVertical className="text-gray-600 text-sm xs:text-base" />
            </button>

            {/* 팝오버 메뉴 */}
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-30 min-w-[90px] xs:min-w-[100px]">
                <button
                  onClick={handleEdit}
                  className="w-full px-3 xs:px-4 py-1.5 xs:py-2 text-left text-xs xs:text-sm hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  수정
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full px-3 xs:px-4 py-1.5 xs:py-2 text-left text-xs xs:text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  삭제
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <h3 className="text-base xs:text-lg font-medium line-clamp-2">{post.title}</h3>
    </div>
  );
}
