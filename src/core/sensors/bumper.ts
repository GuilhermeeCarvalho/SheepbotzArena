/** Bumper por setor angular (FR-015; research D-06). */
import { isAngleInSector } from '../math/angle';
import type { BumperSpec } from '../world/schema';

/**
 * Indica se algum contato do tick está no setor do bumper.
 * `contactAngles` em radianos, no referencial do robô.
 */
export const isBumperPressed = (
  spec: Pick<BumperSpec, 'from' | 'to'>,
  contactAngles: readonly number[],
): boolean => contactAngles.some((angle) => isAngleInSector(angle, spec.from, spec.to));
