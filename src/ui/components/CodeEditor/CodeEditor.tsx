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
  className?: string;
};

const editorTheme = EditorView.theme({
  '&': { height: '100%', fontSize: '12.5px', backgroundColor: 'transparent' },
  '.cm-scroller': { fontFamily: 'var(--font-mono)', lineHeight: '1.55' },
  '.cm-gutters': { backgroundColor: 'transparent', borderRight: '1px solid var(--color-border)' },
  '&.cm-focused': { outline: 'none' },
});

/** Editor de código (CodeMirror 6) com valor controlado. */
export function CodeEditor({ value, onChange, language, ariaLabel, className }: CodeEditorProps) {
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
          oneDark,
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
  }, [language, ariaLabel]);

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
