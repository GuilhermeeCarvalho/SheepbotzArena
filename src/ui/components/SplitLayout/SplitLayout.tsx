import type { ReactNode } from 'react';
import { cx } from '../../cx';
import styles from './SplitLayout.module.css';

export type SplitLayoutProps = {
  main: ReactNode;
  aside: ReactNode;
  /** Largura da coluna lateral em pixels. */
  asideWidth?: number;
  className?: string;
};

/** Área principal flexível com coluna lateral fixa. */
export function SplitLayout({ main, aside, asideWidth = 420, className }: SplitLayoutProps) {
  return (
    <div
      className={cx(styles.split, className)}
      style={{ gridTemplateColumns: `minmax(0, 1fr) ${asideWidth}px` }}
    >
      <div className={styles.main}>{main}</div>
      {asideWidth > 0 && <aside className={styles.aside}>{aside}</aside>}
    </div>
  );
}
