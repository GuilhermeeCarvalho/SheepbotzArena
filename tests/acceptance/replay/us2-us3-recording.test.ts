// Spec 005 — US2 (gravação e replay) e US3 (exportar/abrir) (FR-002 a FR-005).
import { describe, expect, it } from 'vitest';
import { createSimulation, loadWorld } from 'src/core';
import { modalityRegistry } from 'src/modalities';
import {
  appendFrame,
  createRecording,
  MAX_FRAMES,
  parseRecording,
  serializeRecording,
} from 'src/app/recording/recording';
import {
  advance,
  applyController,
  createSession,
  displayedState,
  goLive,
  openRecording,
  pause,
  play,
  reset,
  seek,
  stepOnce,
} from 'src/app/session/session';
import { constantSpeed, robotData, worldData } from '../../helpers';

const worldText = JSON.stringify(
  worldData({
    seed: 4,
    robots: [
      robotData({
        sensors: [{ id: 'laser', type: 'laser', rays: 5, fov: 2, maxRange: 2, noise: 0.01 }],
      }),
      robotData({ id: 'r2', pose: { x: 1, y: 1, theta: 0 } }),
    ],
  }),
);
const wander =
  'function onTick(r) { r.setSpeed(0.2 + r.random() * 0.3, r.readLaser()[2] < 1 ? 1 : 0); }';
const controllers = { r1: wander, r2: constantSpeed(0.3, 0.4) };

/** Estados do núcleo, tick a tick, para comparar com a gravação. */
function coreStates(ticks: number) {
  const world = loadWorld(worldText);
  if (!world.ok) throw new Error('mundo');
  const simulation = createSimulation(world.value, { controllers });
  if (!simulation.ok) throw new Error('controladores');
  return [
    simulation.value.getState(),
    ...Array.from({ length: ticks }, () => simulation.value.step(1)),
  ];
}

describe('US2 — gravação e replay', () => {
  it('US2-AC5 e SC-001: todos os ticks são gravados e o quadro N é igual ao step(N) do núcleo', () => {
    let session = play(createSession(worldText, controllers));
    for (const chunk of [4, 20, 1, 15]) session = advance(session, chunk); // 4× = vários ticks por quadro
    session = pause(session);
    for (let i = 0; i < 80; i++) session = stepOnce(session);
    expect(session.recording.frames).toHaveLength(121);
    expect(session.recording.frames).toEqual(coreStates(120));
  });

  it('US2-AC1: arrastar para o tick 40 mostra o estado do tick 40', () => {
    let session = advance(createSession(worldText, controllers), 120);
    session = seek(play(session), 40);
    expect(session.running).toBe(false);
    expect(displayedState(session)).toEqual(coreStates(40)[40]);
    expect(session.state.tick).toBe(120); // o estado ao vivo continua onde parou
  });

  it('US2-AC2: executar no replay reproduz os quadros até o fim, sem simular', () => {
    let session = seek(advance(createSession(worldText, controllers), 50), 10);
    session = play(session);
    session = advance(session, 30);
    expect(displayedState(session).tick).toBe(40);
    session = advance(session, 100);
    expect(displayedState(session).tick).toBe(50);
    expect(session.running).toBe(false);
    expect(session.recording.frames).toHaveLength(51);
    expect(play(session)).toBe(session); // no último quadro não há o que reproduzir
  });

  it('US2-AC3: ao vivo volta ao último estado e continua simulando', () => {
    let session = goLive(seek(advance(createSession(worldText, controllers), 30), 5));
    expect(session.replayIndex).toBeNull();
    expect(displayedState(session).tick).toBe(30);
    session = stepOnce(session);
    expect(session.state.tick).toBe(31);
    expect(session.recording.frames).toHaveLength(32);
  });

  it('US2-AC4: avançar e reiniciar no replay', () => {
    let session = seek(advance(createSession(worldText, controllers), 10), 3);
    session = stepOnce(session);
    expect(session.replayIndex).toBe(4);
    session = reset(session);
    expect(session.replayIndex).toBe(0);
    expect(seek(session, 99).replayIndex).toBe(10);
    expect(seek(session, -5).replayIndex).toBe(0);
  });

  it('reiniciar ao vivo ou aplicar controlador começa uma gravação nova', () => {
    const session = advance(createSession(worldText, controllers), 10);
    expect(reset(session).recording.frames).toHaveLength(1);
    expect(applyController(session, 'r2', constantSpeed(0, 0)).recording.frames).toHaveLength(1);
  });

  it('US2-AC6: limite de quadros marca a gravação como truncada', () => {
    const first = createSession(worldText, controllers).state;
    const recording = createRecording(first);
    for (let i = 1; i < MAX_FRAMES; i++) appendFrame(recording, first);
    expect(recording.truncated).toBe(false);
    appendFrame(recording, first);
    expect(recording.frames).toHaveLength(MAX_FRAMES);
    expect(recording.truncated).toBe(true);
  });
});

describe('US3 — exportar e abrir gravações', () => {
  it('US3-AC1/AC2: exporta e reabre em replay no quadro 0, sem simulação ao vivo', () => {
    const session = advance(createSession(worldText, controllers), 25);
    const text = serializeRecording(session.worldText, session.controllers, session.recording);
    const parsed = parseRecording(text, modalityRegistry);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    const opened = openRecording(createSession(worldText, {}), parsed.value);
    expect(opened.replayIndex).toBe(0);
    expect(opened.liveAvailable).toBe(false);
    expect(opened.recording.frames).toHaveLength(26);
    expect(displayedState(seek(opened, 25))).toEqual(JSON.parse(JSON.stringify(session.state)));
    expect(goLive(opened)).toBe(opened);
    expect(play(goLive(opened)).running).toBe(true); // reproduz o replay
    const paused = { ...opened, replayIndex: null };
    expect(play(paused)).toBe(paused); // sem simulação ao vivo
    expect(stepOnce(paused)).toBe(paused);
  });

  it.each([
    ['{', 'não é um JSON válido'],
    ['{"format":"outro"}', 'não é uma gravação'],
    ['{"format":"sheepbotz-recording","version":2}', 'Versão de gravação não suportada'],
    [
      '{"format":"sheepbotz-recording","version":1,"worldText":"{}","frames":[]}',
      'não tem o mundo ou os quadros',
    ],
    [
      '{"format":"sheepbotz-recording","version":1,"worldText":"{}","frames":[{"tick":0,"robots":[]}]}',
      'mundo da gravação é inválido',
    ],
  ])('US3-AC3: %s → erro claro', (text, message) => {
    const parsed = parseRecording(text, modalityRegistry);
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) expect(parsed.error).toContain(message);
  });

  it('US3-AC3: quadros que não correspondem ao mundo', () => {
    const text = JSON.stringify({
      format: 'sheepbotz-recording',
      version: 1,
      worldText,
      controllers: 5,
      frames: [{ tick: 0, robots: [] }],
    });
    const parsed = parseRecording(text, modalityRegistry);
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) expect(parsed.error).toContain('não correspondem');
  });
});
