# Contrato: extensão de modalidades (`src/core/modality/contract.ts`)

Referências: spec FR-024; constitution princípio IV; research D-14.
Implementações concretas chegam nas features 004 (Sumô), 006 (Seguidor de Linha),
007 (Trekking) e 008 (Futebol). O núcleo conhece **apenas** estas interfaces.

```ts
type MatchStatus = {
  phase: 'running' | 'finished';
  winner: string | null;          // id do robô ou da equipe vencedora; null = empate ou sem vencedor
  reason: string | null;          // texto em português, ex.: "r2 saiu do Dohyo"
  score: Record<string, number>;  // pontuação por robô/equipe
  details?: Record<string, unknown>; // dados próprios da modalidade, serializáveis (ex.: round atual)
};

interface Referee {
  // Chamado ao fim de cada tick com o snapshot congelado. Não pode alterar o estado.
  evaluate(state: SimulationState): MatchStatus;
}

interface Modality {
  readonly id: string;                                   // ex.: "sumo-mini"
  readonly name: string;                                 // ex.: "Mini Sumô (500 g)"
  // Problemas específicos da modalidade no mundo/modalityOptions, com caminhos.
  validateWorld(world: World): ValidationIssue[];
  createReferee(world: World): Referee;                  // chamado em create e reset
}

type ModalityRegistry = ReadonlyMap<string, Modality>;
function createModalityRegistry(modalities: Modality[]): ModalityRegistry; // ids repetidos → erro
```

## Regras

- A modalidade não move robôs nem lê o estado interno; só observa snapshots.
- Determinismo: se precisar de aleatoriedade, usa o fluxo `modality:<id>` fornecido pelo
  núcleo (a ser adicionado ao contrato quando a primeira modalidade precisar, com
  justificativa na spec).
- Uma modalidade pode precisar de capacidades novas do núcleo (ex.: bola no futebol).
  Isso exige justificativa na spec da modalidade e testes de regressão do núcleo
  (constitution, princípio IV).
