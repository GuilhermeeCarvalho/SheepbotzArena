/** Regras do Trekking verificadas ao carregar o mundo (spec 007, US2; FR-005). */
import {
  buildStaticBodies,
  discPenetration,
  type ValidationIssue,
  type World,
} from '../../core/index';
import {
  CONTACT_TOLERANCE,
  MARK_SIZE,
  MAX_ROBOT_SIZE,
  MIN_OBSTACLE_DISTANCE,
  markBody,
  marksOf,
} from './parameters';

const EPSILON = 1e-9;
const KNOWN_OPTIONS = new Set(['marks', 'timeLimit']);
const rule = (path: string, message: string): ValidationIssue => ({
  path,
  code: 'MODALITY_RULE',
  message,
});
const format = (value: number) => String(Number(value.toFixed(3))).replace('.', ',');

export function validateTrekkingWorld(world: World): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const options = world.modalityOptions ?? {};
  for (const key of Object.keys(options)) {
    if (!KNOWN_OPTIONS.has(key))
      issues.push(rule(`modalityOptions.${key}`, `opção desconhecida '${key}' para o Trekking`));
  }
  const timeLimit = options.timeLimit;
  if (timeLimit !== undefined && (typeof timeLimit !== 'number' || timeLimit <= 0)) {
    issues.push(rule('modalityOptions.timeLimit', 'deve ser maior que 0'));
  }

  if (world.robots.length !== 1) {
    issues.push(
      rule('robots', `o Trekking exige exatamente 1 robô (encontrados: ${world.robots.length})`),
    );
  }
  world.robots.forEach((robot, i) => {
    if (2 * robot.radius > MAX_ROBOT_SIZE + EPSILON) {
      issues.push(
        rule(
          `robots[${i}].radius`,
          `diâmetro de ${format(2 * robot.radius)} m excede o cubo de 0,5 m (Art. 2.4)`,
        ),
      );
    }
  });

  const marks = marksOf(options);
  if (!marks) {
    issues.push(
      rule('modalityOptions.marks', 'informe os centros dos 4 marcos como [[x, y], …] (Art. 4.1)'),
    );
    return issues;
  }
  const hw = world.arena.width / 2;
  const hh = world.arena.height / 2;
  marks.forEach(([x, y], i) => {
    if (Math.abs(x) + MARK_SIZE / 2 > hw + EPSILON || Math.abs(y) + MARK_SIZE / 2 > hh + EPSILON) {
      issues.push(
        rule(
          `modalityOptions.marks[${i}]`,
          `o marco ${i + 1} deve ficar inteiramente dentro do campo`,
        ),
      );
    }
  });

  const obstacles = buildStaticBodies({ ...world, arena: { ...world.arena, walls: false } });
  obstacles.forEach((body, o) => {
    marks.forEach(([x, y], i) => {
      if (discPenetration(body, { x, y }, MIN_OBSTACLE_DISTANCE) > EPSILON) {
        issues.push(
          rule(
            `obstacles[${o}]`,
            `obstáculo a menos de 1 m do centro do marco ${i + 1} (Art. 3.7)`,
          ),
        );
      }
    });
  });

  const robot = world.robots[0];
  if (
    robot &&
    discPenetration(markBody(marks[0]!, 0), robot.pose, robot.radius) < -CONTACT_TOLERANCE
  ) {
    issues.push(rule('robots[0].pose', 'o robô deve partir tocando o marco 1 (Art. 4.2)'));
  }
  return issues;
}
