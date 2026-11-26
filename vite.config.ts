import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { cp } from 'node:fs/promises';
import { resolve } from 'node:path';

export default defineConfig(({ command }) => ({
  base: '/skills-hub/',
  plugins: [react(), {
    name: 'publish-resource-files',
    async closeBundle() {
      if (command !== 'build') return;
      for (const path of ['catalog.json', 'skills', 'prompts']) {
        await cp(resolve(path), resolve('dist', path), { recursive: true });
      }
    }
  }],
  build: {
    emptyOutDir: false,
    rollupOptions: { input: { skills: resolve('index.html'), prompts: resolve('prompts.html') } }
  }
}));
