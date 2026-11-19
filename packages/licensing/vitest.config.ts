import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: ['src/**/*.mjs'],
      exclude: ['src/index.mjs', '**/vitest.config.ts'],
      reporter: ['text', 'html'],
      thresholds: { lines: 90, functions: 90, branches: 70, statements: 90 },
    },
  },
});
