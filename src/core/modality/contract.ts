/**
 * Contrato de extensão de modalidades (contracts/modality.md; constitution, princípio IV).
 * O núcleo conhece apenas estas interfaces; as implementações ficam em `src/modalities/`.
 */
import type { SimulationState } from '../simulation/state';
import type { ValidationIssue } from '../world/issues';
import type { World } from '../world/schema';

export type MatchStatus = {
  phase: 'running' | 'finished';
  /** Id do robô ou equipe vencedora; `null` para empate ou sem vencedor. */
  winner: string | null;
  /** Motivo em português, ex.: "r2 saiu do Dohyo". */
  reason: string | null;
  score: Record<string, number>;
  details?: Record<string, unknown>;
  /**
   * Pede ao núcleo que recoloque robôs e bolas nas posições iniciais após este tick
   * (ex.: depois de um gol). Tempo, placar e memória dos controladores são mantidos.
   */
  restart?: boolean;
};

export interface Referee {
  /** Chamado ao fim de cada tick com o snapshot congelado. */
  evaluate(state: SimulationState): MatchStatus;
}

export interface Modality {
  readonly id: string;
  readonly name: string;
  validateWorld(world: World): ValidationIssue[];
  createReferee(world: World): Referee;
}

export type ModalityRegistry = ReadonlyMap<string, Modality>;

export function createModalityRegistry(modalities: readonly Modality[]): ModalityRegistry {
  const registry = new Map<string, Modality>();
  for (const modality of modalities) {
    if (registry.has(modality.id)) {
      throw new Error(`Modalidade '${modality.id}' registrada mais de uma vez`);
    }
    registry.set(modality.id, modality);
  }
  return registry;
}

export const EMPTY_REGISTRY: ModalityRegistry = new Map();
