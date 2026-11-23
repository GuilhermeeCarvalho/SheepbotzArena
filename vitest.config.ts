import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: { src: fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    include: ['tests/**/*.test.{ts,tsx}'],
    setupFiles: ['tests/setup-dom.ts'],
    // Testes da CLI (worker thread) e de exemplos longos ficam lentos sob cobertura.
    testTimeout: 30_000,
    css: { modules: { classNameStrategy: 'non-scoped' } },
    exclude: ['tests/perf/**', 'node_modules/**'],
    reporters: ['default', ['json', { outputFile: 'coverage/test-results.json' }]],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      // Bootstrap sem lógica (plan 001, D-16)
      exclude: ['src/cli/main.ts', 'src/app/main.tsx', 'src/**/*.d.ts'],
      reporter: ['text', 'html', 'json-summary'],
      reportsDirectory: 'coverage',
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
    },
  },
});
