import { Badge, StatusDot } from '../../ui/index';
import type { MatchStatus } from '../../core/index';
import styles from './overlays.module.css';

export type SceneHudProps = {
  worldName: string;
  running: boolean;
  robotCount: number;
  match: MatchStatus | null;
};

/** Estado da simulação no canto da cena (FR-005, FR-008). */
export function SceneHud({ worldName, running, robotCount, match }: SceneHudProps) {
  return (
    <section className={styles.hud} aria-label="Estado da simulação">
      <span className={styles.hudTitle}>{worldName}</span>
      <span className={styles.hudMeta}>
        <StatusDot
          tone={running ? 'info' : 'neutral'}
          label={running ? 'Executando' : 'Pausado'}
          pulse={running}
        />
        <span className={styles.hudDot} aria-hidden="true" />
        <span>
          {robotCount} {robotCount === 1 ? 'robô' : 'robôs'}
        </span>
      </span>
      {match && (
        <Badge tone={match.phase === 'finished' ? 'success' : 'neutral'}>
          {match.phase === 'finished'
            ? `Fim de partida${match.winner ? ` — vencedor: ${match.winner}` : ''}${match.reason ? ` (${match.reason})` : ''}`
            : 'Partida em andamento'}
        </Badge>
      )}
    </section>
  );
}
