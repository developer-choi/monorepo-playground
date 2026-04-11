## 문제

기존 코드베이스에 새 린트 규칙을 도입하면 기존 코드에서 대량의 위반이 발생합니다. 모든 위반을 한 번에 수정하는 것은 비현실적이며, 그렇다고 규칙 도입을 미루면 새 코드에서도 같은 문제가 반복됩니다.

필요한 조건:

1. **지금은 에러가 나지 않아야** 합니다 — 기존 코드가 빌드/커밋을 차단하면 안 됨
2. **파일을 수정할 때 에러가 반드시 나야** 합니다 — 수정 기회에 정리를 강제
3. **작업 범위를 크게 벗어나지 않아야** 합니다 — 한 줄 고치려다 파일 전체를 리팩토링하게 되면 안 됨

## 검토한 접근법

| 접근법                        | 신규 코드 강제 | 기존 코드 비차단 | 수정 시 강제 | 범위 제한 |
| ----------------------------- | :------------: | :--------------: | :----------: | :-------: |
| file-level disable            |       ❌       |        ✅        |      ❌      |    ❌     |
| severity warning              |       ❌       |        ✅        |      ❌      |    ✅     |
| .stylelintignore              |       ❌       |        ✅        |      ❌      |    ❌     |
| lint-staged only              |       ✅       |        ❌        |      ✅      |    ❌     |
| baseline 스냅샷               |       ✅       |        ✅        |      ✅      |    ✅     |
| **file-level disable + hook** |       ✅       |        ✅        |      ✅      |    ✅     |

### 각 접근법의 한계

- **file-level disable**: 파일 전체의 규칙이 꺼지므로 새 코드도 검사하지 않음. 한번 넣으면 제거할 동기가 없음
- **severity warning**: 경고는 무시됨. "나중에 error로 올리겠다"는 계획은 거의 실행되지 않음
- **`.stylelintignore`**: 특정 규칙만 제외할 수 없고 해당 파일의 모든 규칙이 꺼짐
- **lint-staged only**: 파일 한 줄 수정했는데 해당 파일의 기존 위반 전체가 에러로 보고됨. 관련 없는 수정인데 리팩토링이 강제됨
- **baseline 스냅샷**: 4개 조건을 모두 충족하지만 네이티브 지원이 없어 스크립트 구현/유지 비용이 발생

## 선택한 방법: file-level disable + pre-commit hook

file-level disable 단독으로는 "수정 시 강제" 조건을 충족하지 못합니다. pre-commit hook을 결합하여 이 문제를 해결합니다.

### 동작 흐름

```
[도입 시점]
기존 위반 파일 상단에 file-level disable 추가
→ stylelint 에러 0개

[파일 수정 시점]
개발자가 파일을 수정하고 커밋 시도
→ pre-commit hook이 staged된 SCSS 파일에서 file-level disable 감지
→ 커밋 차단

[대응]
file-level disable 제거
→ 고칠 수 있는 위반은 수정
→ 지금 고칠 수 없는 위반은 per-line disable로 전환
→ 커밋 통과

[시간 경과]
per-line disable이 점진적으로 제거됨
```

### 핵심 파일

- `tools/check-file-level-disable.sh` — pre-commit hook 스크립트. staged된 SCSS 파일의 상단 5줄에서 `stylelint-disable`을 감지하면 차단
- `.husky/pre-commit` — `check-file-level-disable.sh`를 lint-staged 전에 실행

### per-line disable 예시

file-level disable을 제거한 뒤, 이번 작업 범위에서 고칠 수 없는 위반은 per-line disable로 전환합니다.

```scss
// file-level disable 제거 후

.button {
  &.primary {
    /* stylelint-disable-next-line scale-unlimited/declaration-strict-value */
    background-color: #2563eb; // 이번엔 패스 — 디자인 토큰 정비 후 수정 예정
    color: var(--text-primary); // 이번에 수정함
  }
}
```

### 이 패턴이 범용적인 이유

Stylelint에 한정되지 않고, ESLint 등 다른 린터에서 새 규칙을 도입할 때도 동일하게 적용할 수 있습니다. 핵심 구조는 동일합니다:

1. 기존 파일에 file-level disable
2. pre-commit hook으로 file-level disable이 있는 파일의 커밋 차단
3. 수정 시 per-line disable로 전환
