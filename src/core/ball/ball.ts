/**
 * Bola: corpo passivo com velocidade própria (spec 008, US1; plan 008, D-02 e D-03).
 * Desacelera a taxa constante (atrito de rolamento), quica em corpos estáticos e é
 * impulsionada pelos robôs, que são tratados como muito mais pesados que a bola.
 */
import { closestPointOnBody, type StaticBody } from '../collision/staticBodies';
import type { BallSpec } from '../world/schema';

export type BallRuntime = {
  readonly spec: BallSpec;
  x: number;
  y: number;
  vx: number;
  vy: number;
};

export type MovingDisc = { x: number; y: number; radius: number; vx: number; vy: number };

export const createBall = (spec: BallSpec): BallRuntime => ({
  spec,
  x: spec.position[0],
  y: spec.position[1],
  vx: 0,
  vy: 0,
});

/** Avança a bola por `h` segundos com desaceleração constante exata. */
export function integrateBall(ball: BallRuntime, h: number): void {
  const speed = Math.hypot(ball.vx, ball.vy);
  if (speed === 0) return;
  const ux = ball.vx / speed;
  const uy = ball.vy / speed;
  const a = ball.spec.friction;
  if (a > 0 && speed <= a * h) {
    const distance = (speed * speed) / (2 * a);
    ball.x += ux * distance;
    ball.y += uy * distance;
    ball.vx = 0;
    ball.vy = 0;
    return;
  }
  const distance = speed * h - 0.5 * a * h * h;
  ball.x += ux * distance;
  ball.y += uy * distance;
  const next = speed - a * h;
  ball.vx = ux * next;
  ball.vy = uy * next;
}

/** Reflete a componente normal da velocidade relativa, se a bola se aproxima. */
function bounce(ball: BallRuntime, nx: number, ny: number, surfaceVx = 0, surfaceVy = 0): void {
  const relative = (ball.vx - surfaceVx) * nx + (ball.vy - surfaceVy) * ny;
  if (relative >= 0) return;
  const impulse = (1 + ball.spec.restitution) * relative;
  ball.vx -= impulse * nx;
  ball.vy -= impulse * ny;
}

/** Afasta a bola de paredes e obstáculos e quica (D-03). */
export function collideBallWithBodies(ball: BallRuntime, bodies: readonly StaticBody[]): void {
  const r = ball.spec.radius;
  for (const body of bodies) {
    const { point, inside } = closestPointOnBody(body, ball);
    const dx = ball.x - point.x;
    const dy = ball.y - point.y;
    const d = Math.hypot(dx, dy);
    if (!inside && d >= r) continue;
    let nx = inside ? -dx : dx;
    let ny = inside ? -dy : dy;
    const length = Math.hypot(nx, ny);
    if (length < 1e-12) {
      // Centro exatamente sobre a superfície: usa o sentido oposto ao movimento.
      const speed = Math.hypot(ball.vx, ball.vy) || 1;
      nx = -ball.vx / speed || 1;
      ny = -ball.vy / speed;
    } else {
      nx /= length;
      ny /= length;
    }
    ball.x = point.x + nx * r;
    ball.y = point.y + ny * r;
    bounce(ball, nx, ny);
  }
}

/**
 * Depois de a bola ser contida por paredes, um robô que ainda a sobrepõe é que recua:
 * bola presa contra a parede age como obstáculo (D-03). Devolve as correções por robô.
 */
export function blockRobotsByBall(
  ball: BallRuntime,
  robots: readonly MovingDisc[],
): { dx: number; dy: number }[] {
  return robots.map((robot) => {
    const dx = robot.x - ball.x;
    const dy = robot.y - ball.y;
    const d = Math.hypot(dx, dy);
    const overlap = ball.spec.radius + robot.radius - d;
    if (overlap <= 0 || d < 1e-12) return { dx: 0, dy: 0 };
    return { dx: (dx / d) * overlap, dy: (dy / d) * overlap };
  });
}

/** Afasta a bola dos robôs e aplica o impulso do choque (D-03). */
export function collideBallWithRobots(ball: BallRuntime, robots: readonly MovingDisc[]): void {
  for (const robot of robots) {
    const dx = ball.x - robot.x;
    const dy = ball.y - robot.y;
    const d = Math.hypot(dx, dy);
    const overlap = ball.spec.radius + robot.radius - d;
    if (overlap <= 0) continue;
    const nx = d < 1e-12 ? 1 : dx / d;
    const ny = d < 1e-12 ? 0 : dy / d;
    ball.x += nx * overlap;
    ball.y += ny * overlap;
    bounce(ball, nx, ny, robot.vx, robot.vy);
  }
}
