import { Grid, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { type ComponentRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Vector3 } from 'three';
import type { SimulationState, World } from '../../core/index';
import { SCENE_PALETTES, type ThemeName } from './palette';
import { ScenePaletteContext } from './ScenePaletteContext';
import { RobotLabelProjector } from './RobotLabels';
import { DynamicSceneContent, StaticSceneContent } from './SceneContent';
import {
  buildDynamicScene,
  buildStaticScene,
  type CameraMode,
  type CameraPose,
  fitPerspectiveCamera,
  fitTopCamera,
  followCamera,
  type RobotMesh,
} from './sceneModel';
import styles from './Viewport.module.css';

export type ViewportProps = {
  world: World;
  state: SimulationState;
  showRays: boolean;
  selectedRobotId: string | null;
  onSelectRobot?: (id: string | null) => void;
  cameraMode: CameraMode;
  /** Incrementar este número recentraliza a câmera no modo atual (FR-003). */
  resetViewSignal: number;
  /** Tema da interface; define a paleta da cena (FR-017). */
  theme?: ThemeName;
};

/** Suavização exponencial por quadro (independe da taxa de quadros). */
const smoothing = (delta: number, rate = 6) => 1 - Math.exp(-rate * delta);

/** Posiciona a câmera conforme o modo; em "Seguir", acompanha o robô a cada quadro. */
function CameraRig({
  mode,
  width,
  depth,
  followed,
  signal,
}: {
  mode: CameraMode;
  width: number;
  depth: number;
  followed: RobotMesh | null;
  signal: number;
}) {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const { camera, size } = useThree();
  const followedRef = useRef(followed);
  followedRef.current = followed;
  // A proporção só entra no enquadramento ao trocar de modo, mundo ou centralizar,
  // para não mover a câmera do usuário a cada redimensionamento.
  const aspectRef = useRef(size.width / size.height);
  aspectRef.current = size.width / size.height;

  useEffect(() => {
    if (mode === 'follow') return;
    const aspect = aspectRef.current;
    const pose: CameraPose =
      mode === 'top'
        ? fitTopCamera(width, depth, aspect)
        : fitPerspectiveCamera(width, depth, aspect);
    camera.position.set(...pose.position);
    controls.current?.target.set(...pose.target);
    controls.current?.update();
  }, [mode, width, depth, signal, camera]);

  const goal = useMemo(() => ({ position: new Vector3(), target: new Vector3() }), []);
  useFrame((_, delta) => {
    const robot = followedRef.current;
    if (mode !== 'follow' || !robot || !controls.current) return;
    const pose = followCamera(robot);
    goal.position.set(...pose.position);
    goal.target.set(...pose.target);
    const k = smoothing(delta);
    camera.position.lerp(goal.position, k);
    controls.current.target.lerp(goal.target, k);
    controls.current.update();
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.12}
      enableRotate={mode !== 'top'}
      enablePan={mode !== 'follow'}
      maxPolarAngle={Math.PI / 2.05}
    />
  );
}

/** Cena 3D da simulação (FR-001 a FR-004, FR-015, FR-016). Apenas desenha o estado do núcleo. */
export function Viewport({
  world,
  state,
  showRays,
  selectedRobotId,
  onSelectRobot,
  cameraMode,
  resetViewSignal,
  theme = 'light',
}: ViewportProps) {
  const palette = SCENE_PALETTES[theme];
  const staticScene = useMemo(() => buildStaticScene(world), [world]);
  const dynamicScene = buildDynamicScene(world, state, { showRays, selectedRobotId });
  const span = Math.max(world.arena.width, world.arena.height);
  const followed = dynamicScene.robots.find((r) => r.id === selectedRobotId) ?? null;

  // Rótulos: robô sob o mouse e robô selecionado (FR-016).
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const onHoverRobot = useCallback((id: string | null) => {
    setHoveredId(id);
    document.body.style.cursor = id ? 'pointer' : '';
  }, []);
  const robotsRef = useRef<RobotMesh[]>(dynamicScene.robots);
  robotsRef.current = dynamicScene.robots;
  const labelElements = useRef(new Map<string, HTMLElement>());
  const labelIds = [...new Set([hoveredId, selectedRobotId])].filter(
    (id): id is string => id !== null && dynamicScene.robots.some((r) => r.id === id),
  );
  return (
    <div className={styles.viewport} data-testid="viewport">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ fov: 45, near: 0.01, far: 500, position: staticScene.camera.position }}
        onPointerMissed={() => onSelectRobot?.(null)}
      >
        <color attach="background" args={[palette.background]} />
        <fog attach="fog" args={[palette.background, span * 2.5, span * 7]} />
        <hemisphereLight
          args={[palette.skyLight, palette.groundLight, theme === 'dark' ? 0.9 : 1.1]}
        />
        <directionalLight
          position={[span * 0.5, span * 1.5, span * 0.7]}
          intensity={1.8}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0005}
          shadow-camera-left={-span}
          shadow-camera-right={span}
          shadow-camera-top={span}
          shadow-camera-bottom={-span}
        />
        <Grid
          position={[0, -0.002, 0]}
          args={[span * 4, span * 4]}
          cellSize={0.5}
          cellThickness={0.7}
          cellColor={palette.grid}
          sectionSize={2}
          sectionThickness={1}
          sectionColor={palette.gridSection}
          fadeDistance={span * 4}
          infiniteGrid
        />
        <ScenePaletteContext.Provider value={palette}>
          <StaticSceneContent scene={staticScene} />
          <DynamicSceneContent
            scene={dynamicScene}
            onSelectRobot={(id) => onSelectRobot?.(id)}
            onHoverRobot={onHoverRobot}
          />
        </ScenePaletteContext.Provider>
        <RobotLabelProjector robots={robotsRef} elements={labelElements} />
        <CameraRig
          mode={cameraMode}
          width={world.arena.width}
          depth={world.arena.height}
          followed={followed}
          signal={resetViewSignal}
        />
      </Canvas>
      <div className={styles.labels} aria-hidden="true">
        {labelIds.map((id) => {
          const robot = dynamicScene.robots.find((r) => r.id === id)!;
          return (
            <span
              key={id}
              className={styles.robotLabel}
              ref={(element) => {
                if (element) labelElements.current.set(id, element);
                else labelElements.current.delete(id);
              }}
            >
              {robot.name}
              {robot.status === 'error' && <span className={styles.robotLabelError}> · erro</span>}
            </span>
          );
        })}
      </div>
      {showRays && (
        <div className={styles.legend} aria-hidden="true">
          <span className={styles.hit} /> detecção
          <span className={styles.free} /> alcance livre
        </div>
      )}
    </div>
  );
}
