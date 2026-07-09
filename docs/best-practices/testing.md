---
keywords: [테스팅, 테스트 대상, 테스트 레벨, 안티패턴, Vitest, React Testing Library, describe, it, getByRole]
---

# Best Practices — 테스팅

## 테스팅

### 테스트 대상·레벨 판단

- 상황: 테스트 대상·레벨 선정. Yes 디폴트, 면제 화이트리스트, 구현 세부사항 금지, Integration 우선
- 코드: docs/patterns/testing/WhatToTest.md

### 작성하지 않는 테스트 (안티패턴)

- 상황: 컴포넌트 유닛 테스트에서 흔히 끌리지만 작성하지 않는 패턴을 판단할 때. 안 쓰는 코드 예시 + 대신 무엇이 검증하나
- 코드: docs/patterns/testing/TestsWeAvoid.md

### 테스트 코드 작성 패턴

- 기술스택: Vitest + React Testing Library
- 상황: 테스트 구조(describe/it 네이밍, describe.each), 쿼리(getByRole 우선, 접두사 용도), 데이터 처리(매직 스트링 → 변수, 반복 assertion → 반복문), 네이밍(사용자 관점 it 워딩), 검증 범위(mock 인덱스 접근 금지, 라이브러리 기본 동작 재검증 금지)
- 코드: docs/patterns/testing/TestWriting.md
