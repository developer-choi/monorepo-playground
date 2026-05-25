# T18. PR_N_PLAN step-3 진입 시 MP best-practices-map.md Grep 자기면제 사고

## 작성 맥락

이 문서는 **채용과제 프로젝트(`assignment-playground`)에서 PR_1_PLAN 진행 중 발생한 사고**의 회고를 MP로 환류한 것이다. 채용과제 레포는 폐기 예정이므로, 이 사고에서 도출되는 룰·검증 패턴은 MP·AC(`ai-contexts`)에 남겨야 다음 채용과제·사이드 프로젝트에서 재발 방지가 된다.

### 사고가 발생한 환경

- 프로젝트: `assignment-playground` (랭디 채용과제, 폐기 예정)
- 워크플로우: AC `deploy/skills/workflow/` 「채용 모드」 7-PR 분할
- 진행 세션: `PR_1_PLAN` (프로젝트 세팅 PR — 정적 검사·포맷·커밋 인프라)
- 메인 LLM: Claude Opus 4.7
- 트리거 명령: `/workflow PR_1_PLAN 채용`
- 발생 일자: 2026-05-25

### 사고 위치를 알 수 있는 1차 소스

본 회고의 모든 인용은 아래에서 1차 검증 가능:

- AC `~/.claude/contexts/coding-standards/map.md` 「[CRITICAL] 탐색 절차」 절 (line 16~25)
- AC `~/.claude/rules/global.md` 「[CRITICAL] 마커」 절
- MP `docs/best-practices-map.md` 「프로젝트 초기 세팅」행 (line 22~28)
- MP `docs/patterns/setup/ProjectSetup.md` (제목: "Project Setup (PR1)")

## 사고 요약

PR_1_PLAN step-3 「과제 정의」 진입 시점에 메인 LLM은 "PR1 = 정적 검사 인프라 도구 세팅"이라는 작업 정의는 잡았으나, 적용할 도구·룰·옵션의 1차 소스(MP `best-practices-map.md` + `docs/patterns/setup/ProjectSetup.md`)를 **Grep으로 직접 확인하지 않고** 자기 기억·일반 지식·BG 산출물(`project.md`)만 보고 의사결정으로 직행했다.

결과적으로 사용자가 두 차례 "MP에 린트 관련 설명 없었어?", "이런것도 MP에 있지않았어?"로 지적한 뒤에야 MP 1차 소스를 Grep하여 누락을 발견했다.

발견된 누락 항목:

- `commitlint + @commitlint/config-conventional` (커밋 메시지 컨벤션)
- `husky + lint-staged` (pre-commit 게이트)
- `prettier --write` → `eslint --fix` → `vitest related --run` lint-staged 파이프라인 순서
- `.editorconfig` + `.gitattributes` + Prettier 3겹 LF 통일 구조
- `packageManager` 강제 + `preinstall: npx only-allow npm` 패턴
- tsconfig 보강 옵션 (`noFallthroughCasesInSwitch`, `noUncheckedIndexedAccess`) 명시
- ESLint baseRules 정밀 정의 (`@typescript-eslint/naming-convention`, `no-restricted-imports`로 forwardRef 금지·내부 barrel 금지, `no-restricted-syntax`로 `<button>` 직접 사용 금지·enum 금지·인라인 style 객체 금지 등)
- check-file/folder-naming 워크스페이스별 패턴 (`NEXT_JS_APP_ROUTER_CASE` 등)
- `--max-warnings 0` 옵션으로 warning까지 차단하는 정책

이 항목들이 누락된 채 PR1 의사결정이 진행되었다면 PR1 머지 후에 PR2~PR7에서 코드 스타일·커밋 메시지·import 패턴 등이 일관되지 않은 채 굳어졌을 가능성이 높다.

## Root Cause

### 직접 원인

메인 LLM이 AC `coding-standards/map.md`「[CRITICAL] 탐색 절차」 2번 항목(MP `best-practices-map.md`를 **직접 Grep**한다)을 "이미 안다"로 자기면제했다.

해당 절차의 원문:

> 2. [CRITICAL] MP best-practices-map.md를 **직접 Grep**한다 — "확인한다"가 아니라 도구 호출로 Grep 실행. 작업 키워드(예: PR1이면 `셋업|setup|초기|프로젝트 초기`, PR2면 `provider|api 클라이언트`, PR3+면 `컴포넌트|디자인시스템`)로 매칭 행을 찾는다.

### 메타 원인

AC `coding-standards/map.md`에는 본 사고와 **정확히 동일한 사고 사례**가 이미 박혀 있다:

> **사고 사례**: PR_1_PLAN 메인 LLM이 2번을 "이미 안다"로 자기 면제 → MP 「프로젝트 초기 세팅」 행(commitlint·stylelint·prettier·husky·lint-staged + `docs/patterns/setup/ProjectSetup.md`) 발견 실패 → PR1 셋업 항목 12개 누락. 글로벌 룰 「[CRITICAL] 마커」(반드시 Read·실행, "이미 안다고 판단해 건너뛰지 않는다") 위반.

즉, **사고 사례를 자기 가이드에 박아 둔 상태에서도 다음 PR_1_PLAN 세션에서 그대로 재발**했다. 가이드에 사례를 박는 것만으로는 재발 방지가 안 된다는 사실 자체가 본 회고의 핵심.

### 정황 원인

- BG 산출물(`project.md`)이 "PR1 = TypeScript strict 정비, ESLint config, Prettier, Vitest 셋업, Playwright 셋업, tsconfig path alias"로 PR1 범위를 이미 정의해두어, 메인 LLM이 "이게 PR1 작업의 전부"라고 단정하기 쉬웠다.
- 메인 LLM이 처음에 AskUserQuestion으로 "Vitest/Playwright 위치", "ESLint 보강 룰", "husky/lint-staged 도입", "TS strict 추가 옵션" 4개 결정을 물었는데, 사용자가 "MP에 없었어?" "이런것도 MP에 있지않았어?"로 두 번 반문한 뒤에야 MP 1차 소스 Grep 단계로 진입.

## MP에 박을 룰 후보

본 사고가 다시 발생하지 않도록 MP 측에서 강화할 수 있는 항목:

### (1) `docs/best-practices-map.md`의 엔트리 발견 가능성 강화

- 「프로젝트 초기 세팅」 엔트리 본문에 "**PR1 시점에 반드시 본 엔트리부터 보고 시작**" 같은 진입점 표시 추가 검토
- 키워드 매칭 향상 — 현재 엔트리 본문이 `상황: 채용과제·사이드 프로젝트 초기 세팅` + `기술스택: commitlint + prettier + typescript-eslint + stylelint + husky + lint-staged`. 「PR1」 키워드 자체가 본문에 없어서 PR_N_PLAN AI가 `PR1` 검색 시 1차 매칭 실패 가능성. 「PR1」 키워드를 명시 추가 검토

### (2) `docs/patterns/setup/ProjectSetup.md`의 채용과제 적용 체크리스트화

현재 본문이 산문 + 표 형식. AI가 "다 적용했나" 자가 점검하기 어려운 구조. 체크리스트 형식 추가 검토:

```
- [ ] .gitignore (`.claude/`, `plan/`) 추가
- [ ] packageManager 강제 + preinstall only-allow
- [ ] EditorConfig + .gitattributes + .prettierrc + .prettierignore
- [ ] tsconfig 보강 (noFallthroughCasesInSwitch, noUncheckedIndexedAccess)
- [ ] ESLint baseRules + recommendedTypeChecked + check-file
- [ ] commitlint config-conventional + scope-enum (도메인 맞춤)
- [ ] husky + lint-staged + .husky/pre-commit + .husky/commit-msg
- [ ] (다음 PR 진입 전) Vitest 추가 여부
```

체크리스트의 각 항목은 본문 상세 절로 링크.

### (3) AC 측 룰 강화 (참고)

AC `coding-standards/map.md`「[CRITICAL] 탐색 절차」가 "Read해도 본 절차로 자기면제 방지를 못 잡았다"는 사실이 본 사고로 드러났다. AC 측에는 별도 백로그로 등재 (본 MP 문서 범위 아님).

## 검증 절차

PR_1_PLAN을 다른 채용과제·사이드 프로젝트에서 다시 진행할 때 본 사고가 재발하는지 확인:

1. 새 프로젝트의 `assignment-playground` 같은 별도 워크트리에서 `/workflow PR_1_PLAN 채용` 진입
2. 메인 LLM이 step-3 산출물(overview.md) 작성 전에 MP `best-practices-map.md`를 Grep 도구로 직접 호출했는지 transcript 확인
3. 호출 누락 시: 사용자가 지적하기 전에 LLM 자체 발견했는지, 사용자 지적이 몇 회 필요했는지 측정

본 사고의 사용자 지적은 2회. 향후 0회 또는 LLM 자체 발견까지 줄어야 본 룰 강화가 효과 있다는 신호.

## 미정 항목

- 「PR1」 같은 작업 단계 키워드를 MP best-practices-map 엔트리 본문에 명시할지, 별도 색인 파일을 만들지
- 체크리스트가 너무 detail-heavy하면 AI가 "이미 한 줄씩 확인했다"고 자기면제하는 새로운 자기면제 패턴이 생길 가능성 — 절차 강화의 트레이드오프
- MP에 박은 룰의 효과 측정 방법 (현실적으로는 사용자가 직접 transcript 확인)

## 첫 행동 (이어 작업하는 사람용)

1. 본 문서 「MP에 박을 룰 후보」 세 항목을 사용자와 합의
2. (1)·(2) 적용 PR을 MP에 별도 작성. scope: `setting`
3. (3) AC 측 강화는 별도 핸드오프 또는 AC 백로그로
