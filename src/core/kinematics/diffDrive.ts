/** Cinemática de tração diferencial (FR-005, FR-006; research D-01). */
import { normalizeAngle } from '../math/angle';
import type { Command, Pose } from '../simulation/state';

/** Abaixo deste |w| (rad/s) o movimento é tratado como reta. */
const STRAIGHT_LINE_THRESHOLD = 1e-12;

/**
 * Integra a pose com (v, w) constantes durante `h` segundos, percorrendo o arco exato.
 * Dividir `h` em subintervalos produz a mesma pose final.
 */
export function integrateArc(pose: Pose, v: number, w: number, h: number): Pose {
  if (Math.abs(w) < STRAIGHT_LINE_THRESHOLD) {
    return {
      x: pose.x + v * Math.cos(pose.theta) * h,
      y: pose.y + v * Math.sin(pose.theta) * h,
      theta: pose.theta,
    };
  }
  const radius = v / w;
  const nextTheta = pose.theta + w * h;
  return {
    x: pose.x + radius * (Math.sin(nextTheta) - Math.sin(pose.theta)),
    y: pose.y - radius * (Math.cos(nextTheta) - Math.cos(pose.theta)),
    theta: normalizeAngle(nextTheta),
  };
}

const clamp = (value: number, limit: number): number => Math.min(limit, Math.max(-limit, value));

/** Limita o comando às velocidades máximas do robô. */
export const saturateCommand = (
  command: Command,
  maxLinearSpeed: number,
  maxAngularSpeed: number,
): Command => ({
  v: clamp(command.v, maxLinearSpeed),
  w: clamp(command.w, maxAngularSpeed),
});
