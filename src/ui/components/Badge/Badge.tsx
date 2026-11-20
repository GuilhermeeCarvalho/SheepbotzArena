import type { ReactNode } from 'react';
import { cx } from '../../cx';
import styles from './Badge.module.css';

export type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

/** Rótulo curto colorido pelo tom. */
export function Badge({ tone = 'neutral', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return <span className={cx(styles.badge, styles[tone], className)}>{children}</span>;
}
