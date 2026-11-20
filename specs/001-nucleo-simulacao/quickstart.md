# Roteiro de validação: Núcleo de simulação headless

Roteiro para comprovar, de ponta a ponta, que a feature 001 funciona. Detalhes de
formato estão em [contracts/](./contracts/).

## Pré-requisitos

- Node.js 22 ou superior
- `npm install` na raiz do repositório

## 1. Suíte de testes e cobertura

```bash
npm test                 # todos os testes
npm run test:coverage    # falha se qualquer métrica < 80%; gera coverage/
npm run readme:stats     # atualiza "N testes · X% de cobertura" no README
```

**Esperado**: todos os testes verdes; os testes de `tests/acceptance/` listam os
identificadores `USx-ACy` de cada cenário da spec.

## 2. Linha reta (US2, cenário 1)

```bash
npm run sim -- tests/fixtures/worlds/straight-line.json --ticks 20 \
  --controller r1=tests/fixtures/controllers/forward-1ms.js --pretty
```

**Esperado**: código 0; `robots[0].pose` ≈ `{ "x": 1, "y": 0, "theta": 0 }`.

## 3. Laser contra parede (US3, cenário 1)

```bash
npm run sim -- tests/fixtures/worlds/laser-wall-3rays.json --ticks 0 --pretty
```

**Esperado**: `robots[0].sensors.laser` ≈ `[2, 1, 2]`.

## 4. Mundo inválido (US1, cenário 4)

```bash
npm run sim -- tests/fixtures/worlds/invalid-three-errors.json --ticks 1; echo "código: $?"
```

**Esperado**: código 2; três linhas em `stderr`, com os caminhos `robots[0].radius`,
`robots[0].sensors[0].type` e `robots[1].id`.

## 5. Estratégia de exemplo

```bash
npm run sim -- examples/worlds/corridor.json --ticks 600 --pretty
```

**Esperado**: código 0; o robô percorre o corredor sem acionar o bumper (controlador
`examples/controllers/avoid-obstacles.js`, referenciado no próprio mundo).

## 6. Direção das dependências

```bash
npm run lint
```

**Esperado**: nenhum erro; um `import` de `react`, `three` ou `node:*` dentro de
`src/core/` faria o lint falhar.
