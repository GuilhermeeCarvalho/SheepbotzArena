import type { ReactNode } from 'react';
import { cx } from '../../cx';
import styles from './SegmentedControl.module.css';

export type SegmentOption = { value: string; label: ReactNode; title?: string; disabled?: boolean };

export type SegmentedControlProps = {
  label: string;
  options: SegmentOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

/** Escolha única entre poucas opções, exibidas lado a lado (`role="radiogroup"`). */
export function SegmentedControl({
  label,
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps) {
  return (
    <div role="radiogroup" aria-label={label} className={cx(styles.segmented, className)}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          title={option.title}
          aria-label={option.title}
          disabled={option.disabled}
          className={cx(styles.segment, option.value === value && styles.selected)}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
