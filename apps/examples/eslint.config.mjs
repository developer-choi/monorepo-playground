import {defineConfig, globalIgnores} from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import pluginQuery from '@tanstack/eslint-plugin-query';
import tseslint from 'typescript-eslint';
import {baseRules} from '../../eslint.config.base.mts';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...pluginQuery.configs['flat/recommended'],
  ...tseslint.configs.recommendedTypeChecked,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['eslint.config.mjs'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      ...baseRules,
      'react-hooks/error-boundaries': 'off',
      '@typescript-eslint/no-deprecated': 'error',
    }
  }
]);

export default eslintConfig;
