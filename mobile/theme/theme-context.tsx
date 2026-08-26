import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

import type { ThemeName } from '@/domain/models';
import { themePreferenceRepository } from '@/repositories/local-theme-preference-repository';
import { defaultThemeName, themes } from '@/theme/tokens';

interface ThemeContextValue {
  themeName: ThemeName;
  setThemeName: (themeName: ThemeName) => void;
  isHydrated: boolean;
  restoreThemeName: (themeName: ThemeName) => Promise<void>;
  theme: (typeof themes)[ThemeName];
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function AppThemeProvider({ children }: PropsWithChildren) {
  const [themeName, setStoredThemeName] = useState<ThemeName>(defaultThemeName);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function hydrateTheme() {
      const savedTheme = await themePreferenceRepository.getTheme();
      if (isMounted && savedTheme) {
        setStoredThemeName(savedTheme);
      }
      if (isMounted) {
        setIsHydrated(true);
      }
    }

    void hydrateTheme();

    return () => {
      isMounted = false;
    };
  }, []);

  const restoreThemeName = useCallback(async (nextThemeName: ThemeName) => {
    await themePreferenceRepository.saveTheme(nextThemeName);
    setStoredThemeName(nextThemeName);
  }, []);

  const setThemeName = useCallback((nextThemeName: ThemeName) => {
    void restoreThemeName(nextThemeName);
  }, [restoreThemeName]);

  const value = useMemo(
    () => ({
      themeName,
      setThemeName,
      isHydrated,
      restoreThemeName,
      theme: themes[themeName],
    }),
    [isHydrated, restoreThemeName, setThemeName, themeName],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useAppTheme debe utilizarse dentro de AppThemeProvider.');
  }

  return context;
}
