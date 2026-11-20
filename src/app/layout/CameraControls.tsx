import { Box, Crosshair, LocateFixed, Radar, Square } from 'lucide-react';
import { IconButton, SegmentedControl } from '../../ui/index';
import type { CameraMode } from '../scene/sceneModel';
import styles from './overlays.module.css';

export type CameraControlsProps = {
  mode: CameraMode;
  canFollow: boolean;
  showRays: boolean;
  onModeChange: (mode: CameraMode) => void;
  onShowRaysChange: (show: boolean) => void;
  onResetView: () => void;
};

/** Modos de câmera e opções de visualização sobre a cena (FR-003, FR-004, FR-015). */
export function CameraControls(props: CameraControlsProps) {
  return (
    <div className={styles.cameraControls}>
      <SegmentedControl
        label="Câmera"
        value={props.mode}
        onChange={(value) => props.onModeChange(value as CameraMode)}
        options={[
          { value: 'perspective', label: <Box aria-hidden="true" />, title: 'Perspectiva' },
          { value: 'top', label: <Square aria-hidden="true" />, title: 'Topo' },
          {
            value: 'follow',
            label: <LocateFixed aria-hidden="true" />,
            title: 'Seguir robô selecionado',
            disabled: !props.canFollow,
          },
        ]}
      />
      <span className={styles.separator} aria-hidden="true" />
      <IconButton
        label={props.showRays ? 'Ocultar raios' : 'Mostrar raios'}
        icon={<Radar />}
        active={props.showRays}
        onClick={() => props.onShowRaysChange(!props.showRays)}
      />
      <IconButton label="Centralizar vista" icon={<Crosshair />} onClick={props.onResetView} />
    </div>
  );
}
