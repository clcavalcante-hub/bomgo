import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      // Next.js resolves the real `server-only` package to a no-op via its
      // `react-server` export condition during build. Vitest runs plain
      // Node, where the package's default export throws by design — so
      // tests import this local no-op stub instead.
      'server-only': path.resolve(__dirname, 'test/stubs/server-only.ts'),
    },
  },
  test: {
    environment: 'node',
  },
})
