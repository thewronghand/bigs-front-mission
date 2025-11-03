import { formatDate } from '../../utils/dateFormat';
import type { PostListItem } from '../../types/post';

interface PostCardProps {
  post: PostListItem;
  onClick: (id: number) => void;
}

export default function PostCard({ post, onClick }: PostCardProps) {
  return (
    <div
      className="p-4 bg-white rounded-lg shadow cursor-pointer transition-all hover:shadow-md hover:scale-[1.01]"
      onClick={() => onClick(post.id)}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
          {post.category}
        </span>
        <p className="text-xs text-gray-500">{formatDate(post.createdAt)}</p>
      </div>
      <h3 className="text-lg font-medium line-clamp-2">{post.title}</h3>
    </div>
  );
}
