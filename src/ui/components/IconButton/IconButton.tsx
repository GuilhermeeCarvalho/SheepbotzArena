import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '../../cx';
import styles from './IconButton.module.css';

export type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  /** Rótulo acessível, também exibido como dica. */
  label: string;
  icon: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  active?: boolean;
};

/** Botão quadrado só com ícone (barras de ferramentas). */
export function IconButton({
  label,
  icon,
  variant = 'ghost',
  active = false,
  className,
  type = 'button',
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      aria-pressed={active || undefined}
      className={cx(styles.iconButton, styles[variant], active && styles.active, className)}
      {...rest}
    >
      {icon}
    </button>
  );
}
