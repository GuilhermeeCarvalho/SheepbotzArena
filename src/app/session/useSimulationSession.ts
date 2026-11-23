/** Hook da sessão com laço de reprodução por requestAnimationFrame (research D-04; FR-006). */
import { useCallback, useEffect, useRef, useState } from 'react';
import { modalityRegistry } from '../../modalities/index';
import { parseRecording } from '../recording/recording';
import { createPlaybackClock } from './playbackClock';
import * as transitions from './session';
import type { SessionState } from './session';

export type SessionActions = {
  play(): void;
  pause(): void;
  step(): void;
  reset(): void;
  setSpeed(speed: number): void;
  applyWorld(
    worldText: string,
    controllers?: Record<string, string>,
    exampleId?: string | null,
  ): boolean;
  applyController(robotId: string, source: string): boolean;
  seek(index: number): void;
  goLive(): void;
  /** Abre uma gravação (texto do arquivo); devolve a mensagem de erro, se houver. */
  openRecording(text: string): string | null;
};

export function useSimulationSession(initial: () => SessionState): [SessionState, SessionActions] {
  const [session, setSession] = useState(initial);
  const sessionRef = useRef(session);
  sessionRef.current = session;

  const update = useCallback((next: SessionState) => {
    sessionRef.current = next;
    setSession(next);
  }, []);

  // Laço de reprodução: só roda enquanto `running`.
  useEffect(() => {
    if (!session.running) return;
    const clock = createPlaybackClock(session.world.dt);
    let frame = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const current = sessionRef.current;
      const ticks = clock.advance(now - last, current.speed);
      last = now;
      if (ticks > 0) update(transitions.advance(current, ticks));
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [session.running, session.simulation, session.world.dt, update]);

  const actions: SessionActions = {
    play: () => update(transitions.play(sessionRef.current)),
    pause: () => update(transitions.pause(sessionRef.current)),
    step: () => update(transitions.stepOnce(sessionRef.current)),
    reset: () => update(transitions.reset(sessionRef.current)),
    setSpeed: (speed) => update(transitions.setSpeed(sessionRef.current, speed)),
    applyWorld: (worldText, controllers, exampleId = null) => {
      const next = transitions.applyWorld(sessionRef.current, worldText, controllers, exampleId);
      update(next);
      return next.worldIssues.length === 0 && next.controllerIssues.length === 0;
    },
    seek: (index) => update(transitions.seek(sessionRef.current, index)),
    goLive: () => update(transitions.goLive(sessionRef.current)),
    openRecording: (text) => {
      const parsed = parseRecording(text, modalityRegistry);
      if (!parsed.ok) return parsed.error;
      update(transitions.openRecording(sessionRef.current, parsed.value));
      return null;
    },
    applyController: (robotId, source) => {
      const next = transitions.applyController(sessionRef.current, robotId, source);
      update(next);
      return next.controllerIssues.length === 0 && next.worldIssues.length === 0;
    },
  };
  return [session, actions];
}
