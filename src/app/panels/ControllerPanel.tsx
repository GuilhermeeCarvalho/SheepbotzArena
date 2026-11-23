import { Bot, Plug, Unplug, Undo2, Upload } from 'lucide-react';
import { useState } from 'react';
import { Badge, Button, CodeEditor, EmptyState, IssueList, Kbd, Select } from '../../ui/index';
import type { ControllerIssue, World } from '../../core/index';
import styles from './panels.module.css';

/** Controlador inicial para robôs sem código. */
export const CONTROLLER_TEMPLATE = `// Chamado uma vez por tick. Variáveis fora de onTick guardam memória.
function onTick(robot) {
  robot.setSpeed(0.3, 0); // v (m/s), w (rad/s)
}
`;

const API_REFERENCE: [string, string][] = [
  ['robot.setSpeed(v, w)', 'velocidade linear (m/s) e angular (rad/s)'],
  ['robot.readLaser(id?)', 'distâncias, da direita para a esquerda'],
  ['robot.readSonar(id?)', 'menor distância do cone'],
  ['robot.readBumper(id?)', 'true se encostou'],
  ['robot.readFloor(id?)', 'refletância do piso (0 a 1)'],
  ['robot.readOdometry()', '{ x, y, theta, distance }'],
  ['robot.random() · robot.time() · robot.log(msg)', 'aleatório semeado, tempo, registro'],
];

export type ControllerPanelProps = {
  world: World;
  robotId: string | null;
  source: string | undefined;
  issues: ControllerIssue[];
  onSelectRobot: (id: string) => void;
  onApply: (robotId: string, source: string) => void;
  theme?: 'light' | 'dark';
  /** Endereço do programa externo, se o robô estiver remoto (spec 009). */
  remoteUrl?: string | null;
  remoteError?: string | null;
  onConnectRemote?: (robotId: string, url: string) => Promise<string | null>;
  onDisconnectRemote?: (robotId: string) => void;
};

export const DEFAULT_REMOTE_URL = 'ws://localhost:8765';

/**
 * Edição do controlador do robô selecionado (FR-011). O pai remonta o painel quando o
 * robô ou o código vigente mudam, descartando rascunhos (US5-AC5).
 */
export function ControllerPanel({
  world,
  robotId,
  source,
  issues,
  onSelectRobot,
  onApply,
  theme,
  remoteUrl = null,
  remoteError = null,
  onConnectRemote,
  onDisconnectRemote,
}: ControllerPanelProps) {
  const current = source ?? CONTROLLER_TEMPLATE;
  const [draft, setDraft] = useState(current);
  const [url, setUrl] = useState(remoteUrl ?? DEFAULT_REMOTE_URL);
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  if (robotId === null) {
    return (
      <EmptyState
        icon={<Bot />}
        title="Nenhum robô para programar"
        description="Adicione robôs ao mundo."
      />
    );
  }
  const dirty = draft !== current || source === undefined;
  const connect = async () => {
    if (!onConnectRemote) return;
    setConnecting(true);
    setConnectError(await onConnectRemote(robotId, url.trim()));
    setConnecting(false);
  };
  const remoteProblem = connectError ?? remoteError;
  return (
    <div className={styles.editorPanel}>
      {onConnectRemote && (
        <section className={styles.remote} aria-label="Controle remoto">
          <div className={styles.remoteHeader}>
            <span className={styles.remoteTitle}>Controle remoto (WebSocket)</span>
            {remoteUrl !== null && <Badge tone="info">remoto</Badge>}
          </div>
          {remoteUrl === null ? (
            <div className={styles.remoteRow}>
              <input
                className={styles.remoteInput}
                aria-label="Endereço do controlador remoto"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                spellCheck={false}
              />
              <Button size="sm" icon={<Plug />} loading={connecting} onClick={() => void connect()}>
                Conectar
              </Button>
            </div>
          ) : (
            <div className={styles.remoteRow}>
              <span className={styles.remoteStatus}>
                Comandado pelo programa em <code>{remoteUrl}</code>
              </span>
              <Button
                size="sm"
                variant="ghost"
                icon={<Unplug />}
                onClick={() => onDisconnectRemote?.(robotId)}
              >
                Desconectar
              </Button>
            </div>
          )}
          {remoteProblem && (
            <p className={styles.remoteError} role="alert">
              {remoteProblem}
            </p>
          )}
        </section>
      )}
      <div className={styles.editorActions}>
        <Select
          label="Robô"
          className={styles.robotSelect}
          value={robotId}
          options={world.robots.map((r) => ({ value: r.id, label: r.name ?? r.id }))}
          onChange={onSelectRobot}
        />
        <Button
          variant="primary"
          size="sm"
          icon={<Upload />}
          onClick={() => onApply(robotId, draft)}
          disabled={!dirty}
        >
          Aplicar
        </Button>
        <Button
          size="sm"
          variant="ghost"
          icon={<Undo2 />}
          onClick={() => setDraft(current)}
          disabled={draft === current}
        >
          Descartar
        </Button>
      </div>
      <IssueList
        title="O controlador não foi aplicado"
        issues={issues.map((issue) => ({
          location:
            issue.line !== undefined
              ? `linha ${issue.line}, coluna ${issue.column}`
              : issue.robotId,
          message: issue.message,
        }))}
      />
      <div className={styles.editorArea}>
        <CodeEditor
          value={draft}
          onChange={setDraft}
          language="javascript"
          ariaLabel={`Controlador do robô ${robotId}`}
          theme={theme}
        />
      </div>
      <details className={styles.apiReference}>
        <summary>Referência da API do robô</summary>
        <dl>
          {API_REFERENCE.map(([call, description]) => (
            <div key={call}>
              <dt>
                <code>{call}</code>
              </dt>
              <dd>{description}</dd>
            </div>
          ))}
        </dl>
        <p className={styles.hint}>
          Aplicar reinicia a simulação no tick 0. Atalhos: <Kbd>Espaço</Kbd> executar/pausar,{' '}
          <Kbd>→</Kbd> avançar, <Kbd>R</Kbd> reiniciar. Um laço infinito no controlador trava a aba.
        </p>
      </details>
    </div>
  );
}
