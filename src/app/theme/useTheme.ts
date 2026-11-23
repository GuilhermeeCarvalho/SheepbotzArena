/** Tema claro/escuro da interface (spec 002, US8; FR-017). */
import { useCallback, useEffect, useState } from 'react';
import type { ThemeName } from '../scene/palette';

export const THEME_STORAGE_KEY = 'sheepbotz-theme';

const isTheme = (value: unknown): value is ThemeName => value === 'light' || value === 'dark';

/** Escolha salva; senão, a preferência do sistema; senão, claro. */
export function initialTheme(): ThemeName {
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (isTheme(saved)) return saved;
  } catch {
    // armazenamento indisponível (modo privado): segue a preferência do sistema
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useTheme(): [ThemeName, () => void] {
  const [theme, setTheme] = useState<ThemeName>(initialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next: ThemeName = current === 'dark' ? 'light' : 'dark';
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // sem persistência: a escolha vale até recarregar a página
      }
      return next;
    });
  }, []);

  return [theme, toggle];
}
