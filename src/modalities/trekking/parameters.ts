/**
 * Parâmetros do Trekking (spec 007, "Parâmetros").
 * Fonte: docs/references/robocore/trekking.md (RoboCore, revisão 20/12/2023).
 */
export const TREKKING_MODALITY_ID = 'trekking';
/** Número de marcos — Art. 4.1. */
export const MARK_COUNT = 4;
/** Lado do marco (m) — Art. 3.4 ("aproximadamente 1000 mm × 1000 mm"). */
export const MARK_SIZE = 1;
/** Distância mínima entre obstáculos e o centro dos marcos (m) — Art. 3.7. */
export const MIN_OBSTACLE_DISTANCE = 1;
/** Aresta do cubo que limita o robô (m) — Art. 2.4. */
export const MAX_ROBOT_SIZE = 0.5;
/** Tolerância para iniciar o movimento (s) — Art. 4.13. */
export const FALSE_START_TIME = 30;
/** Deslocamento abaixo do qual o robô é considerado parado (m) — hipótese H-07. */
export const STILL_DISTANCE = 0.02;
/** Duração da partida (s) — Art. 4.17; usada como limite da tomada de tempo (H-06). */
export const DEFAULT_TIME_LIMIT = 600;
/** Marco mínimo para elegibilidade à premiação — Art. 4.19. */
export const ELIGIBLE_MARK = 2;
/** Tolerância de contato (m). */
export const CONTACT_TOLERANCE = 1e-6;

export type MarkCenter = [number, number];

export const marksOf = (options: Record<string, unknown> | undefined): MarkCenter[] | null => {
  const marks = options?.marks;
  if (!Array.isArray(marks) || marks.length !== MARK_COUNT) return null;
  const valid = marks.every(
    (m) =>
      Array.isArray(m) &&
      m.length === 2 &&
      m.every((v) => typeof v === 'number' && Number.isFinite(v)),
  );
  return valid ? (marks as MarkCenter[]) : null;
};

export const timeLimitOf = (options: Record<string, unknown> | undefined): number =>
  typeof options?.timeLimit === 'number' ? options.timeLimit : DEFAULT_TIME_LIMIT;

/** Corpo do marco como caixa, para testar contato com o disco do robô. */
export const markBody = (center: MarkCenter, index: number) => ({
  kind: 'box' as const,
  id: `marco-${index + 1}`,
  box: { center: { x: center[0], y: center[1] }, width: MARK_SIZE, height: MARK_SIZE, angle: 0 },
});
