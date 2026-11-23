import { Pause, Play, RotateCcw, StepForward } from 'lucide-react';
import { IconButton, SegmentedControl } from '../../ui/index';
import { PLAYBACK_SPEEDS } from '../session/playbackClock';
import styles from './overlays.module.css';

export type TransportBarProps = {
  running: boolean;
  finished: boolean;
  speed: number;
  tick: number;
  time: number;
  onPlay: () => void;
  onPause: () => void;
  onStep: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
};

const formatSpeed = (speed: number) => `${String(speed).replace('.', ',')}×`;

/** Controles de execução flutuando sobre a cena, como um player (FR-005, FR-006). */
export function TransportBar(props: TransportBarProps) {
  return (
    <div className={styles.transport} role="toolbar" aria-label="Controles da simulação">
      <IconButton label="Reiniciar" icon={<RotateCcw />} onClick={props.onReset} />
      {props.running ? (
        <IconButton
          label="Pausar"
          icon={<Pause />}
          variant="primary"
          className={styles.playButton}
          onClick={props.onPause}
        />
      ) : (
        <IconButton
          label="Executar"
          icon={<Play />}
          variant="primary"
          className={styles.playButton}
          onClick={props.onPlay}
          disabled={props.finished}
        />
      )}
      <IconButton
        label="Avançar um tick"
        icon={<StepForward />}
        onClick={props.onStep}
        disabled={props.running || props.finished}
      />
      <span className={styles.separator} aria-hidden="true" />
      <SegmentedControl
        label="Velocidade"
        value={String(props.speed)}
        onChange={(value) => props.onSpeedChange(Number(value))}
        options={PLAYBACK_SPEEDS.map((s) => ({ value: String(s), label: formatSpeed(s) }))}
      />
      <span className={styles.separator} aria-hidden="true" />
      <span className={styles.clock} aria-label="Tempo da simulação">
        <span className={styles.clockValue} data-testid="tick">
          {props.tick}
        </span>
        <span className={styles.clockLabel}>ticks</span>
        <span className={styles.clockValue} data-testid="time">
          {props.time.toFixed(2).replace('.', ',')}
        </span>
        <span className={styles.clockLabel}>s</span>
      </span>
    </div>
  );
}
