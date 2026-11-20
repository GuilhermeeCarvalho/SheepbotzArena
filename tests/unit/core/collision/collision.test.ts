// Colisão, bumper, piso e cinemática (FR-005, FR-006, FR-009, FR-010, FR-015, FR-016).
import { describe, expect, it } from 'vitest';
import { type CollisionDisc, findContacts, resolveCollisions } from 'src/core/collision/resolve';
import { closestPointOnBody, type StaticBody } from 'src/core/collision/staticBodies';
import { integrateArc, saturateCommand } from 'src/core/kinematics/diffDrive';
import { isBumperPressed } from 'src/core/sensors/bumper';
import { floorReflectanceAt } from 'src/core/sensors/floor';
import { rayAngles } from 'src/core/sensors/rangefinder';
import { buildWorld, robotData, worldData } from '../../../helpers';

const disc = (x: number, y: number, radius = 0.1, mass = 1): CollisionDisc => ({
  x,
  y,
  radius,
  mass,
  previous: { x, y },
});
const wall = (x: number): StaticBody => ({
  kind: 'segment',
  id: 'w',
  a: { x, y: -1 },
  b: { x, y: 1 },
});

describe('resolveCollisions', () => {
  it('afasta o disco da parede até encostar', () => {
    const d = disc(0.45, 0);
    resolveCollisions([d], [wall(0.5)]);
    expect(d.x).toBeCloseTo(0.4, 12);
  });

  it('centro exatamente sobre a parede volta para o lado anterior', () => {
    const d = disc(0.5, 0);
    d.previous = { x: 0.45, y: 0 };
    resolveCollisions([d], [wall(0.5)]);
    expect(d.x).toBeCloseTo(0.4, 12);
  });

  it('centro dentro de caixa e de disco sai pelo lado mais próximo', () => {
    const box: StaticBody = {
      kind: 'box',
      id: 'b',
      box: { center: { x: 0, y: 0 }, width: 1, height: 1, angle: 0 },
    };
    const inBox = disc(0.4, 0);
    resolveCollisions([inBox], [box]);
    expect(inBox.x).toBeCloseTo(0.6, 12);
    const pillar: StaticBody = { kind: 'disc', id: 'p', center: { x: 0, y: 0 }, radius: 0.3 };
    const inPillar = disc(0, 0.1);
    resolveCollisions([inPillar], [pillar]);
    expect(Math.hypot(inPillar.x, inPillar.y)).toBeCloseTo(0.4, 12);
  });

  it('centros coincidentes separam ao longo de +x', () => {
    const a = disc(0, 0);
    const b = disc(0, 0);
    resolveCollisions([a, b], []);
    expect(a.x).toBeCloseTo(-0.1, 12);
    expect(b.x).toBeCloseTo(0.1, 12);
  });

  it('robô encurralado: a parede vence e o outro robô é empurrado', () => {
    const pinned = disc(0.4, 0);
    const pusher = disc(0.25, 0, 0.1, 10);
    resolveCollisions([pusher, pinned], [wall(0.5)]);
    expect(pinned.x).toBeLessThanOrEqual(0.4 + 1e-9);
    expect(pinned.x - pusher.x).toBeGreaterThanOrEqual(0.2 - 1e-9);
  });

  it('contatos registram a direção no referencial do mundo', () => {
    const d = disc(0.4, 0);
    const other = disc(0.2, 0);
    const [contacts] = findContacts([d, other], [wall(0.5)]);
    expect(contacts).toHaveLength(2);
    expect(contacts![0]).toBeCloseTo(0, 12);
    expect(Math.abs(contacts![1]!)).toBeCloseTo(Math.PI, 12);
  });

  it('ponto mais próximo de um disco cujo centro coincide com o ponto', () => {
    const pillar: StaticBody = { kind: 'disc', id: 'p', center: { x: 1, y: 1 }, radius: 0.5 };
    expect(closestPointOnBody(pillar, { x: 1, y: 1 })).toEqual({
      point: { x: 1.5, y: 1 },
      inside: true,
    });
  });
});

describe('cinemática', () => {
  it('um passo h equivale a n passos h/n', () => {
    const start = { x: 0.3, y: -0.2, theta: 0.7 };
    const whole = integrateArc(start, 0.8, 1.3, 0.1);
    let split = start;
    for (let i = 0; i < 7; i++) split = integrateArc(split, 0.8, 1.3, 0.1 / 7);
    expect(split.x).toBeCloseTo(whole.x, 12);
    expect(split.y).toBeCloseTo(whole.y, 12);
    expect(split.theta).toBeCloseTo(whole.theta, 12);
  });

  it('satura nos dois sentidos', () => {
    expect(saturateCommand({ v: -3, w: 9 }, 1, 2)).toEqual({ v: -1, w: 2 });
  });
});

describe('sensores', () => {
  it('ordem dos raios: da direita para a esquerda', () => {
    expect(rayAngles({ angle: 0, fov: Math.PI, rays: 3 })).toEqual([-Math.PI / 2, 0, Math.PI / 2]);
    expect(rayAngles({ angle: 0.3, fov: 1, rays: 1 })).toEqual([0.3]);
  });

  it('bumper traseiro', () => {
    const rear = { from: Math.PI / 2, to: (3 * Math.PI) / 2 };
    expect(isBumperPressed(rear, [Math.PI])).toBe(true);
    expect(isBumperPressed(rear, [0.1])).toBe(false);
    expect(isBumperPressed(rear, [])).toBe(false);
  });

  it('piso: caixa rotacionada e última região vence', () => {
    const world = buildWorld(
      worldData({
        floor: {
          reflectance: 0.2,
          regions: [
            {
              type: 'rect',
              center: [0, 0],
              width: 2,
              height: 0.2,
              angle: Math.PI / 2,
              reflectance: 0.7,
            },
            { type: 'disc', center: [0, 0], radius: 0.05, reflectance: 1 },
          ],
        },
        robots: [robotData({ pose: { x: 3, y: 3, theta: 0 } })],
      }),
    );
    expect(floorReflectanceAt(world.floor, { x: 0, y: 0.8 })).toBe(0.7);
    expect(floorReflectanceAt(world.floor, { x: 0.8, y: 0 })).toBe(0.2);
    expect(floorReflectanceAt(world.floor, { x: 0, y: 0 })).toBe(1);
  });
});
