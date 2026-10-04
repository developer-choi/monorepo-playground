import globals from 'globals';
import react from 'eslint-plugin-react';
import tseslint from 'typescript-eslint';
import checkFile from 'eslint-plugin-check-file';
import {defineConfig, globalIgnores} from 'eslint/config';
import {baseRules, createFilenameExportConventionRule, testFilesConfig} from '../../eslint.config.base.mts';

export default defineConfig([
  globalIgnores(['dist', '**/*.d.ts']),
  {
    files: ['**/*.ts'],
    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {...globals.browser, ...globals.node},
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      // baseRules에 react/* 규칙이 들어 있어 플러그인을 등록만 해 둔다. .ts 파일이라 실제로 걸리지는 않는다.
      react,
      'check-file': checkFile,
      custom: {rules: {'filename-export-convention': createFilenameExportConventionRule()}},
    },
    rules: {
      ...baseRules,
      'check-file/folder-naming-convention': ['error', {'src/**/*': 'KEBAB_CASE'}],
    },
  },
  testFilesConfig,
]);
