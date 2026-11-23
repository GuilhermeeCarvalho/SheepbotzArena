// Spec 004 — parâmetros das categorias (FR-001; Art. 3 e 4, Nota 11).
import { describe, expect, it } from 'vitest';
import { modalityRegistry } from 'src/modalities';
import { isOutOfDohyo, SUMO_CATEGORIES } from 'src/modalities/sumo';
import { roundTimeLimitOf } from 'src/modalities/sumo/categories';

describe('categorias de Sumô', () => {
  it('Mega, Mini e LEGO® com os valores do regulamento', () => {
    expect(SUMO_CATEGORIES.mega).toMatchObject({
      dohyoRadius: 0.77,
      tawaraWidth: 0.05,
      shikiriOffset: 0.1,
      yochiSize: 3.6,
      maxRobotSize: 0.2,
      maxRobotMass: 3,
      startDelay: 0,
    });
    expect(SUMO_CATEGORIES.mini).toMatchObject({
      dohyoRadius: 0.385,
      tawaraWidth: 0.025,
      shikiriOffset: 0.05,
      yochiSize: 1.8,
      maxRobotSize: 0.1,
      maxRobotMass: 0.5,
      startDelay: 0,
    });
    expect(SUMO_CATEGORIES.lego).toMatchObject({
      dohyoRadius: 0.385,
      maxRobotSize: 0.152,
      maxRobotMass: null,
      startDelay: 5,
    });
  });

  it('as três modalidades estão no registro', () => {
    expect([...modalityRegistry.keys()]).toEqual(['sumo-mega', 'sumo-mini', 'sumo-lego']);
    expect(modalityRegistry.get('sumo-mini')!.name).toBe('Mini Sumô (500 g)');
  });

  it('H-01: fora quando o centro passa da borda externa', () => {
    expect(isOutOfDohyo({ x: 0.385, y: 0 }, SUMO_CATEGORIES.mini)).toBe(false);
    expect(isOutOfDohyo({ x: 0.3, y: 0.25 }, SUMO_CATEGORIES.mini)).toBe(true);
  });

  it('tempo limite padrão de 60 s (H-04)', () => {
    expect(roundTimeLimitOf(undefined)).toBe(60);
    expect(roundTimeLimitOf({ roundTimeLimit: 90 })).toBe(90);
  });
});
