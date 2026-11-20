import type { ReactNode } from 'react';
import { cx } from '../../cx';
import styles from './ButtonGroup.module.css';

/** Agrupa botões lado a lado num contêiner único. */
export function ButtonGroup({
  children,
  className,
  label,
}: {
  children: ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <div role="group" aria-label={label} className={cx(styles.group, className)}>
      {children}
    </div>
  );
}
