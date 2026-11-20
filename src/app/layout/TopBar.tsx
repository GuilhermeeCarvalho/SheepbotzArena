import { Crosshair, Pause, Play, RotateCcw, StepForward } from 'lucide-react';
import {
  Button,
  ButtonGroup,
  IconButton,
  Select,
  Toggle,
  Toolbar,
  ToolbarSeparator,
  ToolbarSpacer,
} from '../../ui/index';
import { PLAYBACK_SPEEDS } from '../session/playbackClock';
import styles from './TopBar.module.css';

export type TopBarProps = {
  examples: { id: string; name: string }[];
  exampleId: string | null;
  onSelectExample: (id: string) => void;
  running: boolean;
  finished: boolean;
  speed: number;
  showRays: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStep: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onShowRaysChange: (show: boolean) => void;
  onResetView: () => void;
};

const CUSTOM_WORLD = '__custom__';

/** Barra superior: marca, mundo, controles de execução e de visualização (FR-005, FR-006). */
export function TopBar(props: TopBarProps) {
  const exampleOptions = [
    ...props.examples.map((e) => ({ value: e.id, label: e.name })),
    ...(props.exampleId === null ? [{ value: CUSTOM_WORLD, label: 'Mundo personalizado' }] : []),
  ];
  return (
    <header className={styles.topBar}>
      <div className={styles.brand}>
        <span className={styles.logo} aria-hidden="true">
          <svg viewBox="0 0 32 32">
            <rect width="32" height="32" rx="8" />
            <circle cx="16" cy="17" r="8" />
            <rect x="14" y="6" width="4" height="7" rx="2" />
          </svg>
        </span>
        <div>
          <h1 className={styles.title}>SheepBotz Arena</h1>
          <p className={styles.subtitle}>Simulador de robôs móveis</p>
        </div>
      </div>
      <Toolbar label="Controles da simulação" className={styles.toolbar}>
        <Select
          label="Mundo"
          hideLabel
          className={styles.worldSelect}
          value={props.exampleId ?? CUSTOM_WORLD}
          options={exampleOptions}
          onChange={(value) => value !== CUSTOM_WORLD && props.onSelectExample(value)}
        />
        <ToolbarSeparator />
        <ButtonGroup label="Execução">
          {props.running ? (
            <Button variant="primary" size="sm" icon={<Pause />} onClick={props.onPause}>
              Pausar
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              icon={<Play />}
              onClick={props.onPlay}
              disabled={props.finished}
            >
              Executar
            </Button>
          )}
          <IconButton
            label="Avançar um tick"
            icon={<StepForward />}
            onClick={props.onStep}
            disabled={props.running || props.finished}
          />
          <IconButton label="Reiniciar" icon={<RotateCcw />} onClick={props.onReset} />
        </ButtonGroup>
        <Select
          label="Velocidade"
          hideLabel
          className={styles.speedSelect}
          value={String(props.speed)}
          options={PLAYBACK_SPEEDS.map((s) => ({
            value: String(s),
            label: `${String(s).replace('.', ',')}×`,
          }))}
          onChange={(value) => props.onSpeedChange(Number(value))}
        />
        <ToolbarSpacer />
        <Toggle label="Mostrar raios" checked={props.showRays} onChange={props.onShowRaysChange} />
        <IconButton
          label="Centralizar vista"
          icon={<Crosshair />}
          onClick={props.onResetView}
          variant="secondary"
        />
      </Toolbar>
    </header>
  );
}
