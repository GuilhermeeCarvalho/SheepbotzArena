/** Cores da cena 3D por tema (plan 002, "Identidade visual" e "Tema escuro e marca"). */
export type ThemeName = 'light' | 'dark';

export type ScenePalette = {
  background: string;
  grid: string;
  gridSection: string;
  wall: string;
  rayHit: string;
  rayFree: string;
  wheel: string;
  frontMarker: string;
  selection: string;
  error: string;
  skyLight: string;
  groundLight: string;
};

export const SCENE_PALETTES: Readonly<Record<ThemeName, ScenePalette>> = {
  light: {
    background: '#e8e9ec',
    grid: '#d2d4d9',
    gridSection: '#b9bcc3',
    wall: '#b4b9c1',
    rayHit: '#e03131',
    rayFree: '#1c7ed6',
    wheel: '#26282c',
    frontMarker: '#ffffff',
    selection: '#e8590c',
    error: '#e03131',
    skyLight: '#ffffff',
    groundLight: '#b8bcc4',
  },
  dark: {
    background: '#0b0d0b',
    grid: '#1a201a',
    gridSection: '#2a342a',
    wall: '#3a443a',
    rayHit: '#ff5c5c',
    rayFree: '#65b033',
    wheel: '#0f110f',
    frontMarker: '#ffffff',
    selection: '#65b033',
    error: '#f25f5c',
    skyLight: '#e8f5e0',
    groundLight: '#1a201a',
  },
};

/** Paleta padrão (tema claro), usada quando o tema não é informado. */
export const SCENE_COLORS = SCENE_PALETTES.light;
