import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' keeps the build portable (Vercel, Netlify, GitHub Pages, sous-dossier).
export default defineConfig({
  plugins: [react()],
  base: './',
  server: { host: true, port: 5173 },
  build: { outDir: 'dist', sourcemap: false }
});
