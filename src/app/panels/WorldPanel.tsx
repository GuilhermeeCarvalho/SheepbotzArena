import { FolderOpen, Undo2, Upload } from 'lucide-react';
import { type ChangeEvent, useRef, useState } from 'react';
import { Button, CodeEditor, IssueList } from '../../ui/index';
import type { ValidationIssue } from '../../core/index';
import styles from './panels.module.css';

export type WorldPanelProps = {
  worldText: string;
  issues: ValidationIssue[];
  onApply: (worldText: string) => void;
  theme?: 'light' | 'dark';
};

/** Edição do JSON do mundo e abertura de arquivo (FR-010). O pai remonta o painel quando o mundo vigente muda. */
export function WorldPanel({ worldText, issues, onApply, theme }: WorldPanelProps) {
  const [draft, setDraft] = useState(worldText);
  const fileInput = useRef<HTMLInputElement>(null);
  const dirty = draft !== worldText;

  const onFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const text = await file.text();
    setDraft(text);
    onApply(text);
  };

  return (
    <div className={styles.editorPanel}>
      <div className={styles.editorActions}>
        <Button
          variant="primary"
          size="sm"
          icon={<Upload />}
          onClick={() => onApply(draft)}
          disabled={!dirty}
        >
          Aplicar mundo
        </Button>
        <Button
          size="sm"
          variant="ghost"
          icon={<Undo2 />}
          onClick={() => setDraft(worldText)}
          disabled={!dirty}
        >
          Descartar
        </Button>
        <Button size="sm" icon={<FolderOpen />} onClick={() => fileInput.current?.click()}>
          Abrir arquivo…
        </Button>
        <input
          ref={fileInput}
          type="file"
          accept=".json,application/json"
          hidden
          data-testid="world-file-input"
          onChange={(event) => void onFile(event)}
        />
      </div>
      <IssueList
        title="O mundo não foi aplicado"
        issues={issues.map((issue) => ({
          location: issue.path || '(raiz)',
          message: issue.message,
        }))}
      />
      <div className={styles.editorArea}>
        <CodeEditor
          value={draft}
          onChange={setDraft}
          language="json"
          ariaLabel="JSON do mundo"
          theme={theme}
        />
      </div>
    </div>
  );
}
