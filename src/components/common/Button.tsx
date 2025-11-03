import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  // variant별 스타일
  const variantStyles = {
    primary: disabled
      ? 'bg-gray-400 text-white cursor-not-allowed'
      : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer',
    secondary: disabled
      ? 'bg-gray-400 text-white cursor-not-allowed'
      : 'bg-gray-200 hover:bg-gray-300 text-gray-700 cursor-pointer',
    danger: disabled
      ? 'bg-gray-400 text-white cursor-not-allowed'
      : 'bg-red-400 hover:bg-red-500 text-white cursor-pointer',
  };

  // size별 패딩
  const sizeStyles = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2',
    lg: 'px-4 py-3',
  };

  return (
    <button
      disabled={disabled}
      className={`
        rounded-lg transition-colors
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'flex-1' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
