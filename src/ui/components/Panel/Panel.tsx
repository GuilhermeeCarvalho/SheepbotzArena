import type { ReactNode } from 'react';
import { cx } from '../../cx';
import styles from './Panel.module.css';

export type PanelProps = {
  title?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  padded?: boolean;
  className?: string;
};

/** Superfície com cabeçalho opcional. */
export function Panel({ title, icon, actions, children, padded = true, className }: PanelProps) {
  return (
    <section className={cx(styles.panel, className)}>
      {(title || actions) && (
        <header className={styles.header}>
          <h2 className={styles.title}>
            {icon && <span className={styles.icon}>{icon}</span>}
            {title}
          </h2>
          {actions && <div className={styles.actions}>{actions}</div>}
        </header>
      )}
      <div className={cx(styles.body, padded && styles.padded)}>{children}</div>
    </section>
  );
}
