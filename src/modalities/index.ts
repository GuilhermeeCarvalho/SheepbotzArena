/**
 * Ponto de composição das modalidades (constitution, princípio IV; research 001 D-14).
 * Cada modalidade nova é registrada aqui, sem alterar o núcleo nem as demais modalidades.
 */
import { createModalityRegistry } from '../core/index';
import { LINE_FOLLOWER_MODALITIES } from './line-follower/index';
import { SUMO_MODALITIES } from './sumo/index';

export const modalityRegistry = createModalityRegistry([
  ...SUMO_MODALITIES,
  ...LINE_FOLLOWER_MODALITIES,
]);
