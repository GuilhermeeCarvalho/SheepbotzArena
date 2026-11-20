import { Badge, Stat, StatusDot } from '../../ui/index';
import type { MatchStatus } from '../../core/index';
import styles from './StatusBar.module.css';

export type StatusBarProps = {
  tick: number;
  time: number;
  running: boolean;
  robotCount: number;
  match: MatchStatus | null;
};

/** Barra de status: tick, tempo simulado, modo e resultado da partida (FR-005, FR-008). */
export function StatusBar({ tick, time, running, robotCount, match }: StatusBarProps) {
  return (
    <footer className={styles.statusBar} aria-label="Estado da simulação">
      <StatusDot
        tone={running ? 'success' : 'neutral'}
        label={running ? 'Executando' : 'Pausado'}
        pulse={running}
      />
      <Stat label="Tick" value={tick} />
      <Stat label="Tempo" value={time.toFixed(2).replace('.', ',')} unit="s" />
      <Stat label="Robôs" value={robotCount} />
      {match && (
        <Badge tone={match.phase === 'finished' ? 'success' : 'info'}>
          {match.phase === 'finished'
            ? `Fim de partida${match.winner ? ` — vencedor: ${match.winner}` : ''}${match.reason ? ` (${match.reason})` : ''}`
            : 'Partida em andamento'}
        </Badge>
      )}
    </footer>
  );
}
