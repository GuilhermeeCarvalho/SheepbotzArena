import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Testes de desempenho (SC-004), fora da suíte padrão.
export default defineConfig({
  resolve: {
    alias: { src: fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: { include: ['tests/perf/**/*.test.ts'] },
});
