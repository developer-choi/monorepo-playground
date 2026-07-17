---
keywords: [폼 핸들링, react-hook-form, use Form 커스텀 훅, 폼 제출 검증, zodResolver, 제출 생명주기, 필터 전체 처리, Checkbox, Select, union transform, 자동 포커스, autoFocus]
---

# Best Practices — 폼 핸들링

## 폼 핸들링

### use[...]Form 커스텀 훅

- 기술스택: react-hook-form + tanstack query
- 상황: 폼이 있는 페이지에서 폼 로직을 컴포넌트에서 분리할 때
- 코드: apps/examples/docs/patterns/form/SomeForm.md

### 폼/필터 Zod 패턴 — 제출 검증·필터 파싱

- 기술스택: zod + react-hook-form (폼 제출 검증 상황은 + @hookform/resolvers)
- 상황:
  - zodResolver로 폼 제출 시 스키마 검증. 상수(LIMITS)를 스키마 검증·에러메시지·UI(maxLength)에 공유
  - 목록 필터에서 "전체" 옵션 처리. Checkbox는 배열로 판단(별도 값 불필요), Select는 'all' 프론트 전용 값 필요 → 필터 폼 타입을 스키마 타입과 분리
  - URL 쿼리스트링에서 같은 키가 값 1개면 string, 여러 개면 string[]로 파싱될 때. z.union + transform으로 항상 배열로 통일
- 코드: apps/examples/docs/patterns/validation/ZodFormFilter.md

### 제출 생명주기 (로딩·성공·실패)

- 기술스택: react-hook-form + @tanstack/react-query
- 상황: 폼 제출 후 로딩 중 중복 제출, 성공 후 이동/머무름, 서버 거절 표시를 화면에서 다뤄야 할 때
- 코드: apps/examples/docs/patterns/form/SubmitLifecycle.md

### 폼 중심 페이지 자동 포커스

- 기술스택: HTML autoFocus
- 상황: `<input>`/`<textarea>`를 만들어야 하는데 autoFocus를 쓸지 판단해야 하는 경우
- 코드: apps/examples/docs/patterns/form/AutoFocus.md
