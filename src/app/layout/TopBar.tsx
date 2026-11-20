import { PanelRightClose, PanelRightOpen } from 'lucide-react';
import { IconButton, Kbd, Select } from '../../ui/index';
import styles from './TopBar.module.css';

export type TopBarProps = {
  examples: { id: string; name: string }[];
  exampleId: string | null;
  onSelectExample: (id: string) => void;
  sidePanelOpen: boolean;
  onToggleSidePanel: () => void;
};

const CUSTOM_WORLD = '__custom__';

/** Barra superior enxuta: marca, escolha do mundo e painel lateral (FR-009, FR-014). */
export function TopBar({
  examples,
  exampleId,
  onSelectExample,
  sidePanelOpen,
  onToggleSidePanel,
}: TopBarProps) {
  const options = [
    ...examples.map((e) => ({ value: e.id, label: e.name })),
    ...(exampleId === null ? [{ value: CUSTOM_WORLD, label: 'Mundo personalizado' }] : []),
  ];
  return (
    <header className={styles.topBar}>
      <span className={styles.wordmark}>
        SheepBotz <span className={styles.wordmarkLight}>Arena</span>
      </span>
      <span className={styles.divider} aria-hidden="true" />
      <Select
        label="Mundo"
        hideLabel
        className={styles.worldSelect}
        value={exampleId ?? CUSTOM_WORLD}
        options={options}
        onChange={(value) => value !== CUSTOM_WORLD && onSelectExample(value)}
      />
      <span className={styles.spacer} />
      <span className={styles.shortcuts} aria-label="Atalhos de teclado">
        <Kbd>Espaço</Kbd> executar <Kbd>→</Kbd> avançar <Kbd>R</Kbd> reiniciar
      </span>
      <IconButton
        label={sidePanelOpen ? 'Recolher painel' : 'Mostrar painel'}
        icon={sidePanelOpen ? <PanelRightClose /> : <PanelRightOpen />}
        onClick={onToggleSidePanel}
      />
    </header>
  );
}
