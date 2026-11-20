import { useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { cx } from '../../cx';
import styles from './Select.module.css';

export type SelectOption = { value: string; label: string };

export type SelectProps = {
  label?: string;
  /** Oculta o rótulo visualmente, mantendo-o acessível. */
  hideLabel?: boolean;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
};

/** Seletor nativo estilizado. */
export function Select({ label, hideLabel, options, value, onChange, disabled, className }: SelectProps) {
  const id = useId();
  return (
    <div className={cx(styles.wrapper, className)}>
      {label && (
        <label htmlFor={id} className={cx(styles.label, hideLabel && styles.visuallyHidden)}>
          {label}
        </label>
      )}
      <div className={styles.control}>
        <select id={id} className={styles.select} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className={styles.chevron} aria-hidden="true" />
      </div>
    </div>
  );
}
