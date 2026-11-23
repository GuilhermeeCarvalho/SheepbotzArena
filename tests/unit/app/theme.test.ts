// @vitest-environment jsdom
// Spec 002 — US8: tema inicial (FR-017).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { initialTheme, THEME_STORAGE_KEY } from 'src/app/theme/useTheme';
import { SCENE_PALETTES } from 'src/app/scene/palette';

describe('tema', () => {
  afterEach(() => {
    window.localStorage.clear();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('sem matchMedia e sem escolha → claro', () => {
    vi.stubGlobal('matchMedia', undefined);
    expect(initialTheme()).toBe('light');
  });

  it('armazenamento indisponível não quebra', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    expect(initialTheme()).toBe('dark');
  });

  it('valor salvo inválido é ignorado', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'roxo');
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
    expect(initialTheme()).toBe('light');
  });

  it('paleta escura usa o verde da SheepBotz', () => {
    expect(SCENE_PALETTES.dark.selection).toBe('#65b033');
    expect(SCENE_PALETTES.dark.background).toBe('#0b0d0b');
  });
});
