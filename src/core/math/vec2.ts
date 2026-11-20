/** Vetor/ponto 2D imutável, em metros. */
export type Vec2 = { readonly x: number; readonly y: number };

export const vec2 = (x: number, y: number): Vec2 => ({ x, y });

export const add = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x + b.x, y: a.y + b.y });
export const sub = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x - b.x, y: a.y - b.y });
export const scale = (a: Vec2, k: number): Vec2 => ({ x: a.x * k, y: a.y * k });
export const dot = (a: Vec2, b: Vec2): number => a.x * b.x + a.y * b.y;
export const cross = (a: Vec2, b: Vec2): number => a.x * b.y - a.y * b.x;
export const length = (a: Vec2): number => Math.hypot(a.x, a.y);
export const distance = (a: Vec2, b: Vec2): number => Math.hypot(a.x - b.x, a.y - b.y);

/** Rotaciona `a` por `angle` radianos (sentido anti-horário). */
export const rotate = (a: Vec2, angle: number): Vec2 => {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return { x: a.x * c - a.y * s, y: a.x * s + a.y * c };
};

/** Vetor unitário na direção `angle`. */
export const fromAngle = (angle: number): Vec2 => ({ x: Math.cos(angle), y: Math.sin(angle) });

/** Converte um ponto do referencial local (pose) para o referencial do mundo. */
export const localToWorld = (pose: { x: number; y: number; theta: number }, local: Vec2): Vec2 =>
  add({ x: pose.x, y: pose.y }, rotate(local, pose.theta));

/** Converte um ponto do mundo para o referencial local de uma pose. */
export const worldToLocal = (pose: { x: number; y: number; theta: number }, world: Vec2): Vec2 =>
  rotate(sub(world, { x: pose.x, y: pose.y }), -pose.theta);
