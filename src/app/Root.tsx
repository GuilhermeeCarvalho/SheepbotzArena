import { useState } from 'react';
import { App } from './App';
import { type Example, loadBundledExamples } from './examples/examples';
import { HomeScreen } from './home/HomeScreen';

type Screen = { kind: 'home' } | { kind: 'simulator'; exampleId: string };

/** Alterna entre a tela inicial e o simulador (spec 010; plan D-01 e D-03). */
export function Root({ examples = loadBundledExamples() }: { examples?: Example[] }) {
  const [screen, setScreen] = useState<Screen>({ kind: 'home' });
  const openExample = (exampleId: string) => setScreen({ kind: 'simulator', exampleId });

  if (screen.kind === 'home') {
    return (
      <HomeScreen
        examples={examples}
        onOpenSimulator={() => openExample(examples[0]!.id)}
        onOpenExample={openExample}
      />
    );
  }
  return (
    <App
      examples={examples}
      initialExampleId={screen.exampleId}
      onGoHome={() => setScreen({ kind: 'home' })}
    />
  );
}
