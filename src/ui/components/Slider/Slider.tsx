import { useId } from 'react';
import { cx } from '../../cx';
import styles from './Slider.module.css';

export type SliderProps = {
  label: string;
  hideLabel?: boolean;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
};

/** Controle deslizante (linha do tempo, ajustes numéricos). */
export function Slider({
  label,
  hideLabel,
  min,
  max,
  step = 1,
  value,
  onChange,
  disabled,
  className,
}: SliderProps) {
  const id = useId();
  const progress = max > min ? ((value - min) / (max - min)) * 100 : 0;
  return (
    <div className={cx(styles.wrapper, className)}>
      <label htmlFor={id} className={cx(styles.label, hideLabel && styles.visuallyHidden)}>
        {label}
      </label>
      <input
        id={id}
        type="range"
        className={styles.slider}
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        style={{ ['--progress' as string]: `${progress}%` }}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}
