/** Carregamento e validação do arquivo de mundo (FR-001 a FR-004; research D-10). */
import type { z } from 'zod';
import { EMPTY_REGISTRY, type ModalityRegistry } from '../modality/contract';
import {
  type IssueCode,
  type PathSegment,
  type ValidationIssue,
  issue,
  sortIssues,
} from './issues';
import { ELEMENT_KIND_BY_COLLECTION, type World, worldSchema } from './schema';
import { checkWorldSemantics, findDuplicateIds } from './semanticRules';

export type Result<T, E> = { ok: true; value: T } | { ok: false; errors: E[] };

export type LoadOptions = { modalities?: ModalityRegistry };

const TYPE_NAMES: Record<string, string> = {
  number: 'número',
  int: 'número inteiro',
  string: 'texto',
  boolean: 'booleano',
  array: 'lista',
  tuple: 'par [x, y]',
  object: 'objeto',
  record: 'objeto',
};

/** Converte a posição de erro do `JSON.parse` em linha e coluna (base 1). */
function jsonSyntaxIssue(text: string, error: unknown): ValidationIssue {
  const message = error instanceof Error ? error.message : String(error);
  const lineColumn = /line (\d+) column (\d+)/.exec(message);
  let line: number;
  let column: number;
  if (lineColumn) {
    line = Number(lineColumn[1]);
    column = Number(lineColumn[2]);
  } else {
    const position = /position (\d+)/.exec(message);
    const offset = position ? Number(position[1]) : text.length;
    const before = text.slice(0, offset).split('\n');
    line = before.length;
    column = before[before.length - 1]!.length + 1;
  }
  return issue('', 'JSON_SYNTAX', `JSON inválido na linha ${line}, coluna ${column}`);
}

function rangeMessage(raw: z.core.$ZodIssue): string {
  if (raw.code === 'too_small') {
    const min = Number(raw.minimum);
    if (raw.origin === 'array') return `deve ter pelo menos ${min} itens`;
    if (raw.origin === 'string') return 'não pode ser vazio';
    return raw.inclusive ? `deve ser maior ou igual a ${min}` : `deve ser maior que ${min}`;
  }
  if (raw.code === 'too_big') {
    const max = Number(raw.maximum);
    return raw.inclusive ? `deve ser menor ou igual a ${max}` : `deve ser menor que ${max}`;
  }
  return 'valor fora do intervalo permitido';
}

/** Converte um problema do Zod em um ou mais `ValidationIssue` em português. */
function fromZodIssue(raw: z.core.$ZodIssue): ValidationIssue[] {
  const path = raw.path as PathSegment[];
  switch (raw.code) {
    case 'invalid_type': {
      if ((raw as { input?: unknown }).input === undefined) {
        return [issue(path, 'REQUIRED', 'campo obrigatório ausente')];
      }
      const expected = TYPE_NAMES[raw.expected] ?? raw.expected;
      return [issue(path, 'INVALID_TYPE', `esperado ${expected}`)];
    }
    case 'unrecognized_keys':
      return raw.keys.map((key) =>
        issue([...path, key], 'UNKNOWN_FIELD', `campo desconhecido '${key}'`),
      );
    case 'invalid_union': {
      const discriminator = (raw as { discriminator?: string }).discriminator;
      const options = (raw as { options?: unknown[] }).options ?? [];
      const input = (raw as { input?: Record<string, unknown> }).input;
      const value =
        discriminator && input && typeof input === 'object' ? input[discriminator] : undefined;
      if (value === undefined) return [issue(path, 'REQUIRED', 'campo obrigatório ausente')];
      const collection = path.findLast(
        (s): s is string => typeof s === 'string' && s in ELEMENT_KIND_BY_COLLECTION,
      );
      const kind = collection ? ELEMENT_KIND_BY_COLLECTION[collection] : 'elemento';
      return [
        issue(
          path,
          'UNKNOWN_TYPE',
          `tipo de ${kind} desconhecido '${String(value)}'; use ${options.join(', ')}`,
        ),
      ];
    }
    case 'too_small':
    case 'too_big':
      return [issue(path, 'OUT_OF_RANGE', rangeMessage(raw))];
    case 'invalid_format':
      return [issue(path, 'INVALID_FORMAT', raw.message)];
    case 'custom': {
      const code = ((raw.params as { code?: IssueCode } | undefined)?.code ??
        'OUT_OF_RANGE') as IssueCode;
      return [issue(path, code, raw.message)];
    }
    case 'invalid_value':
      return [
        issue(path, 'INVALID_TYPE', `valor inválido; use ${raw.values.map(String).join(', ')}`),
      ];
    default:
      return [issue(path, 'INVALID_TYPE', raw.message)];
  }
}

/** Valida um dado já interpretado como JSON. */
export function validateWorld(
  data: unknown,
  options: LoadOptions = {},
): Result<World, ValidationIssue> {
  const duplicates = findDuplicateIds(data);
  const parsed = worldSchema.safeParse(data, { reportInput: true });
  if (!parsed.success) {
    const schemaIssues = parsed.error.issues.flatMap(fromZodIssue);
    return { ok: false, errors: sortIssues([...schemaIssues, ...duplicates]) };
  }
  const world = parsed.data;
  const semantic = checkWorldSemantics(world, options.modalities ?? EMPTY_REGISTRY);
  const errors = [...duplicates, ...semantic];
  if (errors.length > 0) return { ok: false, errors: sortIssues(errors) };
  return { ok: true, value: world };
}

/** Lê o texto do arquivo de mundo e o valida. */
export function loadWorld(text: string, options: LoadOptions = {}): Result<World, ValidationIssue> {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch (error) {
    return { ok: false, errors: [jsonSyntaxIssue(text, error)] };
  }
  return validateWorld(data, options);
}
