/**
 * Árbitro do round de Sumô (spec 004, US1 e US2; FR-002 a FR-005).
 * Avalia só o snapshot do estado e constantes do mundo (research D-02).
 */
import { normalizeAngle, type MatchStatus, type Referee, type SimulationState, type World } from '../../core/index';
import {
  FALSE_START_DISTANCE,
  FALSE_START_ROTATION,
  roundTimeLimitOf,
  type SumoCategory,
} from './categories';

const TIME_TOLERANCE = 1e-9;

/** H-01: o robô está fora quando o centro do disco passa da borda externa do Dohyo. */
export const isOutOfDohyo = (pose: { x: number; y: number }, category: SumoCategory): boolean =>
  Math.hypot(pose.x, pose.y) > category.dohyoRadius;

/** H-05: deslocamento ou rotação acima da tolerância desde a pose inicial. */
function hasMoved(
  initial: { x: number; y: number; theta: number },
  pose: { x: number; y: number; theta: number },
): boolean {
  const displacement = Math.hypot(pose.x - initial.x, pose.y - initial.y);
  const rotation = Math.abs(normalizeAngle(pose.theta - initial.theta));
  return displacement > FALSE_START_DISTANCE || rotation > FALSE_START_ROTATION;
}

export function createSumoReferee(world: World, category: SumoCategory): Referee {
  const timeLimit = roundTimeLimitOf(world.modalityOptions);
  const initialPoses = new Map(world.robots.map((r) => [r.id, r.pose]));
  const ids = world.robots.map((r) => r.id);

  return {
    evaluate(state: SimulationState): MatchStatus {
      const elapsed = state.time;
      const opponentOf = (id: string) => ids.find((other) => other !== id) ?? null;
      const score = Object.fromEntries(ids.map((id) => [id, 0]));
      const details = { category: category.id, elapsed, timeLimit, outOfDohyo: [] as string[], falseStart: [] as string[] };

      const finish = (winner: string | null, reason: string): MatchStatus => {
        if (winner) score[winner] = 1;
        return { phase: 'finished', winner, reason, score, details };
      };

      // 1. Largada queimada (Nota 11, só LEGO®; hipótese H-05).
      if (category.startDelay > 0 && elapsed < category.startDelay - TIME_TOLERANCE) {
        details.falseStart = state.robots
          .filter((r) => hasMoved(initialPoses.get(r.id)!, r.pose))
          .map((r) => r.id);
        if (details.falseStart.length === 1) {
          const offender = details.falseStart[0]!;
          return finish(opponentOf(offender), `${offender} se moveu antes de ${category.startDelay} s — largada queimada`);
        }
        if (details.falseStart.length > 1) {
          return finish(null, `os dois robôs se moveram antes de ${category.startDelay} s — round sem vencedor`);
        }
      }

      // 2. Saída do Dohyo (Art. 13, Nota 18; hipóteses H-01 e H-06).
      details.outOfDohyo = state.robots.filter((r) => isOutOfDohyo(r.pose, category)).map((r) => r.id);
      if (details.outOfDohyo.length === 1) {
        const loser = details.outOfDohyo[0]!;
        const winner = opponentOf(loser);
        return finish(winner, `${loser} saiu do Dohyo — Yuko para ${winner}`);
      }
      if (details.outOfDohyo.length > 1) {
        return finish(null, 'os dois robôs saíram do Dohyo no mesmo instante — round sem vencedor');
      }

      // 3. Tempo limite (hipótese H-04).
      if (elapsed >= timeLimit - TIME_TOLERANCE) {
        return finish(null, `tempo esgotado (${timeLimit} s) sem Yuko`);
      }

      return { phase: 'running', winner: null, reason: null, score, details };
    },
  };
}
