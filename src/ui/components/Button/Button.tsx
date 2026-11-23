import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '../../cx';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: 'sm' | 'md';
  icon?: ReactNode;
  loading?: boolean;
};

/** Botão de ação com ícone opcional. */
export function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  loading = false,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(styles.button, styles[variant], styles[size], className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      {children && <span>{children}</span>}
    </button>
  );
}
