import { Bot, Undo2, Upload } from 'lucide-react';
import { useState } from 'react';
import { Button, CodeEditor, EmptyState, IssueList, Kbd, Select } from '../../ui/index';
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
};

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
}: ControllerPanelProps) {
  const current = source ?? CONTROLLER_TEMPLATE;
  const [draft, setDraft] = useState(current);
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
  return (
    <div className={styles.editorPanel}>
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
