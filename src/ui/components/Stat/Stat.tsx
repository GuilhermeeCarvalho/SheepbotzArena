import type { ReactNode } from 'react';
import styles from './Stat.module.css';

/** Valor numérico rotulado, em fonte monoespaçada. */
export function Stat({ label, value, unit }: { label: string; value: ReactNode; unit?: string }) {
  return (
    <div className={styles.stat}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>
        {value}
        {unit && <span className={styles.unit}>{unit}</span>}
      </span>
    </div>
  );
}
