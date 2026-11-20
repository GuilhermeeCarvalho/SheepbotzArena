import { cx } from '../../cx';
import type { Tone } from '../Badge/Badge';
import styles from './StatusDot.module.css';

/** Ponto colorido com rótulo de estado. */
export function StatusDot({
  tone,
  label,
  pulse = false,
}: {
  tone: Tone;
  label: string;
  pulse?: boolean;
}) {
  return (
    <span className={styles.status}>
      <span className={cx(styles.dot, styles[tone], pulse && styles.pulse)} aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}
