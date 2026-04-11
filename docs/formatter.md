## 배경

AI가 작성한 코드의 포맷팅을 사람이 신경 쓰지 않아도 자동으로 일관성이 유지되도록 Prettier를 도입했습니다. 커밋 시 lint-staged가 staged 파일에 `prettier --write`를 실행하므로, 포맷팅이 맞지 않는 코드가 저장소에 들어갈 수 없습니다.

## 설정 값 근거

`.prettierrc`:

```json
{
  "singleQuote": true,
  "bracketSpacing": false,
  "printWidth": 120,
  "endOfLine": "lf"
}
```

| 옵션           | 값    | Prettier 기본값 | 이유                                                                                  |
| -------------- | ----- | --------------- | ------------------------------------------------------------------------------------- |
| singleQuote    | true  | false           | 기존 코드베이스가 전부 single quote 사용                                              |
| bracketSpacing | false | true            | 기존 코드베이스가 `{foo}` 스타일 (`{ foo }` 아님)                                     |
| printWidth     | 120   | 80              | 기존 코드의 줄 길이가 80을 자주 초과. useCallback/useMemo 인자의 불필요한 줄바꿈 방지 |
| endOfLine      | lf    | lf              | Prettier v2.0.0부터 기본값. OS 간 호환성, git diff 오염 방지                          |

명시하지 않은 옵션(semi, trailingComma, arrowParens, tabWidth)은 Prettier 기본값이 기존 코드베이스 패턴과 동일하므로 생략했습니다.

`.prettierignore`: 빌드 산출물(`dist`, `build`, `.next`), 의존성(`node_modules`), lock 파일 등 자동 생성 파일을 포맷팅 대상에서 제외합니다.

`.editorconfig`: 에디터 수준에서 인코딩(utf-8), 들여쓰기(space, 2), 줄바꿈(LF), 파일 끝 개행을 통일합니다. Prettier 기본값과 일치시켜 에디터 저장 시점부터 포맷이 맞도록 합니다.

## 줄바꿈 통일 — 3겹 구조

CRLF/LF 혼용으로 에디터 커밋 모달에서 코드 변경 없이 줄바꿈만 다른 유령 diff가 발생하는 문제를 방지하기 위해, 3개 도구가 각각 다른 시점에 LF를 강제합니다.

| 도구         | 파일             | 적용 시점                  |
| ------------ | ---------------- | -------------------------- |
| EditorConfig | `.editorconfig`  | 파일 편집/저장 시 (에디터) |
| Git          | `.gitattributes` | checkout/checkin 시 (Git)  |
| Prettier     | `.prettierrc`    | 커밋 시 (lint-staged)      |

- **`.editorconfig`**: WebStorm이 자동 인식. 파일을 열거나 저장할 때 LF로 유지.
- **`.gitattributes`**: `* text=auto eol=lf`로 Git이 checkout/checkin 시 LF로 정규화.
- **Prettier**: `endOfLine: "lf"`로 커밋 시 최종 포맷팅에서 LF 강제.

## pre-commit 파이프라인

`test-staged` 스크립트(`lint-staged && turbo check-types`)가 husky pre-commit 훅에서 실행됩니다.

### lint-staged 단계

lint-staged는 glob 패턴별로 독립 실행되며, 아래 3개 그룹이 staged 파일에 대해 병렬로 동작합니다:

| glob 패턴                                  | 명령                                                    |
| ------------------------------------------ | ------------------------------------------------------- |
| `*.{ts,tsx,js,mjs,mts,json,css,scss,md}`   | `prettier --write`                                      |
| `**/*.scss`                                 | `stylelint --fix`                                       |
| `apps/examples/**/*.{ts,tsx}`               | `eslint --fix --config apps/examples/eslint.config.mjs` |
| `packages/design-system/**/*.{ts,tsx}`      | `eslint --fix --config packages/design-system/eslint.config.js` |
| `packages/recruitment/**/*.{ts,tsx}`        | `eslint --fix --config packages/recruitment/eslint.config.js`   |

- Prettier와 ESLint가 같은 파일에 대해 모두 매칭될 수 있으며, lint-staged가 glob 순서대로 실행하므로 Prettier가 먼저 정리한 뒤 ESLint가 검사합니다.
- SCSS 파일은 Prettier(포맷팅)와 Stylelint(린트) 두 단계를 모두 거칩니다.

### lint-staged 이후

lint-staged가 성공하면 `turbo check-types`로 전체 타입 체크를 수행합니다. lint-staged 내부가 아닌 별도 단계로 실행되므로, staged 파일뿐 아니라 프로젝트 전체를 검사합니다.
