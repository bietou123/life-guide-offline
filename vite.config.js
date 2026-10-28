import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 4096,
    target: 'es2019',
  },
  server: {
    port: 5188,
    host: '0.0.0.0',
  },
});
