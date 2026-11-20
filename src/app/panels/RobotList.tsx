import { Bot } from 'lucide-react';
import { EmptyState, StatusDot, type Tone } from '../../ui/index';
import type { RobotState, RobotStatus, World } from '../../core/index';
import styles from './panels.module.css';

const STATUS: Record<RobotStatus, { tone: Tone; label: string }> = {
  ok: { tone: 'success', label: 'ok' },
  error: { tone: 'danger', label: 'erro' },
  'no-controller': { tone: 'warning', label: 'sem controlador' },
};

const formatNumber = (value: number) => value.toFixed(2).replace('.', ',');
const toDegrees = (theta: number) => Math.round((theta * 180) / Math.PI);

/** Lista de robôs com estado e pose atuais (FR-012). */
export function RobotList({
  world,
  robots,
  selectedRobotId,
  onSelect,
}: {
  world: World;
  robots: readonly RobotState[];
  selectedRobotId: string | null;
  onSelect: (id: string) => void;
}) {
  if (world.robots.length === 0) {
    return (
      <EmptyState
        icon={<Bot />}
        title="Nenhum robô neste mundo"
        description="Adicione robôs ao JSON do mundo."
      />
    );
  }
  return (
    <ul className={styles.robotList} aria-label="Robôs">
      {world.robots.map((spec, index) => {
        const robot = robots[index]!;
        const status = STATUS[robot.status];
        return (
          <li key={spec.id}>
            <button
              type="button"
              className={styles.robotRow}
              aria-pressed={spec.id === selectedRobotId}
              onClick={() => onSelect(spec.id)}
            >
              <span
                className={styles.swatch}
                style={{ background: spec.color }}
                aria-hidden="true"
              />
              <span className={styles.robotMain}>
                <span className={styles.robotName}>{spec.name ?? spec.id}</span>
                <span className={styles.robotPose}>
                  x {formatNumber(robot.pose.x)} · y {formatNumber(robot.pose.y)} · θ{' '}
                  {toDegrees(robot.pose.theta)}°
                </span>
                {robot.error && (
                  <span className={styles.robotError}>
                    Tick {robot.error.tick}: {robot.error.message}
                  </span>
                )}
              </span>
              <StatusDot tone={status.tone} label={status.label} />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
