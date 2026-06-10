/// <reference types="vitest/config" />
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {storybookTest} from '@storybook/addon-vitest/vitest-plugin';
import {playwright} from '@vitest/browser-playwright';
import dts from 'vite-plugin-dts';
import {viteStaticCopy} from 'vite-plugin-static-copy';
import preserveDirectives from 'rollup-preserve-directives';

const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    preserveDirectives(),
    // typography.module.scss는 믹스인 라이브러리라 import 그래프에 없어 lib 빌드가 자동으로 dist에 옮기지 않는다.
    // 소비자가 @use(sass)/CSS Module import(JS)로 가져갈 수 있도록 원본 scss와 타입선언(.d.ts)을 dist/styles로 복사한다.
    // exports의 ./styles/typography가 이 산출물(default=scss, types=d.ts)을 가리킨다.
    viteStaticCopy({
      targets: [{src: 'src/styles/typography.{module.scss,d.ts}', dest: 'styles', rename: {stripBase: true}}],
    }),
    dts({
      tsconfigPath: './tsconfig.app.json',
      entryRoot: 'src',
      include: ['src/vite-env.d.ts', 'src/index.ts', 'src/components/**/*.ts', 'src/components/**/*.tsx'],
      exclude: ['src/**/*.stories.tsx', 'src/**/*.test.tsx'],
    }),
  ],
  resolve: {
    alias: {
      // eslint-disable-next-line @typescript-eslint/naming-convention -- TypeScript path alias 컨벤션
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
      external: [/^react($|\/)/, /^react-dom($|\/)/, 'clsx', /^radix-ui($|\/)/],
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
    projects: [
      {
        extends: true,
        plugins: [
          storybookTest({
            configDir: path.join(dirname, '.storybook'),
          }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [
              {
                browser: 'chromium',
              },
            ],
          },
          setupFiles: ['.storybook/vitest.setup.ts'],
        },
      },
    ],
  },
});
