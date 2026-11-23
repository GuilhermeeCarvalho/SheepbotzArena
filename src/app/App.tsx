import { Bot, Code2, Globe2 } from 'lucide-react';
import { type ReactNode, useCallback, useEffect, useState } from 'react';
import { SplitLayout, Tabs } from '../ui/index';
import { type Example, loadBundledExamples } from './examples/examples';
import { AppShell } from './layout/AppShell';
import shellStyles from './layout/AppShell.module.css';
import { CameraControls } from './layout/CameraControls';
import { SceneHud } from './layout/SceneHud';
import { TopBar } from './layout/TopBar';
import { TransportBar } from './layout/TransportBar';
import { ControllerPanel } from './panels/ControllerPanel';
import { RobotList } from './panels/RobotList';
import { WorldPanel } from './panels/WorldPanel';
import type { CameraMode } from './scene/sceneModel';
import { Viewport } from './scene/Viewport';
import { createSession } from './session/session';
import { useSimulationSession } from './session/useSimulationSession';
import { useTheme } from './theme/useTheme';

type SideTab = 'controller' | 'world' | 'robots';

const SIDE_PANEL_WIDTH = 420;

const isTypingTarget = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName) ||
    target.closest('.cm-editor') !== null);

/** Tela principal do simulador (spec 002). */
export function App({ examples = loadBundledExamples() }: { examples?: Example[] }) {
  const [session, actions] = useSimulationSession(() => {
    const first = examples[0]!;
    return createSession(first.worldText, first.controllers, first.id);
  });
  const [theme, toggleTheme] = useTheme();
  const [tab, setTab] = useState<SideTab>('controller');
  const [sidePanelOpen, setSidePanelOpen] = useState(true);
  const [showRays, setShowRays] = useState(true);
  const [cameraMode, setCameraMode] = useState<CameraMode>('perspective');
  const [selected, setSelected] = useState<string | null>(session.world.robots[0]?.id ?? null);
  const [resetViewSignal, setResetViewSignal] = useState(0);

  // Mantém a seleção válida quando o mundo muda.
  const robotIds = session.world.robots.map((r) => r.id);
  const selectedRobotId =
    selected !== null && robotIds.includes(selected) ? selected : (robotIds[0] ?? null);
  const finished = session.state.match?.phase === 'finished';
  const effectiveCameraMode: CameraMode =
    cameraMode === 'follow' && selectedRobotId === null ? 'perspective' : cameraMode;

  const togglePlay = useCallback(
    () => (session.running ? actions.pause() : actions.play()),
    [session.running, actions],
  );

  // Atalhos de teclado fora dos campos de edição.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target) || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.code === 'Space') {
        event.preventDefault();
        togglePlay();
      } else if (event.key === 'ArrowRight') {
        actions.step();
      } else if (event.key === 'r' || event.key === 'R') {
        actions.reset();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [togglePlay, actions]);

  const selectExample = (id: string) => {
    const example = examples.find((e) => e.id === id);
    if (example) actions.applyWorld(example.worldText, example.controllers, example.id);
  };

  /** Clique num robô na cena: seleciona e abre o controlador dele (FR-016). */
  const selectRobotFromScene = (id: string | null) => {
    if (id === null) return;
    setSelected(id);
    setTab('controller');
    setSidePanelOpen(true);
  };

  const controllerIssues = session.controllerIssues;
  const errorCount = session.state.robots.filter((r) => r.status === 'error').length;
  const sidePanels: Record<SideTab, ReactNode> = {
    controller: (
      <ControllerPanel
        key={`${session.worldText}|${selectedRobotId}|${selectedRobotId ? session.controllers[selectedRobotId] : ''}`}
        world={session.world}
        robotId={selectedRobotId}
        source={selectedRobotId ? session.controllers[selectedRobotId] : undefined}
        issues={controllerIssues}
        onSelectRobot={setSelected}
        onApply={(robotId, source) => actions.applyController(robotId, source)}
        theme={theme}
      />
    ),
    world: (
      <WorldPanel
        key={session.worldText}
        worldText={session.worldText}
        issues={session.worldIssues}
        onApply={(text) => actions.applyWorld(text)}
        theme={theme}
      />
    ),
    robots: (
      <RobotList
        world={session.world}
        robots={session.state.robots}
        selectedRobotId={selectedRobotId}
        onSelect={setSelected}
      />
    ),
  };

  return (
    <AppShell
      header={
        <TopBar
          examples={examples}
          exampleId={session.exampleId}
          onSelectExample={selectExample}
          sidePanelOpen={sidePanelOpen}
          onToggleSidePanel={() => setSidePanelOpen((open) => !open)}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      }
    >
      <SplitLayout
        asideWidth={sidePanelOpen ? SIDE_PANEL_WIDTH : 0}
        main={
          <div className={shellStyles.stage}>
            <Viewport
              world={session.world}
              state={session.state}
              showRays={showRays}
              selectedRobotId={selectedRobotId}
              onSelectRobot={selectRobotFromScene}
              cameraMode={effectiveCameraMode}
              resetViewSignal={resetViewSignal}
              theme={theme}
            />
            <SceneHud
              worldName={session.world.name}
              running={session.running}
              robotCount={session.world.robots.length}
              match={session.state.match}
            />
            <CameraControls
              mode={effectiveCameraMode}
              canFollow={selectedRobotId !== null}
              showRays={showRays}
              onModeChange={setCameraMode}
              onShowRaysChange={setShowRays}
              onResetView={() => setResetViewSignal((n) => n + 1)}
            />
            <TransportBar
              running={session.running}
              finished={finished}
              speed={session.speed}
              tick={session.state.tick}
              time={session.state.time}
              onPlay={actions.play}
              onPause={actions.pause}
              onStep={actions.step}
              onReset={actions.reset}
              onSpeedChange={actions.setSpeed}
            />
          </div>
        }
        aside={
          sidePanelOpen && (
            <>
              <Tabs
                label="Painéis"
                className={shellStyles.sideTabs}
                value={tab}
                onChange={(id) => setTab(id as SideTab)}
                tabs={[
                  {
                    id: 'controller',
                    label: 'Controlador',
                    icon: <Code2 />,
                    badge: controllerIssues.length || undefined,
                  },
                  {
                    id: 'world',
                    label: 'Mundo',
                    icon: <Globe2 />,
                    badge: session.worldIssues.length || undefined,
                  },
                  { id: 'robots', label: 'Robôs', icon: <Bot />, badge: errorCount || undefined },
                ]}
              />
              <div className={shellStyles.sidePanel}>{sidePanels[tab]}</div>
            </>
          )
        }
      />
    </AppShell>
  );
}
