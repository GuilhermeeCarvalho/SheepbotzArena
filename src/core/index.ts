/** API pública do núcleo de simulação (contracts/simulation-api.md). */
export { loadWorld, validateWorld, type LoadOptions, type Result } from './world/loadWorld';
export { formatIssues, type IssueCode, type ValidationIssue } from './world/issues';
export {
  DEFAULT_DT,
  DEFAULT_SEED,
  MAX_DT,
  worldSchema,
  type BallSpec,
  type FloorRegionSpec,
  type ObstacleSpec,
  type RangeSensorSpec,
  type RobotSpec,
  type SensorSpec,
  type World,
} from './world/schema';
export { createSimulation, type Simulation, type SimulationOptions } from './simulation/simulation';
export type {
  BallState,
  Command,
  OdometryReading,
  Pose,
  RobotState,
  RobotStatus,
  SensorReading,
  SimulationState,
} from './simulation/state';
export type { ControllerIssue, ControllerIssueCode } from './controller/compile';
export type { CameraReading, RobotApi } from './controller/robotApi';
export {
  createModalityRegistry,
  EMPTY_REGISTRY,
  type MatchStatus,
  type Modality,
  type ModalityRegistry,
  type Referee,
} from './modality/contract';
export { rayAngles, rayGeometry } from './sensors/rangefinder';
export { castRay } from './sensors/raycast';
export { buildStaticBodies, discPenetration, type StaticBody } from './collision/staticBodies';
export { isPointInRegion } from './sensors/floor';
export { normalizeAngle } from './math/angle';
