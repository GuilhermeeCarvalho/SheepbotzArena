import { Bot, Code2, Globe2 } from 'lucide-react';
import { type ReactNode, useCallback, useEffect, useState } from 'react';
import { Panel, SplitLayout, Tabs } from '../ui/index';
import { type Example, loadBundledExamples } from './examples/examples';
import { AppShell } from './layout/AppShell';
import shellStyles from './layout/AppShell.module.css';
import { StatusBar } from './layout/StatusBar';
import { TopBar } from './layout/TopBar';
import { ControllerPanel } from './panels/ControllerPanel';
import { RobotList } from './panels/RobotList';
import { WorldPanel } from './panels/WorldPanel';
import { Viewport } from './scene/Viewport';
import { createSession } from './session/session';
import { useSimulationSession } from './session/useSimulationSession';

type SideTab = 'controller' | 'world' | 'robots';

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
  const [tab, setTab] = useState<SideTab>('controller');
  const [showRays, setShowRays] = useState(true);
  const [selected, setSelected] = useState<string | null>(session.world.robots[0]?.id ?? null);
  const [resetViewSignal, setResetViewSignal] = useState(0);

  // Mantém a seleção válida quando o mundo muda.
  const robotIds = session.world.robots.map((r) => r.id);
  const selectedRobotId =
    selected !== null && robotIds.includes(selected) ? selected : (robotIds[0] ?? null);
  const finished = session.state.match?.phase === 'finished';

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

  const controllerIssues = session.controllerIssues;
  const sidePanels: Record<SideTab, { title: string; content: ReactNode }> = {
    controller: {
      title: 'Controlador',
      content: (
        <ControllerPanel
          key={`${session.worldText}|${selectedRobotId}|${selectedRobotId ? session.controllers[selectedRobotId] : ''}`}
          world={session.world}
          robotId={selectedRobotId}
          source={selectedRobotId ? session.controllers[selectedRobotId] : undefined}
          issues={controllerIssues}
          onSelectRobot={setSelected}
          onApply={(robotId, source) => actions.applyController(robotId, source)}
        />
      ),
    },
    world: {
      title: 'Mundo',
      content: (
        <WorldPanel
          key={session.worldText}
          worldText={session.worldText}
          issues={session.worldIssues}
          onApply={(text) => actions.applyWorld(text)}
        />
      ),
    },
    robots: {
      title: 'Robôs',
      content: (
        <RobotList
          world={session.world}
          robots={session.state.robots}
          selectedRobotId={selectedRobotId}
          onSelect={setSelected}
        />
      ),
    },
  };

  const errorCount = session.state.robots.filter((r) => r.status === 'error').length;

  return (
    <AppShell
      header={
        <TopBar
          examples={examples}
          exampleId={session.exampleId}
          onSelectExample={selectExample}
          running={session.running}
          finished={finished}
          speed={session.speed}
          showRays={showRays}
          onPlay={actions.play}
          onPause={actions.pause}
          onStep={actions.step}
          onReset={actions.reset}
          onSpeedChange={actions.setSpeed}
          onShowRaysChange={setShowRays}
          onResetView={() => setResetViewSignal((n) => n + 1)}
        />
      }
    >
      <SplitLayout
        asideWidth={440}
        main={
          <>
            <Viewport
              world={session.world}
              state={session.state}
              showRays={showRays}
              selectedRobotId={selectedRobotId}
              onSelectRobot={(id) => id !== null && setSelected(id)}
              resetViewSignal={resetViewSignal}
            />
            <StatusBar
              tick={session.state.tick}
              time={session.state.time}
              running={session.running}
              robotCount={session.world.robots.length}
              match={session.state.match}
            />
          </>
        }
        aside={
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
            <Panel className={shellStyles.sidePanel} title={sidePanels[tab].title}>
              {sidePanels[tab].content}
            </Panel>
          </>
        }
      />
    </AppShell>
  );
}
