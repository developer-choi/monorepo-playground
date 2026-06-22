// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import react from 'eslint-plugin-react';
import tseslint from 'typescript-eslint';
import checkFile from 'eslint-plugin-check-file';
import {defineConfig, globalIgnores} from 'eslint/config';
import {baseRules, createFilenameExportConventionRule} from '../../eslint.config.base.mts';

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
  {
    files: ['**/*.stories.{ts,tsx}'],
    rules: {
      '@typescript-eslint/naming-convention': [
        'error',
        {selector: 'default', format: ['camelCase']},
        {selector: 'variable', format: ['camelCase', 'UPPER_CASE', 'PascalCase']},
        {selector: 'parameter', format: ['camelCase'], leadingUnderscore: 'allow'},
        {selector: 'function', format: ['camelCase', 'PascalCase']},
        {selector: 'typeLike', format: ['PascalCase']},
        {selector: 'property', format: ['camelCase', 'UPPER_CASE']},
        {selector: 'method', format: ['camelCase']},
        {selector: 'import', format: null},
        {selector: 'variable', modifiers: ['destructured'], format: null},
      ],
    },
  },
]);
