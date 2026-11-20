import { cx } from '../../cx';
import styles from './Toggle.module.css';

export type ToggleProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
};

/** Interruptor liga/desliga acessível. */
export function Toggle({ label, checked, onChange, disabled, className }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={cx(styles.toggle, className)}
      onClick={() => onChange(!checked)}
    >
      <span className={cx(styles.track, checked && styles.on)}>
        <span className={styles.thumb} />
      </span>
      <span className={styles.label}>{label}</span>
    </button>
  );
}
