import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    testTimeout: 30000,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      // observer.ts is thin Puppeteer glue (page.evaluate, launch, settle timing)
      // that needs a real browser; its decision logic lives in observe-logic.ts
      // and is unit-tested there.
      exclude: ['src/**/*.test.ts', 'src/**/index.ts', 'src/sensor/observer.ts', '**/vitest.config.ts'],
      reporter: ['text', 'html'],
      // Branches sit lower by design: the uncovered ones are defensive type
      // guards and input-default fallbacks, not untested logic.
      thresholds: { lines: 90, functions: 90, branches: 70, statements: 90 },
    },
  },
});
