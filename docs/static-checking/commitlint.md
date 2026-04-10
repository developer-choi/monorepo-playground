## commitlint 규칙

`@commitlint/config-conventional`을 확장하며, 커밋 메시지 형식을 강제합니다.

```
type(scope): subject
```

| 규칙 | 설정 | 설명 |
|------|------|------|
| `scope-enum` | examples, design-system, recruitment, setting | 허용되는 scope 목록 |
| `scope-empty` | never | scope 필수 |
| `subject-case` | off | 한글 커밋 메시지 허용 |
| `subject-korean` | always | subject에 한글 필수 (커스텀 플러그인) |

`subject-korean`은 커스텀 플러그인 룰로, subject에 한글(`/[\uAC00-\uD7AF]/`)이 포함되어야 통과합니다. AI가 영어로만 커밋 메시지를 작성하는 것을 방지합니다.

```bash
# ✅
feat(examples): 폼 예제 추가
feat(examples): React 컴포넌트 추가

# ❌
feat: scope 없음
feat(unknown): 등록되지 않은 scope
feat(examples): add form example  # 영어만 → subject-korean 위반
```
