## 설정 중앙화

`eslint.config.base.mts`에 공통 규칙을 export하고, 각 워크스페이스가 import해서 `rules`에 spread합니다.

```js
// eslint.config.base.mts
export const baseRules = {
  '@typescript-eslint/no-floating-promises': 'off', // 테스트 파일은 testFilesConfig가 error로 override
  '@typescript-eslint/return-await': ['error', 'in-try-catch'],
  '@typescript-eslint/no-misused-promises': ['error', {checksVoidReturn: {attributes: false}}],
  '@typescript-eslint/switch-exhaustiveness-check': 'error',
  // ...
};
```

```js
// apps/examples/eslint.config.mjs
import {baseRules} from '../../eslint.config.base.mts';

export default defineConfig([
  ...tseslint.configs.recommendedTypeChecked,
  {
    rules: {
      ...baseRules,
      // 워크스페이스별 추가 규칙
    },
  },
]);
```

프리셋(`recommendedTypeChecked`)은 `parserOptions.projectService`가 필요하므로 워크스페이스별로 설정합니다.

## 경고도 차단

ESLint는 `--max-warnings 0` 옵션으로 실행합니다 (워크스페이스별 `lint` 스크립트, lint-staged 모두). severity가 `'warn'`인 규칙도 실패로 간주되어 푸시·커밋을 막습니다. 새 규칙은 처음부터 `'error'`로 도입하고, `'warn'`으로 둘 이유가 있다면 [gradual-migration.md](gradual-migration.md)의 file-level disable + hook 패턴으로 대체합니다.

## 규칙 문서

도입한 규칙은 주제별 파일에 나눠 둡니다. 규칙 하나는 한 파일에만 둡니다.

| 파일 | 다루는 규칙 |
| ---- | ----------- |
| [async.md](eslint/async.md) | `no-floating-promises`, `return-await`, `no-misused-promises`, `await-thenable`, `require-await` |
| [type-safety.md](eslint/type-safety.md) | `no-explicit-any`, `ban-ts-comment`, `switch-exhaustiveness-check`, `prefer-nullish-coalescing`, `no-unnecessary-condition`, `eqeqeq`, `restrict-template-expressions`, enum 금지, catch 변수 타입 어노테이션 금지, `no-deprecated`, `no-unsafe-*`, `no-base-to-string` |
| [code-style.md](eslint/code-style.md) | `naming-convention`, `id-length`, `id-denylist`, `no-unused-vars`, `no-console`, `max-params`, `curly`, `no-magic-numbers`, `parameter-properties` |
| [react.md](eslint/react.md) | `function-component-definition`, `jsx-sort-props`, 구버전 ref API 금지, `React.X` 금지, JSX 속성 안 블록 본문 함수 금지, 인라인 스타일 객체 금지, clsx 삼항 래핑 금지, SVG 직접 작성 금지, 빈 alt 금지, `react-hooks/error-boundaries` |
| [modules.md](eslint/modules.md) | CJS 금지, 내부 barrel import 금지, `custom/filename-export-convention`, `check-file/folder-naming-convention`, `custom/app-route-file-whitelist`, `import/no-restricted-paths`(채용과제) |
| [error-handling.md](eslint/error-handling.md) | 에러를 삼키는 catch 금지 |
| [tanstack-query.md](eslint/tanstack-query.md) | useMutation `mutationFn` 래핑 금지 |
| [testing.md](eslint/testing.md) | 테스트 JSX `aria-*` 금지, `expect()` 안 목 내부 파헤치기 금지, `custom-test/no-uniform-table-column`, `.each` 금지, `vi.mock` 문자열 인자 금지, MSW `resetHandlers()` 인자 금지, MSW predicate 쿼리 금지, Playwright `networkidle` 금지 |

새 규칙을 넣을 때는 위 주제 중 맞는 파일에 넣고 이 표에 한 줄 더합니다. 맞는 주제가 없으면 파일을 새로 만들고 표에 행을 더합니다.

## 설정 위치

규칙 문서마다 따로 적지 않은 규칙은 `eslint.config.base.mts`의 `baseRules`에 있습니다. 그 밖의 위치는 규칙 제목이나 제목 바로 아래 줄에 적습니다.

- `testFilesConfig`·`mockFilesConfig`·`storyFilesConfig`: base가 export하고 각 워크스페이스 config 배열에 추가하는 파일 범위별 설정입니다.
- `— examples`: `apps/examples` config에만 추가한 규칙입니다.
- 채용과제 템플릿 전용: `templates/recruitment/eslint/eslint.config.base.mjs`에만 있고 MP 원본에는 없는 규칙입니다.
- `recommendedTypeChecked` 프리셋: `recommended`에서 업그레이드하면 활성화되며, TypeScript 컴파일러의 타입 정보를 활용합니다.

## no-restricted-syntax 항목

`no-restricted-syntax`는 AST 셀렉터로 프로젝트에서 허용하지 않는 패턴을 일괄 금지합니다. 설정에서는 배열 하나지만 문서에서는 각 항목을 주제별 파일에 나눠 둡니다. 위반 시 `eslint-disable` + 사유 주석으로 예외를 처리합니다.
