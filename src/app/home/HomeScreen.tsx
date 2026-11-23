import { ArrowRight, Moon, Play, Sun } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button, IconButton, cx } from '../../ui/index';
import type { Example } from '../examples/examples';
import { LOGO_SRC } from '../layout/TopBar';
import { useTheme } from '../theme/useTheme';
import { type ModalityGroupId, groupExamples } from './modalityGroups';
import styles from './HomeScreen.module.css';

export type HomeScreenProps = {
  examples: Example[];
  onOpenSimulator: () => void;
  onOpenExample: (id: string) => void;
};

const exampleCount = (n: number) => (n === 1 ? '1 exemplo' : `${n} exemplos`);

/** Tela inicial: apresentação, modalidades e exemplos (spec 010, US1 e US2). */
export function HomeScreen({ examples, onOpenSimulator, onOpenExample }: HomeScreenProps) {
  const [theme, toggleTheme] = useTheme();
  const groups = groupExamples(examples);
  const [selectedId, setSelectedId] = useState<ModalityGroupId | null>(null);
  const selected = groups.find((g) => g.id === selectedId) ?? null;
  const examplesRef = useRef<HTMLDivElement>(null);

  // A lista de exemplos fica abaixo dos cartões: rola até ela ao escolher a modalidade.
  useEffect(() => {
    if (selectedId !== null) {
      examplesRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedId]);

  return (
    <div className={styles.home}>
      <header className={styles.header}>
        <img className={styles.logo} src={LOGO_SRC} alt="SheepBotz" width={30} height={30} />
        <span className={styles.wordmark}>
          SheepBotz <span className={styles.wordmarkLight}>Arena</span>
        </span>
        <span className={styles.spacer} />
        <IconButton
          label={theme === 'dark' ? 'Tema claro' : 'Tema escuro'}
          icon={theme === 'dark' ? <Sun /> : <Moon />}
          onClick={toggleTheme}
        />
      </header>

      <main className={styles.content}>
        <section className={styles.hero} aria-labelledby="home-title">
          <img className={styles.heroLogo} src={LOGO_SRC} alt="" width={88} height={88} />
          <h1 id="home-title" className={styles.title}>
            SheepBotz Arena
          </h1>
          <p className={styles.tagline}>
            Simulador de robôs móveis da equipe Univille SheepBotz: descreva a arena, programe a
            estratégia do robô e teste quantas vezes quiser, sem desgastar os robôs físicos.
          </p>
          <Button variant="primary" icon={<Play />} onClick={onOpenSimulator}>
            Abrir simulador
          </Button>
        </section>

        <section className={styles.modalities} aria-labelledby="home-modalities">
          <h2 id="home-modalities" className={styles.sectionTitle}>
            Modalidades
          </h2>
          <div className={styles.grid}>
            {groups.map((group) => (
              <button
                key={group.id}
                type="button"
                className={cx(styles.card, group.id === selectedId && styles.cardSelected)}
                aria-pressed={group.id === selectedId}
                onClick={() => setSelectedId(group.id)}
              >
                <span className={styles.cardTitle}>{group.name}</span>
                <span className={styles.cardDescription}>{group.description}</span>
                <span className={styles.cardCount}>{exampleCount(group.examples.length)}</span>
              </button>
            ))}
          </div>

          {selected && (
            <div
              ref={examplesRef}
              className={styles.examples}
              role="region"
              aria-label={`Exemplos de ${selected.name}`}
            >
              <h3 className={styles.examplesTitle}>Exemplos de {selected.name}</h3>
              <ul className={styles.exampleList}>
                {selected.examples.map((example) => (
                  <li key={example.id}>
                    <button
                      type="button"
                      className={styles.exampleButton}
                      onClick={() => onOpenExample(example.id)}
                    >
                      <span>{example.name}</span>
                      <ArrowRight aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
