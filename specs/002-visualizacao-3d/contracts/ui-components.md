# Contrato: biblioteca de componentes (`src/ui`)

Referências: spec FR-013; research D-06, D-07. Todos os componentes são exportados por
nome em `src/ui/index.ts`, aceitam `className` e repassam atributos nativos quando faz
sentido. Estilos só por tokens de `tokens.css`.

| Componente | Props principais | Uso |
|------------|------------------|-----|
| `Button` | `variant: 'primary' \| 'secondary' \| 'ghost' \| 'danger'`, `size: 'sm' \| 'md'`, `icon?`, `loading?` | ações |
| `IconButton` | `label` (acessível, obrigatório), `icon`, `variant`, `active?` | barras de ferramentas |
| `ButtonGroup` | `children` | agrupa botões encostados |
| `Toolbar` | `children`, `align?` | barra horizontal com separadores |
| `Panel` | `title?`, `actions?`, `children`, `padded?` | superfícies |
| `Tabs` | `tabs: { id, label, icon?, badge? }[]`, `value`, `onChange` | abas acessíveis (`role="tablist"`) |
| `SegmentedControl` | `label`, `options: { value, label, title?, disabled? }[]`, `value`, `onChange` | escolha única entre poucas opções (`role="radiogroup"`); `title` vira o nome acessível de opções só com ícone |
| `Select` | `label?`, `options: { value, label }[]`, `value`, `onChange` | seletores |
| `Toggle` | `label`, `checked`, `onChange` | liga/desliga (`role="switch"`) |
| `Badge` | `tone: 'neutral' \| 'success' \| 'warning' \| 'danger' \| 'info'` | rótulos |
| `StatusDot` | `tone`, `label` | indicador de estado |
| `Stat` | `label`, `value`, `unit?` | números (fonte monoespaçada) |
| `Field` | `label`, `hint?`, `children` | rótulo de campo |
| `IssueList` | `issues: { location?: string; message: string }[]`, `title?` | erros de validação |
| `CodeEditor` | `value`, `onChange`, `language: 'javascript' \| 'json'`, `ariaLabel` | CodeMirror 6 |
| `EmptyState` | `title`, `description?`, `icon?` | vazio |
| `Kbd` | `children` | atalhos |
| `SplitLayout` | `main`, `aside`, `asideWidth?` | layout principal + lateral |
