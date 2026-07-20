/**
 * Vite + React 단일레포 채용과제용 ESLint config.
 * 모노레포 base(`../../eslint.config.base.mts`) 의존을 로컬 base로 교체한 단일레포용 자기완결 config.
 *
 * 사용: `npm create vite` 스캐폴드 후 이 파일을 `eslint.config.js`로, `eslint.config.base.mjs`와 함께 프로젝트 루트에 둔다.
 */
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import react from 'eslint-plugin-react';
import tseslint from 'typescript-eslint';
import checkFile from 'eslint-plugin-check-file';
import {defineConfig, globalIgnores} from 'eslint/config';
import {
  baseRules,
  createFilenameExportConventionRule,
  mockFilesConfig,
  sharedBoundaryConfig,
  testFilesConfig,
} from './eslint.config.base.mjs';

export default defineConfig([
  globalIgnores(['dist', '**/*.d.ts']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      ...tseslint.configs.recommendedTypeChecked,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      react,
      'check-file': checkFile,
      custom: {rules: {'filename-export-convention': createFilenameExportConventionRule()}},
    },
    rules: {
      ...baseRules,
      'check-file/folder-naming-convention': ['error', {'src/**/*': 'KEBAB_CASE'}],
    },
  },
  sharedBoundaryConfig,
  testFilesConfig,
  mockFilesConfig,
  {
    files: ['**/*.test.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },
]);
