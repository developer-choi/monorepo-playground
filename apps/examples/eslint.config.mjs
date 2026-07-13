/* eslint-disable @typescript-eslint/naming-convention -- ESLint rule keys(kebab-case)와 plugin namespace 등 외부 컨벤션 다수 */
import {defineConfig, globalIgnores} from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import pluginQuery from '@tanstack/eslint-plugin-query';
import tseslint from 'typescript-eslint';
import checkFile from 'eslint-plugin-check-file';
import {
  baseRules,
  createFilenameExportConventionRule,
  mockFilesConfig,
  testFilesConfig,
} from '../../eslint.config.base.mts';

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
      'custom/app-route-file-whitelist': 'error',
      'check-file/folder-naming-convention': ['error', {'src/**/*': 'NEXT_JS_APP_ROUTER_CASE'}],
    },
    plugins: {
      custom: {
        rules: {
          'src-folder-whitelist': createSrcFolderWhitelistRule(),
          'app-route-file-whitelist': createAppRouteFileWhitelistRule(),
          'filename-export-convention': createFilenameExportConventionRule(),
        },
      },
      'check-file': checkFile,
    },
  },
  testFilesConfig,
  mockFilesConfig,
]);

export default eslintConfig;

const ALLOWED_FOLDERS = ['components', 'hooks', 'assets'];
const SRC_PREFIX_LENGTH = 5; // '/src/'.length
const MIN_SEGMENTS_FOR_DEPTH_CHECK = 4;

const APP_PREFIX = '/src/app/';
const APP_ROUTE_FILE_NAMES = [
  'page',
  'layout',
  'template',
  'error',
  'loading',
  'not-found',
  'default',
  'global-error',
  'route',
  'sitemap',
  'robots',
  'manifest',
  'icon',
  'apple-icon',
  'opengraph-image',
  'twitter-image',
];

/**
 * app↔src 1:1 매칭(ARCHITECTURE.md): src/app/ 라우트 폴더에는 Next.js 라우트 파일만 두고,
 * 데모·컴포넌트·훅 병치를 차단한다. api/(Route Handler)는 dto 등 보조 모듈을 허용해 제외.
 * @returns {import('eslint').Rule.RuleModule}
 */
function createAppRouteFileWhitelistRule() {
  return {
    meta: {
      type: 'layout',
      messages: {
        invalidFile:
          'src/app/ 라우트 폴더에 "{{ name }}"을 둘 수 없습니다. 컴포넌트·훅은 src/{카테고리}/{주제}/ 하위로 옮기세요 (ARCHITECTURE.md app↔src 1:1). 허용 파일명: {{ allowed }}',
      },
    },
    create(context) {
      return {
        Program(node) {
          const filePath = context.filename.replace(/\\/g, '/');
          const appIndex = filePath.indexOf(APP_PREFIX);
          if (appIndex === -1) {
            return;
          }

          const segments = filePath.slice(appIndex + APP_PREFIX.length).split('/');
          if (segments[0] === 'api') {
            return;
          }

          const fileName = segments[segments.length - 1];
          const baseName = fileName.replace(/\..*$/, '');
          if (!APP_ROUTE_FILE_NAMES.includes(baseName)) {
            context.report({
              node,
              messageId: 'invalidFile',
              data: {name: fileName, allowed: APP_ROUTE_FILE_NAMES.join(', ')},
            });
          }
        },
      };
    },
  };
}

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

          const segments = filePath.slice(srcIndex + SRC_PREFIX_LENGTH).split('/');

          if (segments[0] === 'app' || segments[0] === 'shared') {
            return;
          }
          if (segments.length < MIN_SEGMENTS_FOR_DEPTH_CHECK) {
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
