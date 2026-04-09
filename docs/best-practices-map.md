# Best Practices Map

## 폼 핸들링

### use[...]Form 커스텀 훅
- 기술스택: react-hook-form + tanstack query
- 상황: 폼이 있는 페이지에서 폼 로직을 컴포넌트에서 분리할 때
- 코드: docs/patterns/form/SomeForm.md

### zod 활용 패턴
- 기술스택: zod + react-hook-form + @hookform/resolvers
- 상황: 스키마 파생(.pick/.extend), 상수 공유, createLabelMap, 필터 "전체" 처리, zodResolver 연동
- 코드: apps/examples/src/validation/integration/README.md
