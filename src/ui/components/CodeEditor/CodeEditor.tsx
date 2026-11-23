import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { EditorState } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';
import { basicSetup } from 'codemirror';
import { useEffect, useRef } from 'react';
import { cx } from '../../cx';
import styles from './CodeEditor.module.css';

export type CodeEditorProps = {
  value: string;
  onChange: (value: string) => void;
  language: 'javascript' | 'json';
  ariaLabel: string;
  /** Tema do editor; no escuro usa a sintaxe "One Dark" sobre o fundo dos tokens. */
  theme?: 'light' | 'dark';
  className?: string;
};

const editorTheme = EditorView.theme({
  '&': { height: '100%', fontSize: '12.5px', backgroundColor: 'transparent !important' },
  '.cm-scroller': { fontFamily: 'var(--font-mono)', lineHeight: '1.6' },
  '.cm-gutters': {
    backgroundColor: 'transparent !important',
    border: 'none',
    color: 'var(--color-text-subtle)',
  },
  '.cm-activeLine, .cm-activeLineGutter': { backgroundColor: 'var(--color-primary-soft)' },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
    backgroundColor: 'rgba(28, 126, 214, 0.16) !important',
  },
  '&.cm-focused': { outline: 'none' },
});

/** Editor de código (CodeMirror 6) com valor controlado. */
export function CodeEditor({
  value,
  onChange,
  language,
  ariaLabel,
  theme = 'light',
  className,
}: CodeEditorProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const view = new EditorView({
      parent: hostRef.current!,
      state: EditorState.create({
        doc: value,
        extensions: [
          basicSetup,
          language === 'json' ? json() : javascript(),
          ...(theme === 'dark' ? [oneDark] : []),
          editorTheme,
          EditorView.contentAttributes.of({ 'aria-label': ariaLabel }),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) onChangeRef.current(update.state.doc.toString());
          }),
        ],
      }),
    });
    viewRef.current = view;
    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // O editor é recriado só quando a linguagem muda; o valor é sincronizado no efeito abaixo.
  }, [language, ariaLabel, theme]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({ changes: { from: 0, to: current.length, insert: value } });
    }
  }, [value]);

  return <div ref={hostRef} className={cx(styles.editor, className)} />;
}
