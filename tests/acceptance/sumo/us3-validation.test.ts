// Spec 004 — US3: validar a montagem pelas regras da categoria (FR-006; Art. 4 e 10).
import { describe, expect, it } from 'vitest';
import { validateWorld, type ValidationIssue } from 'src/core';
import { modalityRegistry } from 'src/modalities';
import { miniRobot, sumoWorld } from './helpers';

const PI = Math.PI;
const errorsOf = (world: unknown): ValidationIssue[] => {
  const result = validateWorld(world, { modalities: modalityRegistry });
  return result.ok ? [] : result.errors;
};
const pair = (a: Record<string, unknown> = {}, b: Record<string, unknown> = {}) => [
  miniRobot('A', -0.2, 0, a),
  miniRobot('B', 0.2, PI, b),
];

describe('US3 — validação do Sumô', () => {
  it('mundo válido não tem erros', () => {
    expect(errorsOf(sumoWorld('sumo-mini', pair()))).toEqual([]);
  });

  it.each([[1], [3]])('US3-AC1: %i robôs → exige exatamente 2', (count) => {
    const robots = [miniRobot('A', -0.2, 0), miniRobot('B', 0.2, PI), miniRobot('C', 0.2, PI, { pose: { x: -0.2, y: 0.3, theta: 0 } })].slice(0, count);
    const errors = errorsOf(sumoWorld('sumo-mini', robots));
    expect(errors).toContainEqual({
      path: 'robots',
      code: 'MODALITY_RULE',
      message: `a partida de Sumô exige exatamente 2 robôs (encontrados: ${count})`,
    });
  });

  it('US3-AC2: diâmetro 0,12 m > 0,10 m cita o Art. 4', () => {
    const errors = errorsOf(sumoWorld('sumo-mini', pair({ radius: 0.06 })));
    expect(errors).toEqual([
      {
        path: 'robots[0].radius',
        code: 'MODALITY_RULE',
        message: 'diâmetro de 0,12 m excede o limite de 0,1 m da categoria (Art. 4)',
      },
    ]);
  });

  it('US3-AC3: massa 0,6 kg > 0,5 kg', () => {
    expect(errorsOf(sumoWorld('sumo-mini', pair({}, { mass: 0.6 })))).toEqual([
      { path: 'robots[1].mass', code: 'MODALITY_RULE', message: 'massa de 0,6 kg excede o limite de 0,5 kg da categoria' },
    ]);
  });

  it('US3-AC4: robô que ultrapassa a Shikiri-sen', () => {
    const errors = errorsOf(sumoWorld('sumo-mini', pair({ pose: { x: -0.03, y: 0, theta: 0 } })));
    expect(errors).toContainEqual({
      path: 'robots[0].pose',
      code: 'MODALITY_RULE',
      message: 'o robô ultrapassa a Shikiri-sen (Art. 10)',
    });
  });

  it('US3-AC5: robô fora da extensão da Shikiri-sen', () => {
    expect(errorsOf(sumoWorld('sumo-mini', pair({ pose: { x: -0.2, y: 0.11, theta: 0 } })))).toEqual([
      { path: 'robots[0].pose', code: 'MODALITY_RULE', message: 'o robô está fora da extensão da Shikiri-sen (Art. 10)' },
    ]);
    // encostar na extensão é permitido (Art. 10)
    expect(errorsOf(sumoWorld('sumo-mini', pair({ pose: { x: -0.2, y: 0.1, theta: 0 } })))).toEqual([]);
  });

  it('US3-AC6: os dois robôs do mesmo lado', () => {
    const errors = errorsOf(sumoWorld('sumo-mini', [miniRobot('A', -0.2, 0), miniRobot('B', -0.35, 0)]));
    expect(errors).toContainEqual({
      path: 'robots',
      code: 'MODALITY_RULE',
      message: 'os robôs devem começar em lados opostos da Shikiri-sen (Art. 10)',
    });
  });

  it('US3-AC7: roundTimeLimit inválido e opção desconhecida', () => {
    const errors = errorsOf(sumoWorld('sumo-mini', pair(), { modalityOptions: { roundTimeLimit: 0, rounds: 3 } }));
    expect(errors).toHaveLength(2);
    expect(errors).toContainEqual({ path: 'modalityOptions.roundTimeLimit', code: 'MODALITY_RULE', message: 'deve ser maior que 0' });
    expect(errors).toContainEqual({ path: 'modalityOptions.rounds', code: 'MODALITY_RULE', message: "opção desconhecida 'rounds' para o Sumô" });
  });

  it('US3-AC8: LEGO® aceita diâmetro 0,15 m e não verifica massa', () => {
    const lego = [miniRobot('A', -0.2, 0, { radius: 0.075, mass: 5 }), miniRobot('B', 0.2, PI, { radius: 0.075, mass: 5 })];
    expect(errorsOf(sumoWorld('sumo-lego', lego))).toEqual([]);
    const tooBig = [miniRobot('A', -0.2, 0, { radius: 0.08 }), miniRobot('B', 0.2, PI)];
    expect(errorsOf(sumoWorld('sumo-lego', tooBig))[0]!.path).toBe('robots[0].radius');
  });

  it('Mega Sumô usa os próprios limites (0,20 m e 3 kg)', () => {
    const mega = [
      miniRobot('A', -0.3, 0, { radius: 0.1, mass: 3 }),
      miniRobot('B', 0.3, PI, { radius: 0.1, mass: 3.2 }),
    ];
    expect(errorsOf(sumoWorld('sumo-mega', mega, { arena: { width: 3.6, height: 3.6 } }))).toEqual([
      { path: 'robots[1].mass', code: 'MODALITY_RULE', message: 'massa de 3,2 kg excede o limite de 3 kg da categoria' },
    ]);
  });
});
