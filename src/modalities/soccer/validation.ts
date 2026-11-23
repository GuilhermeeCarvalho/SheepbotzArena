/** Regras do Futebol verificadas ao carregar o mundo (spec 008, US4; FR-007). */
import type { ValidationIssue, World } from '../../core/index';
import {
  BALL_DIAMETER,
  BALL_DIAMETER_TOLERANCE,
  MAX_ROBOT_SIZE,
  MAX_TEAM_SIZE,
  MIN_TEAM_SIZE,
} from './field';

const EPSILON = 1e-9;
const KNOWN_OPTIONS = new Set(['teams', 'timeLimit']);
const rule = (path: string, message: string): ValidationIssue => ({
  path,
  code: 'MODALITY_RULE',
  message,
});
const format = (value: number) => String(Number(value.toFixed(4))).replace('.', ',');

type RawTeam = { name?: unknown; robots?: unknown };

export function validateSoccerWorld(world: World): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const options = world.modalityOptions ?? {};
  for (const key of Object.keys(options)) {
    if (!KNOWN_OPTIONS.has(key))
      issues.push(rule(`modalityOptions.${key}`, `opção desconhecida '${key}' para o Futebol`));
  }
  if (
    options.timeLimit !== undefined &&
    (typeof options.timeLimit !== 'number' || options.timeLimit <= 0)
  ) {
    issues.push(rule('modalityOptions.timeLimit', 'deve ser maior que 0'));
  }

  // Art. 2.5: exatamente uma bola, de 42,7 mm.
  if (world.balls.length !== 1) {
    issues.push(
      rule('balls', `o Futebol exige exatamente 1 bola (encontradas: ${world.balls.length})`),
    );
  } else if (
    Math.abs(2 * world.balls[0]!.radius - BALL_DIAMETER) >
    BALL_DIAMETER_TOLERANCE + EPSILON
  ) {
    issues.push(
      rule(
        'balls[0].radius',
        `a bola deve ter 42,7 mm de diâmetro (Art. 2.5); encontrado ${format(2000 * world.balls[0]!.radius)} mm`,
      ),
    );
  }

  world.robots.forEach((robot, i) => {
    if (2 * robot.radius > MAX_ROBOT_SIZE + EPSILON) {
      issues.push(
        rule(
          `robots[${i}].radius`,
          `diâmetro de ${format(2 * robot.radius)} m excede 0,08 m com uniforme (Art. 3.2.1)`,
        ),
      );
    }
  });

  // Art. 3.1: dois times de 1 a 3 robôs; cada robô em exatamente um time.
  const teams = options.teams as RawTeam[] | undefined;
  const valid =
    Array.isArray(teams) &&
    teams.length === 2 &&
    teams.every(
      (t) =>
        typeof t?.name === 'string' &&
        Array.isArray(t.robots) &&
        t.robots.every((r) => typeof r === 'string'),
    );
  if (!valid) {
    issues.push(
      rule(
        'modalityOptions.teams',
        'informe 2 times como [{ "name": "...", "robots": ["id", ...] }, ...] (Art. 3.1)',
      ),
    );
    return issues;
  }
  const ids = new Map(world.robots.map((r, i) => [r.id, i]));
  const assigned = new Map<string, number>();
  (teams as { name: string; robots: string[] }[]).forEach((team, t) => {
    if (team.robots.length < MIN_TEAM_SIZE || team.robots.length > MAX_TEAM_SIZE) {
      issues.push(
        rule(
          `modalityOptions.teams[${t}].robots`,
          `o time ${team.name} deve ter de 1 a 3 robôs (Art. 3.1)`,
        ),
      );
    }
    const side = t === 0 ? -1 : 1; // H-04: o primeiro time defende o gol esquerdo
    team.robots.forEach((id) => {
      const index = ids.get(id);
      if (index === undefined) {
        issues.push(rule(`modalityOptions.teams[${t}].robots`, `robô '${id}' não existe no mundo`));
        return;
      }
      if (assigned.has(id))
        issues.push(
          rule(`modalityOptions.teams[${t}].robots`, `robô '${id}' está em mais de um time`),
        );
      assigned.set(id, t);
      if (Math.sign(world.robots[index]!.pose.x) !== side) {
        issues.push(
          rule(
            `robots[${index}].pose`,
            `o robô '${id}' deve começar no campo do time ${team.name}`,
          ),
        );
      }
    });
  });
  world.robots.forEach((robot, i) => {
    if (!assigned.has(robot.id))
      issues.push(rule(`robots[${i}]`, `o robô '${robot.id}' não pertence a nenhum time`));
  });
  return issues;
}
