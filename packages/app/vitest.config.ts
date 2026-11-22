import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts', 'app/**/*.test.ts'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/index.ts', '**/vitest.config.ts'],
      reporter: ['text', 'html'],
      thresholds: { lines: 90, functions: 90, branches: 80, statements: 90 },
    },
  },
});
