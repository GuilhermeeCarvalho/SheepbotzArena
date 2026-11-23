import { Download, FolderOpen, Radio } from 'lucide-react';
import { type ChangeEvent, useRef } from 'react';
import { Badge, Button, IconButton, Slider } from '../../ui/index';
import styles from './overlays.module.css';

export type TimelineProps = {
  frameCount: number;
  index: number;
  replaying: boolean;
  liveAvailable: boolean;
  truncated: boolean;
  onSeek: (index: number) => void;
  onGoLive: () => void;
  onExport: () => void;
  onOpenFile: (text: string) => void;
  /** Erro ao abrir uma gravação (spec 005, US3-AC3). */
  error?: string | null;
};

/** Linha do tempo da gravação e replay (spec 005, US2 e US3; FR-002, FR-003, FR-005). */
export function Timeline(props: TimelineProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const onFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) props.onOpenFile(await file.text());
  };
  return (
    <div className={styles.timeline} role="group" aria-label="Gravação e replay">
      {props.replaying ? <Badge tone="info">replay</Badge> : <Badge tone="success">ao vivo</Badge>}
      <Slider
        label="Linha do tempo"
        hideLabel
        className={styles.timelineSlider}
        min={0}
        max={Math.max(0, props.frameCount - 1)}
        value={props.index}
        disabled={props.frameCount <= 1}
        onChange={props.onSeek}
      />
      <span className={styles.timelineCount} data-testid="timeline-count">
        {props.index} / {props.frameCount - 1}
      </span>
      {props.truncated && <Badge tone="warning">limite de gravação atingido</Badge>}
      {props.error && (
        <span role="alert" className={styles.timelineError} title={props.error}>
          {props.error}
        </span>
      )}
      {props.replaying && props.liveAvailable && (
        <Button size="sm" variant="secondary" icon={<Radio />} onClick={props.onGoLive}>
          Ao vivo
        </Button>
      )}
      <IconButton label="Exportar gravação" icon={<Download />} onClick={props.onExport} />
      <IconButton
        label="Abrir gravação"
        icon={<FolderOpen />}
        onClick={() => fileInput.current?.click()}
      />
      <input
        ref={fileInput}
        type="file"
        accept=".json,application/json"
        hidden
        data-testid="recording-file-input"
        onChange={(event) => void onFile(event)}
      />
    </div>
  );
}
