/** Problemas de validação do arquivo de mundo (contracts/world-file.md, catálogo de códigos). */

export type IssueCode =
  | 'JSON_SYNTAX'
  | 'REQUIRED'
  | 'UNKNOWN_FIELD'
  | 'INVALID_TYPE'
  | 'INVALID_FORMAT'
  | 'OUT_OF_RANGE'
  | 'UNKNOWN_TYPE'
  | 'INVALID_GEOMETRY'
  | 'UNSUPPORTED_VERSION'
  | 'DUPLICATE_ID'
  | 'UNKNOWN_MODALITY'
  | 'OUT_OF_ARENA'
  | 'INITIAL_OVERLAP'
  | 'MODALITY_RULE';

export type ValidationIssue = { path: string; code: IssueCode; message: string };

export type PathSegment = string | number;

/** Converte segmentos em caminho legível: `robots[0].sensors[1].rays`. */
export function formatPath(segments: readonly PathSegment[]): string {
  let path = '';
  for (const segment of segments) {
    if (typeof segment === 'number') path += `[${segment}]`;
    else path += path === '' ? segment : `.${segment}`;
  }
  return path;
}

export const issue = (
  path: readonly PathSegment[] | string,
  code: IssueCode,
  message: string,
): ValidationIssue => ({
  path: typeof path === 'string' ? path : formatPath(path),
  code,
  message,
});

/** Quebra um caminho em segmentos comparáveis (`robots[10].id` → ['robots', 10, 'id']). */
function splitPath(path: string): PathSegment[] {
  const segments: PathSegment[] = [];
  for (const match of path.matchAll(/([^.[\]]+)|\[(\d+)\]/g)) {
    segments.push(match[2] !== undefined ? Number(match[2]) : match[1]!);
  }
  return segments;
}

function comparePaths(a: string, b: string): number {
  const sa = splitPath(a);
  const sb = splitPath(b);
  for (let i = 0; i < Math.min(sa.length, sb.length); i++) {
    const x = sa[i]!;
    const y = sb[i]!;
    if (x === y) continue;
    if (typeof x === 'number' && typeof y === 'number') return x - y;
    return String(x).localeCompare(String(y));
  }
  return sa.length - sb.length;
}

/** Ordena os problemas pelo caminho (índices em ordem crescente), de forma estável. */
export const sortIssues = (issues: readonly ValidationIssue[]): ValidationIssue[] =>
  [...issues].sort((a, b) => comparePaths(a.path, b.path));

/** Formata para exibição: `<caminho ou (raiz)>: <mensagem>`, um por linha. */
export const formatIssues = (issues: readonly ValidationIssue[]): string =>
  issues.map((i) => `${i.path === '' ? '(raiz)' : i.path}: ${i.message}`).join('\n');
