# T20. 채용과제용 ESLint 프리셋 — "미리 합쳐두고 빼기" 방향 검토

## 작성 맥락

이 문서는 **채용과제 프로젝트(`assignment-playground`)에서 PR_1_PLAN 진행 중 도출된 개선 아이디어**의 회고를 MP로 환류한 것이다. 채용과제 레포는 폐기 예정이므로 본 아이디어 자체와 그 발생 맥락을 MP 측에 남긴다.

### 발생 환경

- 프로젝트: `assignment-playground` (랭디 채용과제, 폐기 예정)
- 진행 세션: `PR_1_PLAN` step-4 「구현 방침 상세화」
- 발생 일자: 2026-05-25
- 사용자 발화 (요청): "tasks로 MP에 있는 린트 종류별로 파일 모아두는 느낌으로 채용과제에서 린트설정 빨리할 수 있게 방법을 생각해보자는거 넣어줘. 기왕이면 미리 합쳐두고 나서 무엇을 빼는 느낌으로."

## 동기

PR_1_PLAN에서 채용과제용 ESLint config(`eslint.config.mjs`)에 MP `docs/static-checking/eslint.md` 의 baseRules를 옮기는 작업의 **계획·근거 작성 비용이 컸다**.

원인:

- MP의 ESLint 룰이 여러 위치에 분산되어 있음
  - `eslint.config.base.mts`에 정의된 baseRules
  - 워크스페이스별 추가 룰 (`apps/examples/eslint.config.mjs`, `packages/design-system/eslint.config.js`, `packages/recruitment/eslint.config.js`)
  - `recommendedTypeChecked` 프리셋 (`@typescript-eslint`)
  - `check-file/folder-naming-convention` (워크스페이스별 패턴 분기)
- 채용과제 적용 시 제외할 항목(`stylelint` 연동, 모노레포 전용 import 룰 등)의 식별 기준이 산문 본문에 박혀 있어 빠르게 가져가기 어려움
- 결과: 채용과제 PR1에서 ESLint config 한 커밋을 작성하기 위해 `eslint.md` 본문 678줄을 읽고 항목별 판단을 반복

이 비용은 **다음 채용과제·사이드 프로젝트에서도 똑같이 반복**된다. 한 번 정리해두면 매번 줄어든다.

## 핵심 아이디어 — 미리 합친 프리셋 + 카테고리 정리

방향:

1. **이미 합쳐진 한 덩어리** — MP에 채용과제·사이드 프로젝트가 그대로 import할 수 있는 ESLint flat config 프리셋을 두기. 예: `docs/patterns/setup/eslint-preset/recruitment.mts` (실제 사용 가능한 ts 파일) 또는 별도 패키지로 분리.
2. **빼는 룰을 카테고리로 그루핑** — 단일 프로젝트가 "여기서 이건 빼고 시작"이 가능하도록.

가능한 카테고리 분류 (1차 안):

| 카테고리 | 룰 예시 | 제외 트리거 |
|---|---|---|
| 코어 (전부 가져감) | `@typescript-eslint/no-explicit-any`, `no-floating-promises`, `prefer-nullish-coalescing`, `naming-convention`, `eqeqeq`, `id-length`, `no-restricted-syntax`(enum 금지·alt="" 금지 등), `recommendedTypeChecked` 프리셋 전체 | 절대 빼지 않음 |
| Tailwind 단독 시 제외 | `stylelint` 연동 (별도 도구. ESLint config와 직접 무관하지만 lint-staged 묶음) | 프로젝트에 `.scss`/CSS Module 미사용 + 도입 계획 없음 (사용자가 명시) |
| 모노레포 전용 | 모노레포 alias import 룰, 워크스페이스별 packages 경계 룰 | 단일 프로젝트 |
| 회사 컨벤션 (선택) | `subject-korean` 커스텀 commitlint 룰 (ESLint는 아니지만 같은 묶음 도구 부류로 패키지화 검토) | 단일 메인 에이전트 환경에서는 가치 < 설명 비용 |
| 워크스페이스 분기 룰 | `check-file/folder-naming-convention`의 `NEXT_JS_APP_ROUTER_CASE` vs `KEBAB_CASE` vs `PASCAL_CASE` 분기 | 프로젝트 구조에 맞춰 한 가지 선택 |
| Storybook 예외 | `**/*.stories.{ts,tsx}` 파일의 variable PascalCase 재허용 | Storybook 미사용 |
| memo 예외 처리 | `memo`로 감싼 컴포넌트의 line-level disable + 사유 주석 | React Compiler 사용 시 (수동 memo 자체가 anti-pattern이라 사례 적음) |

본 카테고리 분류는 1차 안이며, MP 내부 검토로 정합·축소·세분화 필요.

## 위치 후보

### (A) `docs/patterns/setup/eslint-preset/` 하위에 실제 import 가능한 ts 파일

```
docs/patterns/setup/eslint-preset/
├── README.md          (사용법: import + override 방법)
├── core.mts           (코어 룰 — 무조건 가져감)
├── tailwind-only.mts  (Tailwind 단독일 때 적용 — stylelint 미연동)
├── monorepo.mts       (모노레포에서만 적용)
└── recruitment.mts    (core + tailwind-only + 워크스페이스별 분기 빼기 — 채용과제 즉시 사용)
```

채용과제 `eslint.config.mjs`:

```ts
import recruitmentPreset from '@monorepo-playground/eslint-preset/recruitment.mts';

export default defineConfig([
  ...recruitmentPreset,
  // 여기서 추가 override
]);
```

### (B) 별도 npm 패키지로 분리

`@monorepo-playground/eslint-preset` 패키지로 분리. 외부 채용과제 레포에서 npm install로 가져감. 모노레포 워크스페이스로 분리는 가능하나, **채용과제 레포가 모노레포 패키지에 의존**하는 형태가 됨 — 발표 시 "왜 외부 모노레포에 의존?" 질문 가능. 부적합.

### (C) 가이드만 — 실제 코드는 카피·페이스트

`docs/patterns/setup/EslintRecruitment.md`에 prefab config 전체 코드 블록 박아두고 채용과제에서 카피. 가장 간단하나 동기화 부담 (MP 룰 갱신 시 카피 본도 갱신).

(A) vs (C) 사이가 현실적. (B)는 채용과제 외부 의존 발표 리스크로 보류.

## 사용처 측 적용 시나리오

채용과제 `assignment-playground` 사례 기준 워크플로우 변화:

### 기존 (본 사고 발생 시점)

1. PR_1_PLAN step-3: MP `eslint.md` 678줄 정독 → baseRules·`recommendedTypeChecked`·check-file·제외 룰 식별 → 결정 근거 작성
2. PR_1_PLAN step-4: `eslint.config.mjs` flat config 작성 계획
3. PR_1_IMPL: 실제 `eslint.config.mjs` 작성 + FOUNDATION 코드 위반 정정
4. 비용: 정독·결정 작성·구현 모두 첫 채용과제 수준 반복

### 본 패턴 적용 후

1. PR_1_PLAN step-3: `docs/patterns/setup/eslint-preset/recruitment.mts` import 결정. 제외할 카테고리 1~2개만 사용자 확인 (현 사례: Tailwind 단독 확정 여부, 폰트 결정 같이 묶일지)
2. PR_1_PLAN step-4: `eslint.config.mjs`는 preset import 1줄 + override 몇 줄
3. PR_1_IMPL: import 한 줄·override 작성. FOUNDATION 코드 위반 정정은 동일 (preset이 무엇을 강제하는지는 그대로)

PR_1_PLAN의 ESLint 항목 작성·결정 비용이 줄어들고, 사용자의 결정 부담도 카테고리 단위(제외/포함)로 단순화.

## 미정 항목

- (A) vs (C) 선택. preset 코드 분량·MP 룰 갱신 빈도·동기화 부담을 보고 결정
- 채용과제별 도메인 차이를 preset이 어떻게 흡수할지 — scope-enum 같은 commitlint 도메인 키워드는 preset에 박을 수 없음(프로젝트별)
- preset 파일 자체에 1차 소스 인용을 어떻게 박을지 — 룰별로 `eslint.md` 본문 절을 cross-ref해야 발표 시 "이 룰 왜 적용?" 답변 가능
- preset 패턴이 ESLint 외 다른 도구(Prettier, tsconfig, husky/lint-staged, commitlint)까지 확장될지 — PR1 전체 셋업 프리셋으로 확장 가능성

## 첫 행동 (이어 작업하는 사람용)

1. `docs/static-checking/eslint.md` 본문을 읽어 카테고리 분류의 정확성·완전성 검증 (위 표는 1차 안)
2. `docs/patterns/setup/ProjectSetup.md`와 본 패턴이 어떻게 연결될지 설계
3. (A) 또는 (C) 결정 후 PR 작성. scope: `setting`

## 관련 핸드오프 문서

- `T18-MpBestPracticesMapGrep.md` — 본 사고와 같은 PR_1_PLAN 세션에서 발생한 다른 회고 (MP 1차 소스 Grep 자기면제)
- `T19-BgMemoSourceVerification.md` — 본 사고와 같은 PR_1_PLAN 세션에서 발생한 다른 회고 (BG 메모 1차 소스 검증 누락)

세 문서는 같은 채용과제 PR1 진행 중 도출됨. 함께 검토 시 PR_1_PLAN 워크플로우 전체 개선안 도출 가능.
