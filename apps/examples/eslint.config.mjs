/* eslint-disable @typescript-eslint/naming-convention */
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
      'custom/src-folder-whitelist': 'error',
    },
    plugins: {
      custom: {rules: {'src-folder-whitelist': createSrcFolderWhitelistRule()}},
    },
  },
]);

export default eslintConfig;

const ALLOWED_FOLDERS = ['components', 'hooks', 'assets'];

/** @returns {import('eslint').Rule.RuleModule} */
function createSrcFolderWhitelistRule() {
  return {
    meta: {
      type: 'layout',
      messages: {
        invalidFolder: 'src/ 3뎁스 폴더 "{{ folder }}"는 허용되지 않습니다. 허용 목록: {{ allowed }}',
      },
    },
    create(context) {
      return {
        Program(node) {
          const filePath = context.filename.replace(/\\/g, '/');
          const srcIndex = filePath.indexOf('/src/');
          if (srcIndex === -1) {
            return;
          }

          const segments = filePath.slice(srcIndex + 5).split('/');

          if (segments[0] === 'app' || segments[0] === 'shared') {
            return;
          }
          if (segments.length < 4) {
            return;
          }

          const folder = segments[2];
          if (!ALLOWED_FOLDERS.includes(folder)) {
            context.report({node, messageId: 'invalidFolder', data: {folder, allowed: ALLOWED_FOLDERS.join(', ')}});
          }
        },
      };
    },
  };
}
