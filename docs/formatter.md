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

## 줄바꿈 통일 — 3겹 구조

CRLF/LF 혼용으로 에디터 커밋 모달에서 코드 변경 없이 줄바꿈만 다른 유령 diff가 발생하는 문제를 방지하기 위해, 3개 도구가 각각 다른 시점에 LF를 강제합니다.

| 도구         | 파일             | 적용 시점                  |
| ------------ | ---------------- | -------------------------- |
| EditorConfig | `.editorconfig`  | 파일 편집/저장 시 (에디터) |
| Git          | `.gitattributes` | checkout/checkin 시 (Git)  |
| Prettier     | `.prettierrc`    | 커밋 시 (lint-staged)      |

- **`.editorconfig`**: WebStorm이 자동 인식. 파일을 열거나 저장할 때 LF로 유지. Markdown 파일은 `trim_trailing_whitespace = false`로 예외 처리 (줄 끝 공백 2개가 `<br>` 역할).
- **`.gitattributes`**: `* text=auto eol=lf`로 Git이 checkout/checkin 시 LF로 정규화.
- **Prettier**: `endOfLine: "lf"`로 커밋 시 최종 포맷팅에서 LF 강제.

## lint-staged 파이프라인 순서

```
prettier --write → eslint --fix → turbo check-types
```

1. **prettier --write**: 포맷팅 정리 (들여쓰기, 줄바꿈, 따옴표 등)
2. **eslint --fix**: 자동 수정 가능한 린트 규칙 적용
3. **turbo check-types**: 전체 타입 체크

Prettier가 ESLint보다 먼저 실행되어야 합니다. ESLint 규칙 중 포맷팅과 관련된 것이 있다면, Prettier가 먼저 정리한 뒤 ESLint가 검사해야 충돌이 없습니다.
