/// <reference types="vitest/config" />
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import dts from 'vite-plugin-dts';
import {viteStaticCopy} from 'vite-plugin-static-copy';
import preserveDirectives from 'rollup-preserve-directives';

const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    preserveDirectives(),
    // typography.module.scss(믹스인)·design-system.module.scss(z-index 맵)는 import 그래프에 없어 lib 빌드가 자동으로 dist에 옮기지 않는다.
    // typography는 소비자가 @use(sass)/CSS Module import(JS)로 가져가므로 원본 scss와 타입선언(.d.ts)을, design-system은 @use로만 쓰므로 scss만 dist/styles로 복사한다.
    // exports의 ./styles/typography·./styles/design-system이 이 산출물을 가리킨다.
    viteStaticCopy({
      targets: [
        {src: 'src/styles/typography.{module.scss,d.ts}', dest: 'styles', rename: {stripBase: true}},
        {src: 'src/styles/design-system.module.scss', dest: 'styles', rename: {stripBase: true}},
      ],
    }),
    dts({
      tsconfigPath: './tsconfig.app.json',
      entryRoot: 'src',
      include: [
        'src/vite-env.d.ts',
        'src/index.ts',
        'src/styles/theme.ts',
        'src/components/**/*.ts',
        'src/components/**/*.tsx',
      ],
      exclude: ['src/**/*.stories.tsx', 'src/**/*.test.tsx'],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: path.resolve(dirname, 'src/index.ts'),
      formats: ['es'],
    },
    cssCodeSplit: false,
    rollupOptions: {
      external: [/^react($|\/)/, /^react-dom($|\/)/, 'clsx', /^radix-ui($|\/)/, /^@radix-ui\/react-icons($|\/)/],
      output: {
        format: 'es',
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
        dir: 'dist',
        assetFileNames: '[name][extname]',
      },
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./vitest.setup.ts'],
    restoreMocks: true,
  },
});
