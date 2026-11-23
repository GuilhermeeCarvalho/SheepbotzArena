/**
 * Parâmetros oficiais das categorias de Sumô (spec 004, "Categorias e parâmetros").
 * Fonte: docs/references/robocore/sumo.md (RoboCore, revisão 11/08/2025).
 */
export type SumoCategoryId = 'mega' | 'mini' | 'lego';

export type SumoCategory = {
  readonly id: SumoCategoryId;
  readonly modalityId: `sumo-${SumoCategoryId}`;
  readonly name: string;
  /** Raio do Dohyo, incluindo a Tawara (m) — Art. 3. */
  readonly dohyoRadius: number;
  /** Largura da Tawara, medida para dentro a partir da borda (m) — Art. 3. */
  readonly tawaraWidth: number;
  /** Distância do centro do Dohyo ao centro de cada linha Shikiri-sen (m) — Art. 3. */
  readonly shikiriOffset: number;
  /** Largura da linha Shikiri-sen (m) — Art. 3. */
  readonly shikiriWidth: number;
  /** Comprimento da linha Shikiri-sen (m) — Art. 3. */
  readonly shikiriLength: number;
  /** Lado do Yochi, a área quadrada em torno do Dohyo (m) — Art. 3. */
  readonly yochiSize: number;
  /** Largura e comprimento máximos do robô (m) — Art. 4. */
  readonly maxRobotSize: number;
  /** Massa máxima (kg), pelo nome da categoria; `null` quando a referência não define. */
  readonly maxRobotMass: number | null;
  /** Espera obrigatória antes de se mover (s) — Nota 11 (só LEGO®). */
  readonly startDelay: number;
};

export const SUMO_CATEGORIES: Readonly<Record<SumoCategoryId, SumoCategory>> = {
  mega: {
    id: 'mega',
    modalityId: 'sumo-mega',
    name: 'Mega Sumô (3 kg)',
    dohyoRadius: 1.54 / 2,
    tawaraWidth: 0.05,
    shikiriOffset: 0.1,
    shikiriWidth: 0.02,
    shikiriLength: 0.2,
    yochiSize: 3.6,
    maxRobotSize: 0.2,
    maxRobotMass: 3,
    startDelay: 0,
  },
  mini: {
    id: 'mini',
    modalityId: 'sumo-mini',
    name: 'Mini Sumô (500 g)',
    dohyoRadius: 0.77 / 2,
    tawaraWidth: 0.025,
    shikiriOffset: 0.05,
    shikiriWidth: 0.01,
    shikiriLength: 0.1,
    yochiSize: 1.8,
    maxRobotSize: 0.1,
    maxRobotMass: 0.5,
    startDelay: 0,
  },
  lego: {
    id: 'lego',
    modalityId: 'sumo-lego',
    name: 'Sumô LEGO®',
    dohyoRadius: 0.77 / 2,
    tawaraWidth: 0.025,
    shikiriOffset: 0.05,
    shikiriWidth: 0.01,
    shikiriLength: 0.1,
    yochiSize: 1.8,
    maxRobotSize: 0.152,
    maxRobotMass: null,
    startDelay: 5,
  },
};

/** Tempo do round quando não informado (s) — hipótese H-04. */
export const DEFAULT_ROUND_TIME_LIMIT = 60;
/** Deslocamento que caracteriza largada queimada no LEGO® (m) — hipótese H-05. */
export const FALSE_START_DISTANCE = 0.02;
/** Rotação que caracteriza largada queimada no LEGO® (rad) — hipótese H-05. */
export const FALSE_START_ROTATION = 0.05;

/** Tempo limite do round a partir de `modalityOptions` (já validado). */
export const roundTimeLimitOf = (options: Record<string, unknown> | undefined): number =>
  typeof options?.roundTimeLimit === 'number' ? options.roundTimeLimit : DEFAULT_ROUND_TIME_LIMIT;
