import { AlertTriangle } from 'lucide-react';
import styles from './IssueList.module.css';

export type IssueItem = { location?: string; message: string };

/** Lista de erros de validação com local e mensagem. */
export function IssueList({
  issues,
  title = 'Erros encontrados',
}: {
  issues: IssueItem[];
  title?: string;
}) {
  if (issues.length === 0) return null;
  return (
    <div className={styles.issues} role="alert">
      <p className={styles.title}>
        <AlertTriangle aria-hidden="true" />
        {title} ({issues.length})
      </p>
      <ul className={styles.list}>
        {issues.map((issue, index) => (
          <li key={index} className={styles.item}>
            {issue.location && <code className={styles.location}>{issue.location}</code>}
            <span>{issue.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
