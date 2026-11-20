// Catálogo de erros do arquivo de mundo (contracts/world-file.md; FR-002, FR-003).
import { describe, expect, it } from 'vitest';
import {
  createModalityRegistry,
  formatIssues,
  loadWorld,
  validateWorld,
  type ValidationIssue,
} from 'src/core';
import { robotData, worldData } from '../../../helpers';

const errorsOf = (
  data: unknown,
  modalities?: Parameters<typeof validateWorld>[1],
): ValidationIssue[] => {
  const result = validateWorld(data, modalities);
  return result.ok ? [] : result.errors;
};
const codes = (data: unknown) => errorsOf(data).map((e) => `${e.path}:${e.code}`);

describe('catálogo de erros', () => {
  it('REQUIRED e INVALID_TYPE', () => {
    expect(codes({ arena: { width: 1, height: 1 } })).toEqual([
      ':REQUIRED'.replace(':', 'version:'),
    ]);
    expect(codes(worldData({ arena: { width: '2', height: 2 } }))).toEqual([
      'arena.width:INVALID_TYPE',
    ]);
    expect(errorsOf(worldData({ seed: 1.5 }))[0]!.message).toContain('inteiro');
    expect(codes(worldData({ robots: {} }))).toEqual(['robots:INVALID_TYPE']);
    expect(codes([])).toEqual([':INVALID_TYPE']);
  });

  it('OUT_OF_RANGE com mensagens de intervalo', () => {
    const errors = errorsOf(
      worldData({
        dt: 0.5,
        floor: { reflectance: 1.5 },
        robots: [
          robotData({ sensors: [{ id: 'l', type: 'laser', rays: 0, fov: 7, maxRange: 1 }] }),
        ],
      }),
    );
    expect(errors.map((e) => [e.path, e.code, e.message])).toEqual([
      ['dt', 'OUT_OF_RANGE', 'deve ser menor ou igual a 0.1'],
      ['floor.reflectance', 'OUT_OF_RANGE', 'deve ser menor ou igual a 1'],
      ['robots[0].sensors[0].fov', 'OUT_OF_RANGE', expect.stringContaining('menor ou igual')],
      ['robots[0].sensors[0].rays', 'OUT_OF_RANGE', 'deve ser maior ou igual a 1'],
    ]);
  });

  it('INVALID_FORMAT para cores e identificadores', () => {
    expect(codes(worldData({ robots: [robotData({ id: 'r 1', color: 'vermelho' })] }))).toEqual([
      'robots[0].color:INVALID_FORMAT',
      'robots[0].id:INVALID_FORMAT',
    ]);
  });

  it('UNKNOWN_TYPE para obstáculo e região, REQUIRED para type ausente', () => {
    expect(
      codes(
        worldData({
          obstacles: [{ id: 'o', type: 'cone' }],
          floor: { regions: [{ reflectance: 1 }] },
        }),
      ),
    ).toEqual(['floor.regions[0].type:REQUIRED', 'obstacles[0].type:UNKNOWN_TYPE']);
    expect(errorsOf(worldData({ obstacles: [{ id: 'o', type: 'cone' }] }))[0]!.message).toBe(
      "tipo de obstáculo desconhecido 'cone'; use wall, box, disc",
    );
  });

  it('INVALID_GEOMETRY', () => {
    expect(
      codes(
        worldData({
          obstacles: [{ id: 'w', type: 'wall', from: [1, 1], to: [1, 1] }],
          floor: {
            regions: [
              { type: 'ring', center: [0, 0], innerRadius: 0.5, outerRadius: 0.4, reflectance: 1 },
              { type: 'line', points: [[0, 0]], width: 0.1, reflectance: 1 },
            ],
          },
        }),
      ),
    ).toEqual([
      'floor.regions[0]:INVALID_GEOMETRY',
      'floor.regions[1]:INVALID_GEOMETRY',
      'obstacles[0]:INVALID_GEOMETRY',
    ]);
  });

  it('bumper com setor inválido', () => {
    expect(
      codes(
        worldData({
          robots: [robotData({ sensors: [{ id: 'b', type: 'bumper', from: 1, to: 0 }] })],
        }),
      ),
    ).toEqual(['robots[0].sensors[0]:OUT_OF_RANGE']);
  });

  it('UNSUPPORTED_VERSION', () => {
    expect(codes(worldData({ version: 2 }))).toEqual(['version:UNSUPPORTED_VERSION']);
  });

  it('DUPLICATE_ID entre obstáculos e sensores', () => {
    expect(
      codes(
        worldData({
          obstacles: [
            { id: 'o', type: 'disc', center: [3, 3], radius: 0.1 },
            { id: 'o', type: 'disc', center: [-3, 3], radius: 0.1 },
          ],
          robots: [
            robotData({
              sensors: [
                { id: 's', type: 'floor', position: [0, 0] },
                { id: 's', type: 'floor', position: [0, 0] },
              ],
            }),
          ],
        }),
      ),
    ).toEqual(['obstacles[1].id:DUPLICATE_ID', 'robots[0].sensors[1].id:DUPLICATE_ID']);
  });

  it('UNKNOWN_MODALITY e regras da modalidade registrada', () => {
    expect(codes(worldData({ modality: 'sumo' }))).toEqual(['modality:UNKNOWN_MODALITY']);
    const registry = createModalityRegistry([
      {
        id: 'sumo',
        name: 'Sumô',
        validateWorld: () => [{ path: 'robots', code: 'MODALITY_RULE', message: 'exige 2 robôs' }],
        createReferee: () => ({
          evaluate: () => ({ phase: 'running', winner: null, reason: null, score: {} }),
        }),
      },
    ]);
    expect(errorsOf(worldData({ modality: 'sumo' }), { modalities: registry })).toEqual([
      { path: 'robots', code: 'MODALITY_RULE', message: 'exige 2 robôs' },
    ]);
    expect(() => createModalityRegistry([registry.get('sumo')!, registry.get('sumo')!])).toThrow(
      /mais de uma vez/,
    );
  });

  it('OUT_OF_ARENA com e sem paredes', () => {
    const arena = (walls: boolean, x: number) =>
      worldData({
        arena: { width: 2, height: 2, walls },
        robots: [robotData({ pose: { x, y: 0, theta: 0 } })],
      });
    expect(codes(arena(false, 0.95))).toEqual([]);
    expect(codes(arena(true, 0.95))).toEqual(['robots[0].pose:OUT_OF_ARENA']);
    expect(codes(arena(false, 1.2))).toEqual(['robots[0].pose:OUT_OF_ARENA']);
  });

  it('encostar não é sobreposição; caixa e parede contam como obstáculo', () => {
    const touching = worldData({
      obstacles: [{ id: 'w', type: 'wall', from: [0.1, -1], to: [0.1, 1] }],
      robots: [robotData(), robotData({ id: 'r2', pose: { x: -0.2, y: 0, theta: 0 } })],
    });
    expect(codes(touching)).toEqual([]);
    const overlapping = worldData({
      obstacles: [{ id: 'b', type: 'box', center: [0, 0], width: 0.1, height: 0.1 }],
      robots: [robotData()],
    });
    expect(codes(overlapping)).toEqual(['robots[0].pose:INITIAL_OVERLAP']);
  });

  it('formatIssues usa (raiz) para erros sem caminho', () => {
    const result = loadWorld('{');
    expect(result.ok).toBe(false);
    if (!result.ok)
      expect(formatIssues(result.errors)).toMatch(/^\(raiz\): JSON inválido na linha 1/);
  });

  it('JSON vazio informa linha e coluna', () => {
    const result = loadWorld('');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[0]!.message).toMatch(/linha 1, coluna 1/);
  });
});
