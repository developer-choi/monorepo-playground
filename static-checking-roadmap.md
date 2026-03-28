# MP Static Checking 로드맵

## 목표

Static checking(린트 + 타입체크)으로 AI/사람이 쓴 코드의 리뷰 비용을 줄인다.
TP에서 검증한 규칙들을 MP 모노레포 구조에 맞게 반영한다.

## Phase 1: 설정 중앙화

모노레포의 장점을 살려 공통 설정을 루트에 두고 워크스페이스가 상속한다.

- [ ] `tsconfig.base.json` 루트에 생성 (strict 옵션 + TP에서 검증한 옵션)
- [ ] 각 워크스페이스 tsconfig이 base를 extends
- [ ] `eslint.config.base.mjs` 루트에 생성 (공통 규칙)
- [ ] 각 워크스페이스 eslint config이 base를 import해서 확장

## Phase 2: Git Hooks & Scripts

2단계 검증 구조를 세팅한다.

- [ ] `lint-staged` 설치 및 설정 (`eslint --fix` — fixable 규칙은 자동 수정 후 re-staging)
- [ ] `test-staged` 스크립트: lint-staged (eslint --fix) + turbo check-types (pre-commit용)
- [ ] `test-all` 스크립트: turbo lint (fix 없음, 리포트만) + turbo check-types (CI/pre-push용)
- [ ] `.husky/pre-commit` → `npm run test-staged`
- [ ] `.husky/pre-push` → `npm run test-all`

| | pre-commit (test-staged) | pre-push (test-all) |
|---|---|---|
| ESLint | lint-staged (`eslint --fix`) | turbo lint (fix 없음) |
| tsc | turbo check-types | turbo check-types |
| 동작 | 고칠 수 있는 건 고치고, 못 고치면 차단 | 에러 있으면 push 차단만 |

## Phase 3: Lint 규칙 반영

TP에서 검증한 규칙들을 base config에 추가한다. (중앙화 덕분에 한 곳만 수정)

### ESLint 규칙 (8개)
- [ ] `no-floating-promises`
- [ ] `switch-exhaustiveness-check`
- [ ] `no-misused-promises`
- [ ] `prefer-nullish-coalescing`
- [ ] `eqeqeq` (always)
- [ ] `no-unnecessary-condition`
- [ ] `no-console` (allow warn/error)
- [ ] `restrict-template-expressions` (allowNullish: false) — 프리셋 기본값이 nullish 허용이라 수동 오버라이드 필요
- [ ] `max-params` (2) — 함수 매개변수 2개 초과 시 객체로 묶도록 강제

### recommended-type-checked 프리셋
- [ ] `plugin:@typescript-eslint/recommended-type-checked` 추가 (17개 규칙 일괄 활성화)

### tsconfig 옵션 (2개)
- [ ] `noUncheckedIndexedAccess`
- [ ] `noFallthroughCasesInSwitch`

## Phase 4: 검증용 데모 파일

- [ ] TP의 lint-rules 예시 파일들을 MP에 맞게 포팅
- [ ] 린트/tsc 실행해서 전부 잡히는지 확인

## 검증

- `npm run test-staged` → staged 파일 린트 + 전체 타입체크 통과
- `npm run test-all` → 전체 린트 + 전체 타입체크 통과
- 데모 파일의 BAD 패턴이 모두 에러로 잡히는지 확인
