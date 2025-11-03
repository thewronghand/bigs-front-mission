import { Button } from '../common';
import logoHorizontal from '../../assets/logo-horizontal-light.png';

interface ActionButton {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

interface HeaderProps {
  user: { name: string; username: string } | null;
  onLogout: () => void;
  onLogoClick: () => void;
  actionButton?: ActionButton; // optional 동적 버튼
}

export default function Header({
  user,
  onLogout,
  onLogoClick,
  actionButton,
}: HeaderProps) {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* 로고 - 클릭하면 게시판 목록으로 */}
        <button
          onClick={onLogoClick}
          className="flex items-center hover:opacity-80 transition-opacity shrink-0 cursor-pointer"
          aria-label="게시판 홈으로 이동"
        >
          <img src={logoHorizontal} alt="BIGS Board" className="h-8 w-auto" />
        </button>

        {/* 우측 버튼 그룹 */}
        <div className="flex items-center gap-4">
          {user && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">{user.name}</span>님
            </div>
          )}
          {actionButton && (
            <Button
              onClick={actionButton.onClick}
              variant={actionButton.variant || 'primary'}
              size="md"
            >
              {actionButton.label}
            </Button>
          )}
          <Button onClick={onLogout} variant="secondary" size="md">
            로그아웃
          </Button>
        </div>
      </div>
    </header>
  );
}
