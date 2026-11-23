/** Regras do Seguidor de Linha verificadas ao carregar o mundo (spec 006, US2; FR-006). */
import type { ValidationIssue, World } from '../../core/index';
import {
  LINE_WIDTH,
  LINE_WIDTH_TOLERANCE,
  MAX_ROBOT_SIZE,
  MAX_START_OFFSET,
  MIN_EDGE_DISTANCE,
  MIN_TURN_RADIUS,
  type LineFollowerCategory,
} from './categories';
import { minTurnRadius, trackFromPoints, trackRegionOf } from './track';

const EPSILON = 1e-9;
const KNOWN_OPTIONS = new Set(['timeLimit']);
const rule = (path: string, message: string): ValidationIssue => ({
  path,
  code: 'MODALITY_RULE',
  message,
});
const format = (value: number) => String(Number(value.toFixed(3))).replace('.', ',');

export function validateLineFollowerWorld(
  world: World,
  category: LineFollowerCategory,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const [key, value] of Object.entries(world.modalityOptions ?? {})) {
    if (!KNOWN_OPTIONS.has(key))
      issues.push(
        rule(`modalityOptions.${key}`, `opção desconhecida '${key}' para o Seguidor de Linha`),
      );
    else if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0)
      issues.push(rule(`modalityOptions.${key}`, 'deve ser maior que 0'));
  }

  if (world.robots.length !== 1) {
    issues.push(
      rule(
        'robots',
        `o Seguidor de Linha exige exatamente 1 robô (encontrados: ${world.robots.length})`,
      ),
    );
  }
  world.robots.forEach((robot, i) => {
    if (2 * robot.radius > MAX_ROBOT_SIZE + EPSILON) {
      issues.push(
        rule(
          `robots[${i}].radius`,
          `diâmetro de ${format(2 * robot.radius)} m excede o limite de 0,25 m (Art. 3.2)`,
        ),
      );
    }
  });

  const region = trackRegionOf(world);
  if (!region) {
    issues.push(
      rule(
        'floor.regions',
        'a pista deve ser uma região "line" branca (refletância > 0,5) no piso',
      ),
    );
    return issues;
  }
  const path = `floor.regions[${region.index}]`;
  const track = trackFromPoints(region.points);
  if (!track.closed)
    issues.push(
      rule(`${path}.points`, 'a pista deve ser fechada (último ponto igual ao primeiro)'),
    );
  if (Math.abs(region.width - LINE_WIDTH) > LINE_WIDTH_TOLERANCE + EPSILON) {
    issues.push(
      rule(
        `${path}.width`,
        `a linha deve ter 19 ± 1 mm de largura (Art. 4.4); encontrado ${format(region.width * 1000)} mm`,
      ),
    );
  }
  const radius = minTurnRadius(region.points);
  if (radius < MIN_TURN_RADIUS - 1e-6) {
    issues.push(
      rule(
        `${path}.points`,
        `curva de raio ${format(radius)} m menor que o mínimo de 0,1 m (Art. 4.14)`,
      ),
    );
  }
  if (track.length > category.maxTrackLength + EPSILON) {
    issues.push(
      rule(
        `${path}.points`,
        `pista de ${format(track.length)} m excede ${category.maxTrackLength} m da categoria (Art. 4.4)`,
      ),
    );
  }
  const hw = world.arena.width / 2;
  const hh = world.arena.height / 2;
  if (
    region.points.some(
      ([x, y]) =>
        Math.abs(x) > hw - MIN_EDGE_DISTANCE + EPSILON ||
        Math.abs(y) > hh - MIN_EDGE_DISTANCE + EPSILON,
    )
  ) {
    issues.push(
      rule(
        `${path}.points`,
        'a linha deve ficar a pelo menos 0,2 m das bordas da pista (Art. 4.11)',
      ),
    );
  }
  const robot = world.robots[0];
  const [sx, sy] = region.points[0]!;
  if (robot && Math.hypot(robot.pose.x - sx, robot.pose.y - sy) > MAX_START_OFFSET + EPSILON) {
    issues.push(
      rule(
        'robots[0].pose',
        'o robô deve começar sobre a linha de partida (primeiro ponto da pista)',
      ),
    );
  }
  return issues;
}
