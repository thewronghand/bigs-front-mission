import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

interface NavigationBlockerContextType {
  shouldBlockNavigation: (to: string) => boolean;
  registerBlocker: (blocker: (to: string) => boolean) => void;
  unregisterBlocker: () => void;
}

const NavigationBlockerContext = createContext<NavigationBlockerContextType | null>(null);

export function NavigationBlockerProvider({ children }: { children: ReactNode }) {
  const [blocker, setBlocker] = useState<((to: string) => boolean) | null>(null);

  const shouldBlockNavigation = useCallback(
    (to: string): boolean => {
      if (blocker) {
        return blocker(to);
      }
      return false;
    },
    [blocker]
  );

  const registerBlocker = useCallback((newBlocker: (to: string) => boolean) => {
    setBlocker(() => newBlocker);
  }, []);

  const unregisterBlocker = useCallback(() => {
    setBlocker(null);
  }, []);

  return (
    <NavigationBlockerContext.Provider
      value={{ shouldBlockNavigation, registerBlocker, unregisterBlocker }}
    >
      {children}
    </NavigationBlockerContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNavigationBlocker() {
  const context = useContext(NavigationBlockerContext);
  if (!context) {
    throw new Error('useNavigationBlocker must be used within NavigationBlockerProvider');
  }
  return context;
}
