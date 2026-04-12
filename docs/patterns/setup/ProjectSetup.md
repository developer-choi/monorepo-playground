# Project Setup (PR1)

## 상황

채용과제·사이드 프로젝트의 초기 세팅. 이 레포의 설정을 기반으로 하되, 채용과제 환경에 맞게 조정한다.

## 참조 문서

| 순서 | 항목                    | 문서                                                   |
| :--: | ----------------------- | ------------------------------------------------------ |
|  1   | .gitignore              | 아래 [.gitignore 필수 항목](#gitignore-필수-항목) 참조 |
|  2   | commitlint + husky      | `docs/static-checking/commitlint.md`                   |
|  3   | Prettier + EditorConfig | `docs/formatter.md`                                    |
|  4   | tsconfig                | `docs/static-checking/tsconfig.md`                     |
|  5   | ESLint                  | `docs/static-checking/eslint.md`                       |

## .gitignore 필수 항목

```gitignore
plan/
.claude/
```

AI 에이전트의 작업 계획 파일(`plan/`)과 로컬 설정(`.claude/`)이 레포에 커밋되지 않도록 프로젝트 생성 직후 `.gitignore`에 추가한다.

## 채용과제 적용 시 주의

### 모노레포 구조 불필요

이 레포는 모노레포이므로 base > extend 구조(공통 config → 앱별 extend)로 되어 있다. 채용과제는 단일 프로젝트이므로 base 없이 flat하게 설정한다.

### 불필요한 린트 설정 제거

이 레포의 ESLint 설정 중 채용과제 범위에서 필요 없는 것은 빼고 가져간다. 예: stylelint(CSS-in-JS 안 쓰면), 모노레포 전용 import 규칙 등.

### husky + lint-staged

- `husky init` 후 pre-commit 훅에 lint-staged 연결
- lint-staged: `prettier --write` → `eslint --fix` → `vitest related --run` 순서
- `tsc -b`는 lint-staged 밖에서 별도 실행 (타입 체크는 프로젝트 전체 대상)

### commitlint

- `@commitlint/config-conventional` 기반
- `scope-enum`은 채용과제 도메인에 맞게 조정
- `subject-case: [0]` — 한글 커밋 허용
