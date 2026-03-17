import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: [
      {
        find: /^tomsun-line$/,
        replacement: path.resolve(__dirname, '../../src/index.ts')
      },
      {
        find: /^tomsun-line\/adapters\/Vue$/,
        replacement: path.resolve(__dirname, '../../src/adapters/Vue/index.ts')
      }
    ]
  }
});
