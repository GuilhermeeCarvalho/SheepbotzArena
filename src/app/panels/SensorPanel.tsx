import { Gauge } from 'lucide-react';
import { Badge, EmptyState, Select, Stat } from '../../ui/index';
import type { SimulationState, World } from '../../core/index';
import { inspectRobot, type SensorView } from '../inspection/inspectRobot';
import styles from './SensorPanel.module.css';

const meters = (value: number) => value.toFixed(2).replace('.', ',');

function RangeSensor({ sensor }: { sensor: Extract<SensorView, { kind: 'range' }> }) {
  return (
    <div className={styles.rays} aria-label={`Raios do ${sensor.type} ${sensor.id}`}>
      {sensor.readings.map((reading, i) => (
        <div key={i} className={styles.ray}>
          <span className={styles.rayIndex}>{sensor.readings.length > 1 ? i : '–'}</span>
          <span className={styles.rayTrack}>
            <span
              className={sensor.hits[i] ? styles.rayHit : styles.rayFree}
              style={{ width: `${Math.min(100, (reading / sensor.maxRange) * 100)}%` }}
            />
          </span>
          <span className={styles.rayValue}>{meters(reading)} m</span>
        </div>
      ))}
    </div>
  );
}

function SensorRow({ sensor }: { sensor: SensorView }) {
  switch (sensor.kind) {
    case 'range':
      return (
        <section className={styles.sensor}>
          <header className={styles.sensorHeader}>
            <span className={styles.sensorName}>{sensor.id}</span>
            <Badge>{sensor.type === 'laser' ? 'laser' : 'sonar'}</Badge>
            <span className={styles.hint}>alcance {meters(sensor.maxRange)} m</span>
          </header>
          <RangeSensor sensor={sensor} />
        </section>
      );
    case 'floor':
      return (
        <section className={styles.sensorInline}>
          <span className={styles.sensorName}>{sensor.id}</span>
          <span className={styles.rayTrack}>
            <span className={styles.floorFill} style={{ width: `${sensor.value * 100}%` }} />
          </span>
          <span className={styles.rayValue}>{sensor.value.toFixed(2).replace('.', ',')}</span>
          <Badge tone={sensor.white ? 'info' : 'neutral'}>
            {sensor.white ? 'branco' : 'escuro'}
          </Badge>
        </section>
      );
    case 'bumper':
      return (
        <section className={styles.sensorInline}>
          <span className={styles.sensorName}>{sensor.id}</span>
          <span className={styles.spacer} />
          <Badge tone={sensor.pressed ? 'danger' : 'neutral'}>
            {sensor.pressed ? 'acionado' : 'livre'}
          </Badge>
        </section>
      );
    case 'camera':
      return (
        <section className={styles.sensor}>
          <header className={styles.sensorHeader}>
            <span className={styles.sensorName}>{sensor.id}</span>
            <Badge>câmera</Badge>
          </header>
          <div className={styles.stats}>
            <Stat label="x" value={meters(sensor.x)} unit="m" />
            <Stat label="y" value={meters(sensor.y)} unit="m" />
            <Stat label="θ" value={sensor.thetaDeg} unit="°" />
            {sensor.ball ? (
              <Stat
                label="bola"
                value={`${meters(sensor.ball.x)}; ${meters(sensor.ball.y)}`}
                unit="m"
              />
            ) : (
              <span className={styles.hint}>sem bola</span>
            )}
          </div>
        </section>
      );
  }
}

export type SensorPanelProps = {
  world: World;
  state: SimulationState;
  robotId: string | null;
  onSelectRobot: (id: string) => void;
};

/** Painel de inspeção: todas as leituras do robô no tick exibido (spec 005, US1; FR-001). */
export function SensorPanel({ world, state, robotId, onSelectRobot }: SensorPanelProps) {
  const inspection = robotId ? inspectRobot(world, state, robotId) : null;
  if (!inspection) {
    return (
      <EmptyState
        icon={<Gauge />}
        title="Nenhum robô para inspecionar"
        description="Adicione robôs ao mundo."
      />
    );
  }
  return (
    <div className={styles.panel}>
      <div className={styles.top}>
        <Select
          label="Robô"
          className={styles.robotSelect}
          value={inspection.id}
          options={world.robots.map((r) => ({ value: r.id, label: r.name ?? r.id }))}
          onChange={onSelectRobot}
        />
        <Badge tone="neutral">tick {state.tick}</Badge>
      </div>

      <section className={styles.block} aria-label="Comando e odometria">
        <h3 className={styles.blockTitle}>Comando</h3>
        <div className={styles.stats}>
          <Stat label="v" value={inspection.command.v.toFixed(2).replace('.', ',')} unit="m/s" />
          <Stat label="w" value={inspection.command.w.toFixed(2).replace('.', ',')} unit="rad/s" />
        </div>
        <h3 className={styles.blockTitle}>Odometria</h3>
        <div className={styles.stats}>
          <Stat label="x" value={meters(inspection.odometry.x)} unit="m" />
          <Stat label="y" value={meters(inspection.odometry.y)} unit="m" />
          <Stat label="θ" value={inspection.odometry.thetaDeg} unit="°" />
          <Stat label="dist." value={meters(inspection.odometry.distance)} unit="m" />
        </div>
      </section>

      <section className={styles.block} aria-label="Sensores">
        <h3 className={styles.blockTitle}>Sensores</h3>
        {inspection.sensors.length === 0 ? (
          <p className={styles.hint}>Este robô não tem sensores.</p>
        ) : (
          inspection.sensors.map((sensor) => <SensorRow key={sensor.id} sensor={sensor} />)
        )}
      </section>

      <section className={styles.block} aria-label="Registros do controlador">
        <h3 className={styles.blockTitle}>Registros (robot.log)</h3>
        {inspection.error && (
          <p className={styles.error}>
            Tick {inspection.error.tick}: {inspection.error.message}
          </p>
        )}
        {inspection.logs.length === 0 ? (
          <p className={styles.hint}>Nenhuma mensagem.</p>
        ) : (
          <ol className={styles.logs}>
            {inspection.logs.map((entry, i) => (
              <li key={`${entry.tick}-${i}`}>
                <span className={styles.logTick}>{entry.tick}</span>
                <span>{entry.message}</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
