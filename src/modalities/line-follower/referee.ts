/**
 * Árbitro da tomada de tempo do Seguidor de Linha (spec 006, US1; FR-002 a FR-005).
 * Guarda o progresso entre ticks (plan 006, D-02 e D-03); é recriado a cada `reset()`.
 */
import type { MatchStatus, Referee, SimulationState, World } from '../../core/index';
import {
  FINISH_BEFORE_START,
  START_AREA_HALF_WIDTH,
  STOP_DURATION,
  timeLimitOf,
  type LineFollowerCategory,
} from './categories';
import { projectOnTrack, trackFromPoints, trackRegionOf } from './track';

const EPSILON = 1e-9;
const STOPPED = 1e-9;

export function createLineFollowerReferee(world: World, category: LineFollowerCategory): Referee {
  const region = trackRegionOf(world)!;
  const track = trackFromPoints(region.points);
  const robotSpec = world.robots[0]!;
  const timeLimit = timeLimitOf(world.modalityOptions);
  const finishAt = track.length - FINISH_BEFORE_START;
  const halfLine = region.width / 2;

  let previousS = projectOnTrack(track, robotSpec.pose).s;
  // Robô posicionado na partida pode projetar logo antes do fim do anel (s ≈ L).
  let progress = previousS > track.length / 2 ? previousS - track.length : previousS;
  let lapTime: number | null = null;
  let stoppedSince: number | null = null;
  let result: MatchStatus | null = null;

  return {
    evaluate(state: SimulationState): MatchStatus {
      if (result) return result;
      const robot = state.robots[0]!;
      const elapsed = state.time;
      const projection = projectOnTrack(track, robot.pose);

      let delta = projection.s - previousS;
      if (delta > track.length / 2) delta -= track.length;
      if (delta < -track.length / 2) delta += track.length;
      progress += delta;
      previousS = projection.s;

      const details = {
        category: category.id,
        elapsed,
        timeLimit,
        trackLength: track.length,
        progress: Math.max(0, progress),
        progressPercent: Math.min(100, (Math.max(0, progress) / track.length) * 100),
        lapTime,
        stoppedFor: stoppedSince === null ? 0 : elapsed - stoppedSince,
      };
      const finish = (valid: boolean, reason: string): MatchStatus => {
        result = {
          phase: 'finished',
          winner: valid ? robot.id : null,
          reason,
          score: { [robot.id]: valid && lapTime !== null ? lapTime : 0 },
          details: { ...details, lapTime },
        };
        return result;
      };

      // Art. 5.6 / H-01: o disco não toca mais a linha branca.
      if (projection.distance > robotSpec.radius + halfLine + EPSILON) {
        return finish(false, `${robot.id} saiu da linha — volta inválida`);
      }

      if (lapTime === null && progress >= finishAt - EPSILON) lapTime = elapsed;

      if (lapTime !== null) {
        // Art. 5.7 / H-04: parar dentro da área de partida-chegada por 2 s.
        const inArea =
          progress >= finishAt - EPSILON &&
          progress <= track.length + EPSILON &&
          projection.distance <= START_AREA_HALF_WIDTH - robotSpec.radius + EPSILON;
        if (!inArea)
          return finish(
            false,
            `${robot.id} saiu da área de partida-chegada sem parar — volta inválida`,
          );
        const stopped = Math.abs(robot.command.v) < STOPPED && Math.abs(robot.command.w) < STOPPED;
        stoppedSince = stopped ? (stoppedSince ?? elapsed) : null;
        if (stoppedSince !== null && elapsed - stoppedSince >= STOP_DURATION - EPSILON) {
          return finish(true, `volta válida em ${lapTime.toFixed(2).replace('.', ',')} s`);
        }
      }

      if (elapsed >= timeLimit - EPSILON)
        return finish(false, `tempo esgotado (${timeLimit} s) sem volta válida`);

      return {
        phase: 'running',
        winner: null,
        reason: null,
        score: { [robot.id]: 0 },
        details: {
          ...details,
          lapTime,
          stoppedFor: stoppedSince === null ? 0 : elapsed - stoppedSince,
        },
      };
    },
  };
}
