/**
 * Odometria por velocidades comandadas, no referencial da pose inicial (FR-014, FR-017).
 * Não conhece colisões: diverge da pose real quando o robô está bloqueado.
 */
import { integrateArc } from '../kinematics/diffDrive';
import type { RandomStream } from '../random/prng';
import type { Command, OdometryReading } from '../simulation/state';

export const initialOdometry = (): OdometryReading => ({ x: 0, y: 0, theta: 0, distance: 0 });

/**
 * Avança a odometria por `dt`. Com ruído, cada componente do comando recebe um desvio
 * gaussiano, apenas quando o robô foi comandado a se mover (rodas paradas não derivam).
 */
export function advanceOdometry(
  odometry: OdometryReading,
  command: Command,
  dt: number,
  noise: number,
  rng: RandomStream,
): OdometryReading {
  const moving = command.v !== 0 || command.w !== 0;
  const v = moving && noise > 0 ? command.v + rng.gaussian(noise) : command.v;
  const w = moving && noise > 0 ? command.w + rng.gaussian(noise) : command.w;
  const pose = integrateArc(odometry, v, w, dt);
  return { ...pose, distance: odometry.distance + Math.abs(v) * dt };
}
