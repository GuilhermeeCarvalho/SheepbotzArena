/** Árbitro da partida de Futebol Mini / VSS (spec 008, US3; FR-006). */
import type { MatchStatus, Referee, SimulationState, World } from '../../core/index';
import {
  BALL_STILL_DISTANCE,
  DEFAULT_TIME_LIMIT,
  FIELD_LENGTH,
  FIELD_WIDTH,
  FREE_BALL_TIME,
  GOAL_DEPTH,
  goalCrossed,
  isInGoalArea,
  type Team,
} from './field';

const EPSILON = 1e-9;

export const teamsOf = (options: Record<string, unknown> | undefined): Team[] =>
  (options?.teams as Team[] | undefined) ?? [];

export function createSoccerReferee(world: World): Referee {
  const [left, right] = teamsOf(world.modalityOptions) as [Team, Team];
  const timeLimit =
    typeof world.modalityOptions?.timeLimit === 'number'
      ? world.modalityOptions.timeLimit
      : DEFAULT_TIME_LIMIT;
  const ballRadius = world.balls[0]!.radius;
  const goals: Record<string, number> = { [left.name]: 0, [right.name]: 0 };
  let stillSince: number | null = null;
  let stillAnchor = { x: 0, y: 0 };
  let lastEvent: string | null = null;
  let result: MatchStatus | null = null;

  const scoreLine = () => `${left.name} ${goals[left.name]} × ${goals[right.name]} ${right.name}`;

  return {
    evaluate(state: SimulationState): MatchStatus {
      if (result) return result;
      const elapsed = state.time;
      const ball = state.balls[0]!;
      const details = () => ({
        elapsed,
        timeLimit,
        lastEvent,
        scoreLine: scoreLine(),
        defendsLeft: left.name,
      });
      const running = (restart: boolean): MatchStatus => ({
        phase: 'running',
        winner: null,
        reason: lastEvent,
        score: { ...goals },
        details: details(),
        ...(restart ? { restart: true } : {}),
      });

      // Art. 8.1: gol quando a bola passa inteira da linha.
      const side = goalCrossed(ball.position.x, ball.position.y, ballRadius);
      if (side !== 0) {
        const scorer = side === 1 ? left.name : right.name; // quem ataca para aquele lado
        goals[scorer] = (goals[scorer] ?? 0) + 1;
        lastEvent = `gol do ${scorer} — ${scoreLine()}`;
        stillSince = null;
        return running(true);
      }

      // H-07: bola fora do campo e fora dos gols (salvaguarda) → reposição.
      const outside =
        Math.abs(ball.position.y) > FIELD_WIDTH / 2 + ballRadius ||
        Math.abs(ball.position.x) > FIELD_LENGTH / 2 + GOAL_DEPTH + ballRadius;
      if (outside) {
        lastEvent = 'bola fora do campo — reposição';
        stillSince = null;
        return running(true);
      }

      // Art. 15 / H-03: bola parada (ou presa) por 5 s → bola livre; dentro da área do gol,
      // a reposição modela de forma simplificada o prazo de 5 s do goleiro (Art. 9.1; H-09).
      const drift = Math.hypot(ball.position.x - stillAnchor.x, ball.position.y - stillAnchor.y);
      if (stillSince === null || drift >= BALL_STILL_DISTANCE) {
        stillSince = elapsed;
        stillAnchor = { ...ball.position };
      } else if (elapsed - stillSince >= FREE_BALL_TIME - EPSILON) {
        lastEvent = isInGoalArea(ball.position.x, ball.position.y)
          ? 'bola presa na área do gol por 5 s — reposição'
          : 'bola livre — reposição';
        stillSince = null;
        return running(true);
      }

      // Art. 6 / H-01: fim do período.
      if (elapsed >= timeLimit - EPSILON) {
        const a = goals[left.name]!;
        const b = goals[right.name]!;
        const winner = a === b ? null : a > b ? left.name : right.name;
        result = {
          phase: 'finished',
          winner,
          reason: `fim de jogo: ${scoreLine()}${winner ? '' : ' (empate)'}`,
          score: { ...goals },
          details: details(),
        };
        return result;
      }
      return running(false);
    },
  };
}
