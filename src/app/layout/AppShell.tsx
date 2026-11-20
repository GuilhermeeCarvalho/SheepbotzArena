import type { ReactNode } from 'react';
import styles from './AppShell.module.css';

/** Estrutura da tela: barra superior fixa e área de trabalho (FR-014). */
export function AppShell({ header, children }: { header: ReactNode; children: ReactNode }) {
  return (
    <div className={styles.shell}>
      {header}
      <main className={styles.workspace}>{children}</main>
    </div>
  );
}
