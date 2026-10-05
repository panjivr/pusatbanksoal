import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  base: '/assets/studio-film-ai/',
  define: { 'process.env': {} },
  build: { outDir: 'dist', emptyOutDir: true, sourcemap: false, assetsDir: '', rollupOptions: { input: resolve(__dirname, 'studio.html') } },
});
