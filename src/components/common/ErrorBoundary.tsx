import { Component, type ErrorInfo, type ReactNode } from 'react';
import Button from './Button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, resetError: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // 에러 로깅 (프로덕션 환경에서는 Sentry 등의 서비스로 전송)
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // 커스텀 fallback이 제공되면 사용
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError);
      }

      // 기본 에러 UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 xs:p-8">
            <div className="text-center">
              {/* 에러 아이콘 */}
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              {/* 제목 */}
              <h2 className="text-xl xs:text-2xl font-bold text-gray-900 mb-2">
                문제가 발생했습니다
              </h2>

              {/* 설명 */}
              <p className="text-sm xs:text-base text-gray-600 mb-6">
                예상치 못한 오류가 발생했습니다.
                <br />
                페이지를 새로고침하거나 잠시 후 다시 시도해주세요.
              </p>

              {/* 에러 메시지 (개발 환경에서만) */}
              {import.meta.env.DEV && (
                <div className="mb-6 p-4 bg-red-50 rounded-lg text-left">
                  <p className="text-xs xs:text-sm font-mono text-red-800 break-words">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              {/* 액션 버튼 */}
              <div className="flex flex-col xs:flex-row gap-3 justify-center">
                <Button
                  variant="primary"
                  onClick={this.resetError}
                  className="w-full xs:w-auto"
                >
                  다시 시도
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => (window.location.href = '/')}
                  className="w-full xs:w-auto"
                >
                  홈으로 이동
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
