import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      // eslint-disable-next-line @typescript-eslint/naming-convention -- TypeScript path alias 컨벤션
      '@': path.resolve(dirname, './src'),
    },
  },
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
});
