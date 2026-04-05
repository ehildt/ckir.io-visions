import path from 'node:path';

import vue from '@vitejs/plugin-vue';
import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest-globals.ts'],
    exclude: [...configDefaults.exclude, '**/node_modules/**', '**/dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**'],
      exclude: [
        'src/main.ts',
        'src/test/**',
        'src/**/*.type.ts',
        'src/types/**',
        'src/api/**',
        'src/assets/**',
      ],
    },
  },
});
