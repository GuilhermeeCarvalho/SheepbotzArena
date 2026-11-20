import js from '@eslint/js';
import tseslint from 'typescript-eslint';

// Direção de dependências (constitution, princípio IV; research 001 D-15)
const coreRestrictions = {
  patterns: [
    {
      group: ['**/modalities/**', 'src/modalities/**'],
      message: 'O núcleo não pode depender de modalidades.',
    },
    {
      group: ['**/app/**', 'src/app/**', '**/ui/**', 'src/ui/**'],
      message: 'O núcleo não pode depender da interface.',
    },
    {
      group: ['**/cli/**', 'src/cli/**'],
      message: 'O núcleo não pode depender da linha de comando.',
    },
    {
      group: ['react', 'react-dom', 'react/*', 'three', 'three/*', '@react-three/*'],
      message: 'O núcleo é independente de renderização.',
    },
    { group: ['node:*'], message: 'O núcleo deve rodar também no navegador.' },
  ],
};

export default tseslint.config(
  {
    ignores: [
      'coverage/**',
      'dist/**',
      'node_modules/**',
      '.specify/**',
      '.claude/**',
      '.opencode/**',
      'tests/fixtures/controllers/**',
      'examples/controllers/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/core/**/*.ts'],
    rules: { 'no-restricted-imports': ['error', coreRestrictions] },
  },
  {
    files: ['src/modalities/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['src/app/**', '**/app/**', 'src/ui/**', '**/ui/**', 'react', 'three'],
              message: 'Modalidades não dependem da interface.',
            },
          ],
        },
      ],
    },
  },
  {
    // Biblioteca de componentes genérica (constitution v2.1.0)
    files: ['src/ui/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['**/core/**', '**/core', 'src/core/**'], message: 'src/ui não depende do núcleo.' },
            { group: ['**/modalities/**', '**/modalities'], message: 'src/ui não depende de modalidades.' },
            { group: ['**/app/**', '**/app'], message: 'src/ui não depende da aplicação.' },
          ],
        },
      ],
    },
  },
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: { globals: { process: 'readonly', console: 'readonly' } },
  },
);
