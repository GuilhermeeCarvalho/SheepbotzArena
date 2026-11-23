import { createContext, useContext } from 'react';
import { SCENE_PALETTES, type ScenePalette } from './palette';

/** Paleta da cena do tema atual; o `Viewport` a fornece dentro do `<Canvas>`. */
export const ScenePaletteContext = createContext<ScenePalette>(SCENE_PALETTES.light);

export const useScenePalette = (): ScenePalette => useContext(ScenePaletteContext);
