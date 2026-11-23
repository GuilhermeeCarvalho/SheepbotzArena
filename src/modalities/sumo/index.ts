/** Modalidade Sumô: Mega, Mini e LEGO® (spec 004; FR-001, FR-010). */
import type { Modality } from '../../core/index';
import { SUMO_CATEGORIES, type SumoCategory } from './categories';
import { createSumoReferee } from './referee';
import { validateSumoWorld } from './validation';

export function createSumoModality(category: SumoCategory): Modality {
  return {
    id: category.modalityId,
    name: category.name,
    validateWorld: (world) => validateSumoWorld(world, category),
    createReferee: (world) => createSumoReferee(world, category),
  };
}

export const SUMO_MODALITIES: readonly Modality[] =
  Object.values(SUMO_CATEGORIES).map(createSumoModality);

export { SUMO_CATEGORIES, type SumoCategory, type SumoCategoryId } from './categories';
export { createSumoWorld, startPose, type SumoRobotInput } from './arena';
export { isOutOfDohyo } from './referee';
