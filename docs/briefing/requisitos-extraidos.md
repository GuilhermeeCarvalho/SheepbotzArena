# Requisitos extraídos do briefing — Trilha 4: SheepBotz Arena

**Fonte**: enunciado "Trabalho Final - Trilhas de Spec Driven Development (SDD)", Trilha 4.
**Ciclo**: Greenfield (SpecKit).
**Última revisão**: 2026-11-20

Este documento é a primeira etapa da rastreabilidade do projeto:

```text
Briefing (RB-xx)  →  Spec (FR-xxx / US-x)  →  Task (Txxx)  →  Commit
```

Cada requisito do briefing recebe um identificador `RB-xx`. As especificações em
`specs/NNN-*/spec.md` citam os `RB-xx` que atendem, e as tarefas citam os `FR-xxx`.
O briefing é propositalmente incompleto; as perguntas e as decisões adotadas ficam
registradas nas seções finais deste documento.

---

## 1. Problema e público

- **Público**: equipe de robótica Univille SheepBotz (estudantes que projetam robôs
  autônomos para competições da RoboCore).
- **Dor**: testar estratégias de controle nos robôs físicos desgasta motores, rodas e
  baterias, depende da arena física e não é reproduzível.
- **Valor esperado**: testar estratégias no navegador, de forma repetível, antes de
  levá-las ao robô real.

## 2. Requisitos do briefing

### Restrições (obrigatórias, não negociáveis)

| ID    | Requisito                                                                                   | Origem            |
|-------|---------------------------------------------------------------------------------------------|-------------------|
| RB-01 | O núcleo de simulação roda sem interface gráfica (headless).                                | Restrições        |
| RB-02 | O núcleo é determinístico: seed e passo de tempo fixos.                                      | Restrições        |
| RB-03 | O renderizador apenas desenha o estado; não decide física, sensores ou resultados.           | Restrições        |
| RB-04 | Não usar motor de física pronto; cinemática e colisões implementadas pela dupla.             | Restrições        |
| RB-05 | Lógica em 2D e visualização em 3D (Three.js ou WebGL).                                       | O projeto         |

### Escopo mínimo

| ID    | Requisito                                                                                   |
|-------|---------------------------------------------------------------------------------------------|
| RB-10 | Mundo descrito em arquivo YAML ou JSON: mapa, obstáculos, robôs e sensores.                  |
| RB-11 | Erros claros para arquivos de mundo inválidos.                                               |
| RB-12 | Robô de tração diferencial comandado por velocidade linear e angular.                        |
| RB-13 | Colisão simples.                                                                             |
| RB-14 | Sensor laser ou sonar: raycast com N raios e alcance máximo.                                 |
| RB-15 | Sensor de odometria.                                                                         |
| RB-16 | Sensor de contato (bumper).                                                                  |
| RB-17 | Controlador em JavaScript contra uma API limitada (ex.: `readLaser()`, `setSpeed(v, w)`), executado a cada tick. |
| RB-18 | Controles de simulação: play, pause, step e reset.                                           |
| RB-19 | Visualização 3D com câmera orbital e os raios dos sensores visíveis.                         |

### Escopo completo

| ID    | Requisito                                                                                   |
|-------|---------------------------------------------------------------------------------------------|
| RB-20 | Vários robôs na mesma arena.                                                                 |
| RB-21 | Painel de inspeção com as leituras dos sensores.                                             |
| RB-22 | Gravação e replay de simulações.                                                             |
| RB-23 | Modalidade escolhida define condições de vitória e mundos de exemplo; o núcleo continua independente dela. |

### Requisitos da equipe (levantados com o cliente após o briefing)

| ID    | Requisito                                                                                   | Origem            |
|-------|---------------------------------------------------------------------------------------------|-------------------|
| RB-24 | Em cada modalidade, o usuário configura o próprio robô (chassi, rodas, motores, sensores e itens) a partir de componentes reais usados pela equipe, para maior afinidade entre simulador e robô físico. | Equipe, 2026-11-20 |
| RB-25 | A configuração respeita os limites da categoria (dimensões e massa máximas do regulamento). | Equipe, 2026-11-20 |
| RB-26 | Cada modalidade oferece estratégias de exemplo em código (ex.: sumô: busca e ataque, fuga de borda). | Equipe, 2026-11-20 |

### Bônus

| ID    | Requisito                                                                                   |
|-------|---------------------------------------------------------------------------------------------|
| RB-30 | Controladores escritos em Portugol, usando o meuPiá Maker pelas interfaces públicas.         |
| RB-31 | Controlador remoto via WebSocket, no estilo Player/ROS.                                      |

### Requisitos do trabalho (universais)

| ID    | Requisito                                                                                   |
|-------|---------------------------------------------------------------------------------------------|
| RB-40 | Constitution, specs, plans e tasks produzidos com SpecKit; a especificação deve ser capaz de recriar o sistema. |
| RB-41 | Cobertura de testes ≥ 80%, com relatório no repositório.                                     |
| RB-42 | README exibe no início a quantidade de testes e o percentual de cobertura, atualizados a cada entrega. |
| RB-43 | Cada commit aponta para a task que implementa; cada task aponta para o requisito que atende. |
| RB-44 | Toda escolha de stack fica registrada na constitution.                                       |
| RB-45 | Testes de aceitação verificam o núcleo sem interface: posição final após N ticks (com tolerância), leituras do laser em mundos simples e erros para mundos inválidos. |

## 3. Perguntas levantadas e decisões adotadas

O briefing deixa pontos em aberto de propósito. Cada decisão abaixo vale até ser
revista por emenda na especificação correspondente.

| ID   | Pergunta                                                                 | Decisão adotada                                                                                                   | Onde é detalhada |
|------|--------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------|------------------|
| Q-01 | YAML, JSON ou ambos?                                                     | Somente **JSON**. Evita um formato e um parser extras e mantém uma única fonte de mensagens de erro. YAML fica como evolução futura. | spec 001         |
| Q-02 | Quais unidades e convenções de coordenadas?                              | Metros, segundos e radianos. Eixo x para a direita, y para cima; ângulo 0 aponta para +x e cresce no sentido anti-horário. | spec 001         |
| Q-03 | Qual modelo de movimento entre ticks?                                    | Integração exata em arco de circunferência para (v, w) constantes no tick, para que a posição final seja previsível. | spec 001         |
| Q-04 | O que é "colisão simples"?                                               | Robôs são discos para fins de colisão; obstáculos são caixas, discos e paredes (segmentos). Na colisão, o robô é afastado até o contato, sem atravessar. | spec 001         |
| Q-05 | Laser ou sonar?                                                          | Ambos, sobre o mesmo raycast: o laser devolve uma distância por raio; o sonar devolve a menor distância do seu cone. | spec 001         |
| Q-06 | A odometria é perfeita?                                                  | Não: ela integra as velocidades comandadas, portanto diverge da pose real quando o robô está bloqueado. Ruído opcional e semeado. | spec 001         |
| Q-07 | Que modalidade guia a demo?                                              | **Sumô** (categoria em que a equipe compete). Seguidor de Linha, Trekking e Futebol entram como modalidades adicionais sobre o mesmo núcleo. | constitution     |
| Q-08 | Sumô e Seguidor de Linha precisam enxergar o piso (borda branca, linha). O briefing não cita esse sensor. | Incluir um **sensor de piso (refletância)** no núcleo, porque é reaproveitado por várias modalidades. | spec 001         |
| Q-09 | Como garantir determinismo do controlador escrito pelo usuário?          | O controlador não acessa relógio nem aleatoriedade do sistema; recebe um gerador aleatório semeado pela API.      | spec 001         |
| Q-10 | Como uma estratégia em loop infinito é tratada?                          | Limitação conhecida da PoC: o controlador roda no mesmo fluxo da simulação. O modo headless aceita um tempo limite de execução. | plan 001         |
| Q-11 | Robôs saem da arena no Sumô (não há paredes). Como o núcleo trata isso?  | O núcleo não impõe paredes de borda, a menos que o mundo declare. Quem decide "saiu do Dohyo" é o árbitro da modalidade. | spec 003         |
| Q-12 | Futebol exige uma bola, que não é robô.                                  | Será proposta como extensão do núcleo ("corpo passivo") na spec 007, com justificativa e testes de regressão, conforme a constitution. | spec 007         |
| Q-13 | Portugol (bônus) roda no navegador?                                      | Em aberto. Avaliar após o escopo completo, sem modificar o meuPiá.                                                | —                |
| Q-14 | Como representar componentes reais sem mudar o núcleo?                   | Um **catálogo** à parte converte dados de datasheet em parâmetros do núcleo (ex.: alcance e FOV → laser; rpm e diâmetro da roda → velocidade máxima; dimensões → raio; soma das massas → massa). O núcleo continua genérico. | spec 003         |
| Q-15 | De onde vêm os números dos componentes?                                  | De datasheets oficiais, registrados com fonte em `docs/references/componentes/`; valores ausentes ficam marcados e não são inventados. | spec 003         |

## 4. Mapa de features

Cada feature é uma pasta `specs/NNN-nome/` com `spec.md`, `plan.md` e `tasks.md`.

| Feature | Nome                                   | Requisitos do briefing          | Nível         |
|---------|----------------------------------------|---------------------------------|---------------|
| 001     | Núcleo de simulação headless           | RB-01..04, 10..17, 20, 45       | Mínimo        |
| 002     | Visualização 3D e controles            | RB-03, 05, 17, 18, 19           | Mínimo        |
| 003     | Catálogo de componentes e montador de robôs | RB-24, 25                  | Completo (pedido da equipe) |
| 004     | Modalidade Sumô (Mega, Mini e LEGO)    | RB-20, 23, 25, 26               | Completo      |
| 005     | Painel de inspeção e replay            | RB-21, 22                       | Completo      |
| 006     | Modalidade Seguidor de Linha           | RB-23, 25, 26                   | Além do completo |
| 007     | Modalidade Trekking                    | RB-23, 25, 26                   | Além do completo |
| 008     | Modalidade Futebol de robôs            | RB-20, 23, 25, 26               | Além do completo |
| 009     | Controlador remoto via WebSocket       | RB-31                           | Bônus         |

Ordem de entrega: 001 → 002 → 003 → 004 → 005 fecham o escopo completo. 006 a 009 só
começam com o escopo completo entregue e a cobertura ≥ 80%.

> Renumeração em 2026-11-20: o catálogo de componentes (pedido da equipe) entrou como 003,
> antes das modalidades, porque todas as modalidades o usam para montar robôs.
