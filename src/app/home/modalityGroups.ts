/**
 * Agrupamento dos exemplos por modalidade para a tela inicial (spec 010, US2; plan D-02).
 */
import type { Example } from '../examples/examples';

export type ModalityGroupId = 'sumo' | 'line-follower' | 'trekking' | 'soccer' | 'free';

export type ModalityGroup = {
  id: ModalityGroupId;
  name: string;
  description: string;
  examples: Example[];
};

type GroupInfo = Omit<ModalityGroup, 'examples'> & { matches: (modality: string) => boolean };

/** Ordem de exibição da spec (US2-AC1); Livre fica por último e recebe o resto. */
const GROUPS: GroupInfo[] = [
  {
    id: 'sumo',
    name: 'Sumô',
    description: 'Dois robôs no Dohyo: vence quem empurrar o outro para fora.',
    matches: (m) => m.startsWith('sumo-'),
  },
  {
    id: 'line-follower',
    name: 'Seguidor de Linha',
    description: 'Uma volta completa na pista no menor tempo, sem sair da linha.',
    matches: (m) => m.startsWith('seguidor-'),
  },
  {
    id: 'trekking',
    name: 'Trekking',
    description: 'Navegação autônoma até quatro marcos, desviando de obstáculos.',
    matches: (m) => m === 'trekking',
  },
  {
    id: 'soccer',
    name: 'Futebol de robôs',
    description: 'Times de robôs, bola e gols no campo do Mini / VSS.',
    matches: (m) => m.startsWith('futebol-'),
  },
  {
    id: 'free',
    name: 'Livre',
    description: 'Arenas sem regras de modalidade para testar sensores e controladores.',
    matches: () => true,
  },
];

/** Agrupa os exemplos na ordem da spec, omitindo modalidades sem exemplos (US2-AC4). */
export function groupExamples(examples: Example[]): ModalityGroup[] {
  const buckets = new Map<ModalityGroupId, Example[]>(GROUPS.map((g) => [g.id, []]));
  for (const example of examples) {
    const group = GROUPS.find((g) => example.modality !== undefined && g.matches(example.modality));
    buckets.get(group?.id ?? 'free')!.push(example);
  }
  return GROUPS.filter((g) => buckets.get(g.id)!.length > 0).map(({ id, name, description }) => ({
    id,
    name,
    description,
    examples: buckets.get(id)!,
  }));
}
