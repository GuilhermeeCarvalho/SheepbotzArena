import type { ReactNode } from 'react';
import { cx } from '../../cx';
import styles from './Toolbar.module.css';

/** Barra horizontal de ferramentas. */
export function Toolbar({
  children,
  className,
  label,
}: {
  children: ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <div role="toolbar" aria-label={label} className={cx(styles.toolbar, className)}>
      {children}
    </div>
  );
}

/** Separador vertical entre grupos da barra. */
export function ToolbarSeparator() {
  return <span className={styles.separator} aria-hidden="true" />;
}

/** Espaço flexível que empurra os itens seguintes para a direita. */
export function ToolbarSpacer() {
  return <span className={styles.spacer} aria-hidden="true" />;
}
