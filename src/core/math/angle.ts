const TWO_PI = 2 * Math.PI;

/** Normaliza um ângulo para o intervalo (−π, π] (spec 001, convenções; research D-02). */
export function normalizeAngle(angle: number): number {
  const wrapped = angle - TWO_PI * Math.floor((angle + Math.PI) / TWO_PI);
  return wrapped === -Math.PI ? Math.PI : wrapped;
}

/**
 * Indica se `angle` está no setor [from, to], percorrido no sentido anti-horário.
 * Aceita setores que cruzam ±π. `tolerance` em radianos.
 */
export function isAngleInSector(
  angle: number,
  from: number,
  to: number,
  tolerance = 1e-9,
): boolean {
  const span = to - from;
  if (span >= TWO_PI - tolerance) return true;
  let offset = (angle - from) % TWO_PI;
  if (offset < 0) offset += TWO_PI;
  if (offset <= span + tolerance) return true;
  // Ângulo levemente antes de `from` (por arredondamento).
  return TWO_PI - offset <= tolerance;
}
