/** Modalidade Futebol Mini / VSS (spec 008; FR-006, FR-007). */
import type { Modality } from '../../core/index';
import { SOCCER_MODALITY_ID } from './field';
import { createSoccerReferee } from './referee';
import { validateSoccerWorld } from './validation';

export const SOCCER_MODALITY: Modality = {
  id: SOCCER_MODALITY_ID,
  name: 'Futebol Mini / VSS',
  validateWorld: validateSoccerWorld,
  createReferee: createSoccerReferee,
};

export {
  createSoccerWorld,
  fieldWalls,
  goalCrossed,
  isInGoalArea,
  type SoccerRobotInput,
  type SoccerRobotModel,
} from './field';
