import {defineConfig, globalIgnores} from 'eslint/config';
import type {Linter} from 'eslint';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import pluginQuery from '@tanstack/eslint-plugin-query';

const deprecatedConfig: Linter.Config = {
  languageOptions: {
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
  rules: {
    '@typescript-eslint/no-deprecated': 'error',
  },
};

const customRules: Linter.Config = {
  rules: {
    'react-hooks/error-boundaries': 'off',
    '@typescript-eslint/no-unused-vars': ['error', {argsIgnorePattern: '^_', varsIgnorePattern: '^_'}],
  },
};

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  ...pluginQuery.configs['flat/recommended'],
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
  deprecatedConfig,
  customRules,
]);
