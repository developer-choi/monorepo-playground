import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import react from 'eslint-plugin-react';
import tseslint from 'typescript-eslint';
import checkFile from 'eslint-plugin-check-file';
import {defineConfig, globalIgnores} from 'eslint/config';
import {baseRules, createFilenameExportConventionRule} from '../../eslint.config.base.mts';

export default defineConfig([
  globalIgnores(['dist']),
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
]);
