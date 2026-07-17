---
keywords: [테스팅, 테스트 대상, 테스트 레벨, 안티패턴, Vitest, React Testing Library, describe, it, getByRole, mock, MSW, 응답 타입, HttpResponse, 핸들러 제네릭, 요청 단언, request assertion, onUnhandledRequest, 반응 테스트, custom request predicate, dynamic mock scenarios, 심화 기법, 핸들러 구조화, structuring handlers, server.use, resetHandlers, 런타임 오버라이드, 도메인별 분할, higher-order resolver, AI 생성 테스트, AI-generated tests, 테스트 리뷰, toBeDefined, toMatchObject, 무의미 검증, 구현 결합, 미실행, vitest run, 엣지케이스 누락, 커버리지, use case coverage]
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
- 상황: 테스트 구조(describe/it 네이밍), 쿼리(getByRole 우선, 접두사 용도), Mock(도입 시 근거·확답 필수, seam 위치), 데이터 처리(매직 스트링 → 변수, 반복 assertion → 반복문), 네이밍(사용자 관점 it 워딩), 검증 범위(mock 인덱스 접근 금지, 라이브러리 기본 동작 재검증 금지)
- 코드: docs/patterns/testing/TestWriting.md

### AI가 생성한 테스트 리뷰

- 상황: AI 어시스턴트가 작성한 테스트를 커밋 전 리뷰할 때. 4축 점검 — 의미 있는 검증(`toBeDefined` 무의미 vs `toMatchObject`), 동작 vs 구현(리팩터마다 깨지면 과결합), 실제 실행(`vitest run`), 엣지케이스 누락(빈 입력·null·네트워크 실패). before/after 벤치 fixture·채점 기준 동봉
- 코드: docs/patterns/testing/ReviewingAiTests.md

### MSW 핸들러에 응답 타입 붙이기

- 상황: MSW 핸들러 응답·파라미터에 타입을 붙일지 판단할 때. 응답 타입은 실제 API 타입을 import해 공유, 기본은 응답만(`HttpResponse.json<타입>`), params·요청 바디는 핸들러가 실제로 읽을 때만
- 코드: docs/patterns/testing/MswHandlerTypes.md

### MSW 핸들러 구조화

- 상황: 핸들러를 어떻게 조직할지. 기본은 happy path만, 에러 등 예외는 그 테스트에서만 `server.use()`로 오버라이드하고 `afterEach(server.resetHandlers)`로 리셋, 많아지면 도메인별 파일 분할, 겹치는 로직은 higher-order resolver로 재사용
- 코드: docs/patterns/testing/MswHandlerStructuring.md

### 가로챈 요청이 아니라 앱의 반응을 테스트

- 상황: MSW로 가로챈 요청을 테스트에서 검증할 때. 요청 URL·바디 단언(구현 세부)이 아니라 화면 반응을 본다, 요청 유효성은 핸들러 400으로, 예상 못 한 요청은 onUnhandledRequest: 'error', 화면 흔적 없는 단방향 요청만 예외
- 코드: docs/patterns/testing/MswAvoidRequestAssertions.md

### MSW 심화 기법 (필요할 때 학습)

- 상황:
  - 같은 method+path인데 쿼리파라미터(`?foo=`)나 JSON 요청 바디의 특정 속성(`bar`) 값에 따라 요청을 가려 가로채야 할 때. MSW 기본 매칭(method+path)으로는 안 됨
  - 개발·시연 중 소스를 안 고치고 URL 쿼리(`?scenario=error`)로 목 응답을 성공↔에러(500 등)로 런타임 전환하고 싶을 때
- 코드: docs/patterns/testing/MswDeferredTechniques.md
