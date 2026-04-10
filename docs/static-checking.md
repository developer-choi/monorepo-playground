## 배경

정적 분석(ESLint + tsconfig)으로 코드 품질 안전망을 구축합니다.

버그를 줄이려면 에러를 잘 처리하는 것도 중요하지만, 애초에 에러가 발생하지 않도록 예방하는 것이 더 중요합니다. 예방 수단을 도입 비용이 저렴한 순서로 정리하면:

1. **정적 분석 (린트, 타입 체크)** ← 이 문서의 범위
2. 테스트 코드
3. AI 코드 리뷰

이 안전망은 AI 개발 생산성과도 직결됩니다. AI가 작성한 코드의 양이 늘수록 사람이 리뷰해야 할 양도 늘어나는데, 정적 분석이 자동으로 걸러주면 리뷰어는 로직과 설계에 집중할 수 있습니다. AI가 아래와 같은 코드를 작성하더라도 커밋 시점에 자동으로 차단됩니다:

```typescript
const data = JSON.parse(response);  // any가 조용히 퍼져나감
const count = input || 10;          // input이 0이면 10이 됨
const msg = `user: ${user.name}`;   // undefined면 "user: undefined"
```

## 설정 중앙화

각 정적 분석 도구의 공통 설정을 루트에 두고, 워크스페이스가 상속/import하는 방식으로 중앙화합니다.

- **tsconfig**: `tsconfig.base.json`을 루트에 생성하고, 각 워크스페이스의 tsconfig이 `extends`로 상속합니다.
- **ESLint**: `eslint.config.base.mts`에 공통 규칙을 export하고, 각 워크스페이스가 import해서 `rules`에 spread합니다.
- **commitlint**: `commitlint.config.ts`에서 `@commitlint/config-conventional`을 확장합니다.

## 2단계 검증 구조

### 왜 2단계인가?

커밋할 때마다 전체 린트 + 타입 체크를 돌리면 느립니다. 커밋 시점에는 변경된 파일 위주로 빠르게 검사하고, 푸시 전에 전체를 돌려 보완합니다.

| 시점 | 스크립트 | 내용 |
|------|---------|------|
| pre-commit | `test-staged` | `lint-staged && turbo check-types` |
| pre-push | `test-all` | `turbo check-types && turbo lint` |

### lint-staged — staged 파일만 린트

모노레포에서는 워크스페이스별로 eslint config 경로가 다르므로, lint-staged 패턴을 워크스페이스별로 나눠 `--config`를 명시합니다.

```json
{
  "lint-staged": {
    "apps/examples/**/*.{ts,tsx}": "eslint --fix --config apps/examples/eslint.config.mjs",
    "packages/design-system/**/*.{ts,tsx}": "eslint --fix --config packages/design-system/eslint.config.js",
    "packages/recruitment/**/*.{ts,tsx}": "eslint --fix --config packages/recruitment/eslint.config.js"
  }
}
```

### turbo check-types — 전체 타입 체크

tsc는 파일 단위 실행이 불가능하므로, `test-staged`에서도 전체 타입 체크를 수행합니다. `turbo check-types`는 각 워크스페이스의 `tsc --noEmit`을 병렬로 실행하며, 변경이 없으면 캐시를 활용합니다.

## 설정-문서 매핑

| 설정 파일 | 문서 |
|-----------|------|
| eslint.config.base.mts, 워크스페이스별 eslint config | docs/static-checking/eslint.md |
| tsconfig.base.json | docs/static-checking/tsconfig.md |
| commitlint.config.ts | docs/static-checking/commitlint.md |
