/** Modalidade Trekking (spec 007; FR-001, FR-008). */
import type { Modality } from '../../core/index';
import { TREKKING_MODALITY_ID } from './parameters';
import { createTrekkingReferee } from './referee';
import { validateTrekkingWorld } from './validation';

export const TREKKING_MODALITY: Modality = {
  id: TREKKING_MODALITY_ID,
  name: 'Trekking',
  validateWorld: validateTrekkingWorld,
  createReferee: createTrekkingReferee,
};

export { createTrekkingWorld, type TrekkingRobotInput } from './arena';
export { MARK_SIZE, type MarkCenter } from './parameters';
