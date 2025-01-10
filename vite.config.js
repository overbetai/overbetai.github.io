import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    root: './',
    base: './',
    build: {
      rollupOptions: {
        input: {
          main: './index.html',
          daily: './daily/index.html'
        }
      }
    }
  });