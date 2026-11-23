/** Árbitro da tomada de tempo do Trekking (spec 007, US1; FR-002 a FR-004). */
import {
  buildStaticBodies,
  discPenetration,
  type MatchStatus,
  type Referee,
  type SimulationState,
  type World,
} from '../../core/index';
import {
  CONTACT_TOLERANCE,
  ELIGIBLE_MARK,
  FALSE_START_TIME,
  MARK_COUNT,
  markBody,
  marksOf,
  STILL_DISTANCE,
  timeLimitOf,
} from './parameters';

const EPSILON = 1e-9;

export function createTrekkingReferee(world: World): Referee {
  const marks = marksOf(world.modalityOptions)!.map(markBody);
  const obstacles = buildStaticBodies({ ...world, arena: { ...world.arena, walls: false } });
  const robotSpec = world.robots[0]!;
  const start = robotSpec.pose;
  const timeLimit = timeLimitOf(world.modalityOptions);
  const hw = world.arena.width / 2;
  const hh = world.arena.height / 2;

  const markTimes: number[] = [0]; // Art. 4.2: parte do marco 1
  let movedEver = false;
  let result: MatchStatus | null = null;

  return {
    evaluate(state: SimulationState): MatchStatus {
      if (result) return result;
      const robot = state.robots[0]!;
      const center = { x: robot.pose.x, y: robot.pose.y };
      const elapsed = state.time;
      const r = robotSpec.radius;

      const status = (
        phase: 'running' | 'finished',
        winner: string | null,
        reason: string | null,
      ): MatchStatus => ({
        phase,
        winner,
        reason,
        score: { [robot.id]: markTimes.length },
        details: {
          elapsed,
          timeLimit,
          marksReached: markTimes.length,
          markTimes: [...markTimes],
          lastMarkTime: markTimes[markTimes.length - 1],
          eligible: markTimes.length >= ELIGIBLE_MARK,
        },
      });
      const finish = (winner: string | null, reason: string) =>
        (result = status('finished', winner, reason));

      // Art. 4.15 / H-05: qualquer parte fora do campo.
      if (Math.abs(center.x) + r > hw + EPSILON || Math.abs(center.y) + r > hh + EPSILON) {
        return finish(null, `${robot.id} saiu do campo — tomada de tempo encerrada`);
      }
      // Art. 4.15 / H-04: colisão com obstáculo.
      const hit = obstacles.find((body) => discPenetration(body, center, r) >= -CONTACT_TOLERANCE);
      if (hit)
        return finish(
          null,
          `${robot.id} colidiu com um obstáculo (${hit.id}) — tomada de tempo encerrada`,
        );

      // Art. 4.2 e 4.3 / H-03: o próximo marco, na ordem, ao ser tocado.
      const next = markTimes.length;
      if (next < MARK_COUNT && discPenetration(marks[next]!, center, r) >= -CONTACT_TOLERANCE) {
        markTimes.push(elapsed);
        if (markTimes.length === MARK_COUNT) {
          return finish(
            robot.id,
            `percurso completo: 4 marcos em ${elapsed.toFixed(2).replace('.', ',')} s`,
          );
        }
      }

      // Art. 4.13 / H-07: imóvel por 30 s.
      if (!movedEver && Math.hypot(center.x - start.x, center.y - start.y) >= STILL_DISTANCE)
        movedEver = true;
      if (!movedEver && elapsed >= FALSE_START_TIME - EPSILON) {
        return finish(null, `false start: ${robot.id} não se moveu em ${FALSE_START_TIME} s`);
      }

      if (elapsed >= timeLimit - EPSILON) {
        return finish(null, `tempo esgotado (${timeLimit} s) com ${markTimes.length} marco(s)`);
      }
      return status('running', null, null);
    },
  };
}
