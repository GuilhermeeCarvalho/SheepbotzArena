/**
 * Parâmetros do Seguidor de Linha (spec 006, "Categorias e parâmetros").
 * Fonte: docs/references/robocore/seguidor-de-linha.md (RoboCore, revisão 03/09/2024).
 */
export type LineFollowerCategoryId = 'pro' | 'junior';

export type LineFollowerCategory = {
  readonly id: LineFollowerCategoryId;
  readonly modalityId: `seguidor-${LineFollowerCategoryId}`;
  readonly name: string;
  /** Comprimento máximo da linha (m) — Art. 4.4. */
  readonly maxTrackLength: number;
};

export const LINE_FOLLOWER_CATEGORIES: Readonly<
  Record<LineFollowerCategoryId, LineFollowerCategory>
> = {
  pro: { id: 'pro', modalityId: 'seguidor-pro', name: 'Seguidor de Linha Pro', maxTrackLength: 60 },
  junior: {
    id: 'junior',
    modalityId: 'seguidor-junior',
    name: 'Seguidor de Linha Júnior',
    maxTrackLength: 20,
  },
};

/** Largura nominal da linha branca e tolerância (m) — Art. 4.4. */
export const LINE_WIDTH = 0.019;
export const LINE_WIDTH_TOLERANCE = 0.001;
/** Raio mínimo das curvas (m) — Art. 4.14. */
export const MIN_TURN_RADIUS = 0.1;
/** Distância mínima da linha às bordas da pista (m) — Art. 4.11. */
export const MIN_EDGE_DISTANCE = 0.2;
/** A chegada fica 1 m antes da partida, no sentido do percurso (m) — Art. 4.7. */
export const FINISH_BEFORE_START = 1;
/** Meia largura da área de partida-chegada (m) — Art. 4.8. */
export const START_AREA_HALF_WIDTH = 0.2;
/** Largura e comprimento máximos do robô (m) — Art. 3.2. */
export const MAX_ROBOT_SIZE = 0.25;
/** Tempo máximo da tomada de tempo (s) — Art. 5.3. */
export const DEFAULT_TIME_LIMIT = 300;
/** Tempo parado na área para validar a volta (s) — Art. 5.7. */
export const STOP_DURATION = 2;
/** Distância máxima entre o robô e a linha de partida no início (m) — hipótese. */
export const MAX_START_OFFSET = 0.05;
/** Marcações laterais: tamanho e afastamento à direita da linha (m) — hipótese H-05. */
export const MARK_LENGTH = 0.04;
export const MARK_WIDTH = 0.02;
export const MARK_OFFSET = 0.06;

export const timeLimitOf = (options: Record<string, unknown> | undefined): number =>
  typeof options?.timeLimit === 'number' ? options.timeLimit : DEFAULT_TIME_LIMIT;
