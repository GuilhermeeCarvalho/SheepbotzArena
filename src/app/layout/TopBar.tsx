import { House, Moon, PanelRightClose, PanelRightOpen, Sun } from 'lucide-react';
import { IconButton, Kbd, Select } from '../../ui/index';
import styles from './TopBar.module.css';

export type TopBarProps = {
  examples: { id: string; name: string }[];
  exampleId: string | null;
  onSelectExample: (id: string) => void;
  /** Volta à tela inicial (spec 010, FR-005); sem ela, o botão não aparece. */
  onGoHome?: () => void;
  sidePanelOpen: boolean;
  onToggleSidePanel: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
};

/** Logo oficial da SheepBotz sem fundo (public/brand; FR-017). */
export const LOGO_SRC = '/brand/sheepbotz-mark.png';

const CUSTOM_WORLD = '__custom__';

/** Barra superior: logo, escolha do mundo, tema e painel lateral (FR-009, FR-014, FR-017). */
export function TopBar({
  examples,
  exampleId,
  onSelectExample,
  onGoHome,
  sidePanelOpen,
  onToggleSidePanel,
  theme,
  onToggleTheme,
}: TopBarProps) {
  const options = [
    ...examples.map((e) => ({ value: e.id, label: e.name })),
    ...(exampleId === null ? [{ value: CUSTOM_WORLD, label: 'Mundo personalizado' }] : []),
  ];
  return (
    <header className={styles.topBar}>
      <img className={styles.logo} src={LOGO_SRC} alt="SheepBotz" width={30} height={30} />
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
      {onGoHome && <IconButton label="Tela inicial" icon={<House />} onClick={onGoHome} />}
      <IconButton
        label={theme === 'dark' ? 'Tema claro' : 'Tema escuro'}
        icon={theme === 'dark' ? <Sun /> : <Moon />}
        onClick={onToggleTheme}
      />
      <IconButton
        label={sidePanelOpen ? 'Recolher painel' : 'Mostrar painel'}
        icon={sidePanelOpen ? <PanelRightClose /> : <PanelRightOpen />}
        onClick={onToggleSidePanel}
      />
    </header>
  );
}
