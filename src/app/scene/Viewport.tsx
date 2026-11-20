import { Grid, OrbitControls } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { type ComponentRef, useEffect, useMemo, useRef } from 'react';
import type { SimulationState, World } from '../../core/index';
import { SCENE_COLORS } from './palette';
import { DynamicSceneContent, StaticSceneContent } from './SceneContent';
import { buildDynamicScene, buildStaticScene, type StaticScene } from './sceneModel';
import styles from './Viewport.module.css';

export type ViewportProps = {
  world: World;
  state: SimulationState;
  showRays: boolean;
  selectedRobotId: string | null;
  onSelectRobot?: (id: string | null) => void;
  /** Incrementar este número recentraliza a câmera (FR-003). */
  resetViewSignal: number;
};

/** Reposiciona a câmera na vista inicial sempre que o sinal ou o mundo mudam. */
function CameraRig({ camera, signal }: { camera: StaticScene['camera']; signal: number }) {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const three = useThree();
  useEffect(() => {
    three.camera.position.set(...camera.position);
    three.camera.lookAt(...camera.target);
    controls.current?.target.set(...camera.target);
    controls.current?.update();
  }, [camera, signal, three.camera]);
  return <OrbitControls ref={controls} makeDefault enableDamping dampingFactor={0.12} maxPolarAngle={Math.PI / 2.05} />;
}

/** Cena 3D da simulação (FR-001 a FR-004). Apenas desenha o estado do núcleo. */
export function Viewport({ world, state, showRays, selectedRobotId, onSelectRobot, resetViewSignal }: ViewportProps) {
  const staticScene = useMemo(() => buildStaticScene(world), [world]);
  const dynamicScene = buildDynamicScene(world, state, { showRays, selectedRobotId });
  const span = Math.max(world.arena.width, world.arena.height);
  return (
    <div className={styles.viewport} data-testid="viewport">
      <Canvas shadows dpr={[1, 2]} camera={{ fov: 45, near: 0.01, far: 500, position: staticScene.camera.position }} onPointerMissed={() => onSelectRobot?.(null)}>
        <color attach="background" args={[SCENE_COLORS.background]} />
        <fog attach="fog" args={[SCENE_COLORS.background, span * 2, span * 6]} />
        <hemisphereLight args={['#cfe7ff', '#1a222c', 0.75]} />
        <directionalLight
          position={[span * 0.6, span * 1.4, span * 0.8]}
          intensity={1.6}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-span}
          shadow-camera-right={span}
          shadow-camera-top={span}
          shadow-camera-bottom={-span}
        />
        <Grid
          position={[0, -0.002, 0]}
          args={[span * 4, span * 4]}
          cellSize={0.5}
          cellThickness={0.6}
          cellColor={SCENE_COLORS.grid}
          sectionSize={2}
          sectionThickness={1}
          sectionColor={SCENE_COLORS.gridSection}
          fadeDistance={span * 4}
          infiniteGrid
        />
        <StaticSceneContent scene={staticScene} />
        <DynamicSceneContent scene={dynamicScene} onSelectRobot={(id) => onSelectRobot?.(id)} />
        <CameraRig camera={staticScene.camera} signal={resetViewSignal} />
      </Canvas>
      <div className={styles.legend} aria-hidden="true">
        <span className={styles.hit} /> detecção
        <span className={styles.free} /> alcance livre
      </div>
    </div>
  );
}
