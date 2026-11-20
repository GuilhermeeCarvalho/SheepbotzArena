# Contrato: arquivo de mundo (versão 1)

Arquivo JSON (UTF-8). Unidades: metros, segundos, radianos, kg. Pontos são pares
`[x, y]`. Todo número deve ser finito. Campos não listados são rejeitados
(`UNKNOWN_FIELD`). Referências: spec FR-001 a FR-004, FR-011 a FR-017; research D-10.

## Exemplo completo

```json
{
  "version": 1,
  "name": "Corredor com caixa",
  "seed": 42,
  "dt": 0.05,
  "arena": { "width": 4, "height": 3, "walls": true },
  "floor": {
    "reflectance": 0.5,
    "color": "#808080",
    "regions": [
      { "type": "disc", "center": [0, 0], "radius": 0.5, "reflectance": 0.1, "color": "#111111" },
      { "type": "ring", "center": [0, 0], "innerRadius": 0.45, "outerRadius": 0.5, "reflectance": 0.9 },
      { "type": "rect", "center": [1, 1], "width": 0.4, "height": 0.2, "angle": 0, "reflectance": 0.9 },
      { "type": "line", "points": [[-1, -1], [1, -1]], "width": 0.02, "reflectance": 0.9 }
    ]
  },
  "obstacles": [
    { "id": "parede", "type": "wall", "from": [1.5, -1], "to": [1.5, 1] },
    { "id": "caixa", "type": "box", "center": [-1, 0.8], "width": 0.3, "height": 0.3, "angle": 0.5 },
    { "id": "pilar", "type": "disc", "center": [-1, -0.8], "radius": 0.15 }
  ],
  "robots": [
    {
      "id": "r1",
      "name": "Explorador",
      "color": "#e53935",
      "pose": { "x": 0, "y": 0, "theta": 0 },
      "radius": 0.1,
      "mass": 1.0,
      "maxLinearSpeed": 1.0,
      "maxAngularSpeed": 6.283185307179586,
      "controller": "controllers/avoid-obstacles.js",
      "odometry": { "noise": 0 },
      "sensors": [
        { "id": "laser", "type": "laser", "position": [0, 0], "angle": 0, "rays": 5, "fov": 1.5707963267948966, "maxRange": 2, "noise": 0 },
        { "id": "sonar", "type": "sonar", "position": [0.1, 0], "angle": 0, "rays": 3, "fov": 0.5235987755982988, "maxRange": 1.5 },
        { "id": "frente", "type": "bumper", "from": -1.5707963267948966, "to": 1.5707963267948966 },
        { "id": "piso", "type": "floor", "position": [0.1, 0] }
      ]
    }
  ]
}
```

## Campos

### Raiz

| Campo | Tipo | Obrigatório | Padrão | Regra |
|-------|------|-------------|--------|-------|
| `version` | inteiro | sim | — | deve ser `1` (`UNSUPPORTED_VERSION`) |
| `name` | texto | não | `"Mundo sem nome"` | não vazio |
| `seed` | inteiro | não | `1` | 0 ≤ seed ≤ 4 294 967 295 |
| `dt` | número | não | `0.05` | 0 < dt ≤ 0,1 |
| `modality` | texto | não | ausente | deve existir no registro de modalidades (`UNKNOWN_MODALITY`) |
| `modalityOptions` | objeto | não | ausente | repassado à modalidade, que o valida |
| `arena` | objeto | sim | — | ver abaixo |
| `floor` | objeto | não | piso uniforme 0,5 | ver abaixo |
| `obstacles` | lista | não | `[]` | ids únicos |
| `robots` | lista | não | `[]` | ids únicos |

### `arena`

Retângulo centrado na origem.

| Campo | Tipo | Obrigatório | Padrão | Regra |
|-------|------|-------------|--------|-------|
| `width` | número | sim | — | > 0 |
| `height` | número | sim | — | > 0 |
| `walls` | booleano | não | `false` | se `true`, as quatro bordas são paredes |

### `floor`

| Campo | Tipo | Obrigatório | Padrão | Regra |
|-------|------|-------------|--------|-------|
| `reflectance` | número | não | `0.5` | 0 ≤ r ≤ 1 |
| `color` | texto | não | `"#808080"` | `#rgb` ou `#rrggbb` |
| `regions` | lista | não | `[]` | ordem importa: a última que contém o ponto vence |

Região (`type` discrimina; toda região tem `reflectance` obrigatório em [0, 1] e `color`
opcional):

| `type` | Campos | Regras |
|--------|--------|--------|
| `rect` | `center`, `width`, `height`, `angle` (padrão 0) | largura e altura > 0 |
| `disc` | `center`, `radius` | raio > 0 |
| `ring` | `center`, `innerRadius`, `outerRadius` | 0 ≤ interno < externo (`INVALID_GEOMETRY`) |
| `line` | `points` (≥ 2), `width` | largura > 0; ponto está dentro se sua distância à poligonal ≤ largura/2 |

### `obstacles[]`

| `type` | Campos | Regras |
|--------|--------|--------|
| `wall` | `id`, `from`, `to` | comprimento > 0 (`INVALID_GEOMETRY`) |
| `box` | `id`, `center`, `width`, `height`, `angle` (padrão 0) | largura e altura > 0 |
| `disc` | `id`, `center`, `radius` | raio > 0 |

`color` (opcional) é aceito em qualquer obstáculo, apenas para exibição.

### `robots[]`

| Campo | Tipo | Obrigatório | Padrão | Regra |
|-------|------|-------------|--------|-------|
| `id` | texto | sim | — | `^[A-Za-z0-9_-]+$`, único |
| `name` | texto | não | igual a `id` | — |
| `color` | texto | não | `"#1e88e5"` | `#rgb` ou `#rrggbb` |
| `pose` | `{x, y, theta}` | sim | — | dentro da arena (ver regras semânticas) |
| `radius` | número | sim | — | > 0 |
| `mass` | número | não | `1.0` | > 0 |
| `maxLinearSpeed` | número | não | `1.0` | > 0 |
| `maxAngularSpeed` | número | não | `2π` | > 0 |
| `controller` | texto | não | ausente | caminho relativo ao arquivo de mundo (usado pela CLI) |
| `odometry` | `{noise}` | não | `{noise: 0}` | noise ≥ 0 |
| `sensors` | lista | não | `[]` | ids únicos dentro do robô |

### `robots[].sensors[]`

| `type` | Campos (padrão) | Regras |
|--------|-----------------|--------|
| `laser` | `id`, `position` (`[0,0]`), `angle` (`0`), `rays`, `fov`, `maxRange`, `noise` (`0`) | 1 ≤ rays ≤ 360 (inteiro); 0 < fov ≤ 2π; maxRange > 0; noise ≥ 0 |
| `sonar` | iguais ao laser | iguais ao laser |
| `bumper` | `id`, `from`, `to` | 0 < to − from ≤ 2π; ângulos no referencial do robô |
| `floor` | `id`, `position`, `noise` (`0`) | noise ≥ 0 |

`position` e `angle` estão no referencial do robô (x para a frente, y para a esquerda).

## Regras semânticas (após o esquema)

Executadas somente se o esquema for válido; todos os problemas são acumulados.

1. `id` repetido entre robôs, entre obstáculos ou entre sensores do mesmo robô →
   `DUPLICATE_ID` no caminho da **segunda** ocorrência.
2. `modality` não registrada → `UNKNOWN_MODALITY`; se registrada, a modalidade pode
   acrescentar problemas próprios (contrato `modality.md`).
3. Robô fora da arena → `OUT_OF_ARENA`: com `walls: true`, o disco inteiro deve caber na
   arena; com `walls: false`, basta o centro estar dentro (bordas inclusivas).
4. Robô sobreposto a obstáculo ou a outro robô (sobreposição > `1e-6 m`; encostar é
   permitido) → `INITIAL_OVERLAP`, citando o elemento (`obstacles[2]` ou `robots[0]`).

## Formato dos erros

```json
{ "path": "robots[0].sensors[1].type", "code": "UNKNOWN_TYPE", "message": "tipo de sensor desconhecido 'lidar3d'; use laser, sonar, bumper ou floor" }
```

`path` usa notação de ponto e colchetes; erros da raiz usam `""`. Ao exibir para o
usuário: `<path ou (raiz)>: <message>`, um por linha, na ordem em que aparecem no arquivo.

### Catálogo de códigos

| Código | Quando | Mensagem (modelo) |
|--------|--------|-------------------|
| `JSON_SYNTAX` | texto não é JSON válido | `JSON inválido na linha {l}, coluna {c}` |
| `REQUIRED` | campo obrigatório ausente | `campo obrigatório ausente` |
| `UNKNOWN_FIELD` | campo não previsto | `campo desconhecido '{nome}'` |
| `INVALID_TYPE` | tipo errado | `esperado {tipo esperado}` |
| `OUT_OF_RANGE` | número fora do intervalo | ex.: `deve ser maior que 0`, `deve estar entre 0 e 1` |
| `UNKNOWN_TYPE` | `type` desconhecido em sensor, obstáculo ou região | `tipo de {elemento} desconhecido '{valor}'; use {opções}` |
| `INVALID_GEOMETRY` | parede de comprimento 0, anel inválido, linha com < 2 pontos | descreve a geometria |
| `UNSUPPORTED_VERSION` | `version` ≠ 1 | `versão de formato não suportada: {v}; use 1` |
| `DUPLICATE_ID` | id repetido | `identificador '{id}' repetido` |
| `UNKNOWN_MODALITY` | modalidade não registrada | `modalidade desconhecida '{m}'` |
| `OUT_OF_ARENA` | pose inicial fora da arena | `robô '{id}' começa fora da arena` |
| `INITIAL_OVERLAP` | sobreposição inicial | `robô '{id}' começa sobreposto a {elemento}` |
