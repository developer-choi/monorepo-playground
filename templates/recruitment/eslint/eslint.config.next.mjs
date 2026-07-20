/**
 * Next.js 단일레포 채용과제용 ESLint config.
 * MP `apps/examples/eslint.config.mjs` 패턴 기반. 모노레포·예제앱 전용분 제외:
 *   - `@tanstack/eslint-plugin-query` (예제앱이 react-query를 써서 붙인 것)
 *   - `custom/src-folder-whitelist` (MP 내부 폴더 구조 전용 룰)
 *
 * 사용: `create-next-app` 스캐폴드 후 이 파일을 `eslint.config.mjs`로, `eslint.config.base.mjs`와 함께 프로젝트 루트에 둔다.
 */
/* eslint-disable @typescript-eslint/naming-convention -- ESLint rule keys(kebab-case)·plugin namespace 등 외부 컨벤션 다수 */
import {defineConfig, globalIgnores} from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import tseslint from 'typescript-eslint';
import checkFile from 'eslint-plugin-check-file';
import {baseRules, createFilenameExportConventionRule, mockFilesConfig, testFilesConfig} from './eslint.config.base.mjs';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...tseslint.configs.recommendedTypeChecked,
  // eslint-config-next 기본 ignores + 루트 설정 파일(tsconfig에 없어 type-aware 파싱에서 빠져야 함).
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    '**/*.config.{js,mjs,cjs,ts}', // postcss.config.mjs, next.config.ts 등
    'eslint.config.base.mjs', // 이 설정이 import하는 공유 base (린트 대상 아님)
  ]),
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['eslint.config.mjs', 'eslint.config.js'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      ...baseRules,
      'react-hooks/error-boundaries': 'off',
      '@typescript-eslint/no-deprecated': 'error',
      'check-file/folder-naming-convention': ['error', {'src/**/*': 'NEXT_JS_APP_ROUTER_CASE'}],
    },
    plugins: {
      custom: {
        rules: {
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
