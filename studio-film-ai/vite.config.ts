import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { createRequire } from 'node:module';
const { localizeSource } = createRequire(import.meta.url)('./scripts/bekal-locale.cjs');

export default defineConfig({
  plugins: [{ name: 'bekal-indonesian-ui', enforce: 'pre', transform(code, id) { if (/\/src\/.*\.tsx?$/.test(id) && !id.includes('.test.')) return { code: localizeSource(code, id), map: null }; } }, react()],
  base: '/assets/studio-film-ai/',
  define: { 'process.env': {} },
  build: { outDir: 'dist', emptyOutDir: true, sourcemap: false, assetsDir: '', rollupOptions: { input: resolve(__dirname, 'studio.html') } },
});
