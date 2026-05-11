import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      thresholds: {
        lines: 60,
        functions: 55,
        branches: 75,
        statements: 60,
      },
      exclude: [
        'src/test-setup.ts',
        'src/index.ts',
        '**/*.d.ts',
        '**/*.config.*',
        '**/node_modules/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@fintech/utils': path.resolve(__dirname, '../utils/src'),
    },
  },
});
