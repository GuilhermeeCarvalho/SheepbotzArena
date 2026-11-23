/**
 * Regras semânticas do mundo (contracts/world-file.md, "Regras semânticas").
 * `findDuplicateIds` roda sobre o dado bruto, mesmo com erros de esquema; as demais regras
 * dependem de um mundo estruturalmente válido.
 */
import { buildStaticBodies, discPenetration } from '../collision/staticBodies';
import { distance } from '../math/vec2';
import type { ModalityRegistry } from '../modality/contract';
import { type ValidationIssue, issue } from './issues';
import type { World } from './schema';

/** Sobreposição tolerada: encostar é permitido (research D-06). */
export const OVERLAP_TOLERANCE = 1e-6;

const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);
const idOf = (value: unknown): string | undefined =>
  value !== null && typeof value === 'object' && typeof (value as { id?: unknown }).id === 'string'
    ? (value as { id: string }).id
    : undefined;

function duplicatesIn(
  items: unknown[],
  basePath: (index: number) => (string | number)[],
): ValidationIssue[] {
  const seen = new Set<string>();
  const issues: ValidationIssue[] = [];
  items.forEach((item, index) => {
    const id = idOf(item);
    if (id === undefined) return;
    if (seen.has(id))
      issues.push(
        issue([...basePath(index), 'id'], 'DUPLICATE_ID', `identificador '${id}' repetido`),
      );
    seen.add(id);
  });
  return issues;
}

/** Ids repetidos entre robôs, entre obstáculos e entre sensores do mesmo robô. */
export function findDuplicateIds(data: unknown): ValidationIssue[] {
  if (data === null || typeof data !== 'object') return [];
  const root = data as { robots?: unknown; obstacles?: unknown };
  const robots = asArray(root.robots);
  const issues = [
    ...duplicatesIn(robots, (i) => ['robots', i]),
    ...duplicatesIn(asArray(root.obstacles), (i) => ['obstacles', i]),
    ...duplicatesIn(asArray((root as { balls?: unknown }).balls), (i) => ['balls', i]),
  ];
  robots.forEach((robot, r) => {
    const sensors =
      robot !== null && typeof robot === 'object'
        ? (robot as { sensors?: unknown }).sensors
        : undefined;
    issues.push(...duplicatesIn(asArray(sensors), (s) => ['robots', r, 'sensors', s]));
  });
  return issues;
}

/** Modalidade desconhecida, robô fora da arena e sobreposição inicial. */
export function checkWorldSemantics(world: World, modalities: ModalityRegistry): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (world.modality !== undefined) {
    const modality = modalities.get(world.modality);
    if (modality === undefined) {
      issues.push(
        issue(['modality'], 'UNKNOWN_MODALITY', `modalidade desconhecida '${world.modality}'`),
      );
    } else {
      issues.push(...modality.validateWorld(world));
    }
  }

  const hw = world.arena.width / 2;
  const hh = world.arena.height / 2;
  const bodies = buildStaticBodies(world);
  const obstacleIndex = new Map(world.obstacles.map((o, i) => [o.id, i]));

  world.robots.forEach((robot, i) => {
    const { x, y } = robot.pose;
    const margin = world.arena.walls ? robot.radius : 0;
    if (
      Math.abs(x) > hw - margin + OVERLAP_TOLERANCE ||
      Math.abs(y) > hh - margin + OVERLAP_TOLERANCE
    ) {
      issues.push(
        issue(['robots', i, 'pose'], 'OUT_OF_ARENA', `robô '${robot.id}' começa fora da arena`),
      );
      return;
    }
    for (const body of bodies) {
      if (discPenetration(body, { x, y }, robot.radius) > OVERLAP_TOLERANCE) {
        const index = obstacleIndex.get(body.id);
        if (index === undefined) continue; // bordas da arena já cobertas pela regra acima
        issues.push(
          issue(
            ['robots', i, 'pose'],
            'INITIAL_OVERLAP',
            `robô '${robot.id}' começa sobreposto a obstacles[${index}] ('${body.id}')`,
          ),
        );
      }
    }
    for (let j = 0; j < i; j++) {
      const other = world.robots[j]!;
      const gap =
        distance({ x, y }, { x: other.pose.x, y: other.pose.y }) - robot.radius - other.radius;
      if (gap < -OVERLAP_TOLERANCE) {
        issues.push(
          issue(
            ['robots', i, 'pose'],
            'INITIAL_OVERLAP',
            `robô '${robot.id}' começa sobreposto a robots[${j}] ('${other.id}')`,
          ),
        );
      }
    }
  });

  return issues;
}
