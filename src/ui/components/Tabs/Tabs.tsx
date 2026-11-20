import type { KeyboardEvent, ReactNode } from 'react';
import { cx } from '../../cx';
import styles from './Tabs.module.css';

export type TabItem = { id: string; label: string; icon?: ReactNode; badge?: ReactNode };

export type TabsProps = {
  tabs: TabItem[];
  value: string;
  onChange: (id: string) => void;
  label?: string;
  className?: string;
};

/** Abas acessíveis; setas esquerda/direita trocam de aba. */
export function Tabs({ tabs, value, onChange, label, className }: TabsProps) {
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    const index = tabs.findIndex((t) => t.id === value);
    const delta = event.key === 'ArrowRight' ? 1 : -1;
    const next = tabs[(index + delta + tabs.length) % tabs.length];
    if (next) onChange(next.id);
  };
  return (
    <div role="tablist" aria-label={label} className={cx(styles.tabs, className)} onKeyDown={onKeyDown}>
      {tabs.map((tab) => {
        const selected = tab.id === value;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            className={cx(styles.tab, selected && styles.selected)}
            onClick={() => onChange(tab.id)}
          >
            {tab.icon && <span className={styles.icon}>{tab.icon}</span>}
            {tab.label}
            {tab.badge !== undefined && <span className={styles.badge}>{tab.badge}</span>}
          </button>
        );
      })}
    </div>
  );
}
