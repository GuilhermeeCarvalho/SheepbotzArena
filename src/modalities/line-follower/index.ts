/** Modalidade Seguidor de Linha: Pro e Júnior (spec 006; FR-001, FR-009). */
import type { Modality } from '../../core/index';
import { LINE_FOLLOWER_CATEGORIES, type LineFollowerCategory } from './categories';
import { createLineFollowerReferee } from './referee';
import { validateLineFollowerWorld } from './validation';

export function createLineFollowerModality(category: LineFollowerCategory): Modality {
  return {
    id: category.modalityId,
    name: category.name,
    validateWorld: (world) => validateLineFollowerWorld(world, category),
    createReferee: (world) => createLineFollowerReferee(world, category),
  };
}

export const LINE_FOLLOWER_MODALITIES: readonly Modality[] = Object.values(
  LINE_FOLLOWER_CATEGORIES,
).map(createLineFollowerModality);

export { LINE_FOLLOWER_CATEGORIES, type LineFollowerCategory } from './categories';
export { createLineFollowerWorld, type LineFollowerRobotInput } from './arena';
export {
  buildTrack,
  minTurnRadius,
  pointAt,
  projectOnTrack,
  trackFromPoints,
  type TrackSegment,
} from './track';
