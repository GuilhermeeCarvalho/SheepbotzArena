/**
 * Regras do Sumô verificadas ao carregar o mundo (spec 004, US3; FR-006).
 * Fonte: Art. 4 (dimensões) e Art. 10 (posicionamento) de docs/references/robocore/sumo.md.
 */
import type { ValidationIssue, World } from '../../core/index';
import type { SumoCategory } from './categories';

const EPSILON = 1e-9;
const KNOWN_OPTIONS = new Set(['roundTimeLimit']);

const rule = (path: string, message: string): ValidationIssue => ({ path, code: 'MODALITY_RULE', message });

const format = (value: number) => String(Number(value.toFixed(4))).replace('.', ',');

export function validateSumoWorld(world: World, category: SumoCategory): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const [key, value] of Object.entries(world.modalityOptions ?? {})) {
    if (!KNOWN_OPTIONS.has(key)) {
      issues.push(rule(`modalityOptions.${key}`, `opção desconhecida '${key}' para o Sumô`));
    } else if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
      issues.push(rule(`modalityOptions.${key}`, 'deve ser maior que 0'));
    }
  }

  if (world.robots.length !== 2) {
    issues.push(rule('robots', `a partida de Sumô exige exatamente 2 robôs (encontrados: ${world.robots.length})`));
  }

  const minDistanceFromCenter = category.shikiriOffset - category.shikiriWidth / 2;
  world.robots.forEach((robot, i) => {
    const diameter = 2 * robot.radius;
    if (diameter > category.maxRobotSize + EPSILON) {
      issues.push(
        rule(
          `robots[${i}].radius`,
          `diâmetro de ${format(diameter)} m excede o limite de ${format(category.maxRobotSize)} m da categoria (Art. 4)`,
        ),
      );
    }
    if (category.maxRobotMass !== null && robot.mass > category.maxRobotMass + EPSILON) {
      issues.push(
        rule(
          `robots[${i}].mass`,
          `massa de ${format(robot.mass)} kg excede o limite de ${format(category.maxRobotMass)} kg da categoria`,
        ),
      );
    }
    const { x, y } = robot.pose;
    if (Math.abs(x) - robot.radius < minDistanceFromCenter - EPSILON) {
      issues.push(rule(`robots[${i}].pose`, 'o robô ultrapassa a Shikiri-sen (Art. 10)'));
    } else if (Math.abs(y) - robot.radius > category.shikiriLength / 2 + EPSILON) {
      issues.push(rule(`robots[${i}].pose`, 'o robô está fora da extensão da Shikiri-sen (Art. 10)'));
    }
  });

  if (world.robots.length === 2) {
    const [a, b] = world.robots;
    if (Math.sign(a!.pose.x) === Math.sign(b!.pose.x)) {
      issues.push(rule('robots', 'os robôs devem começar em lados opostos da Shikiri-sen (Art. 10)'));
    }
  }
  return issues;
}
