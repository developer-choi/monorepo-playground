---
keywords: [스키마 설계, zod, CRUD, 필터, 목록 타입, enum, 라벨, z.infer, 타입 추론, nullable, optional, 입력 검증, URL 동적 세그먼트, 쿼리스트링, z.coerce, 페이지 통합, searchParams, safeParsePartial, 생성/수정 페이지, 폼 컴포넌트 재사용]
---

# Best Practices — 데이터 검증

## 스키마 설계

### Zod 스키마 설계 패턴 — 단일 원천 유지

- 기술스택: zod
- 상황:
  - 하나의 도메인에서 생성·수정·목록·상세·필터 타입이 파생될 때, 제약(min/max)을 중복 선언하지 않고 .pick/.extend로 동기화
  - enum 값을 Select/Radio 순회, 테이블 라벨 조회, z.enum() 전달에 공유할 때. createLabelMap으로 {value, label}[] 하나에서 세 형태를 파생
  - API 요청/응답 타입을 별도 interface 없이 스키마에서 파생(z.infer). 스키마 변경 시 타입이 자동 동기화
  - 백엔드가 undefined가 아닌 명시적 null을 요구할 때. optional()과 nullable()의 차이를 코드로 명시
- 코드: apps/examples/docs/patterns/validation/ZodSchemaDesign.md

## 입력 검증

### Zod 입력 검증 패턴 — URL에서 오는 입력 파싱

- 기술스택: zod + Next.js App Router
- 상황:
  - [id] params를 string → number 변환 + 검증. 실패 시 NOT_FOUND 페이지로 리다이렉트
  - searchParams를 스키마로 검증하되, 필드 하나가 실패해도 나머지는 유지(safeParsePartial). string|string[] 정규화 포함
  - URL searchParams(항상 string)를 숫자 등 실제 타입으로 변환할 때. z.coerce.number() + .default()로 변환과 기본값을 같은 선언에서 처리
- 코드: apps/examples/docs/patterns/validation/ZodInputParsing.md

## 페이지 통합

### Zod 페이지 통합 패턴 — 서버 컴포넌트에서 검증 유틸 조합

- 기술스택: zod + Next.js App Router (폼 컴포넌트 재사용 상황은 + react-hook-form)
- 상황:
  - 목록 페이지에서 URL 쿼리스트링을 필터/페이지네이션으로 파싱하여 API에 전달(searchParams → safeParsePartial → API 호출). 유효한 필드만 적용
  - 동적 라우트 [id] 페이지에서 params.id 검증 실패 시 handleServerSideError → NOT_FOUND 처리
  - 생성/수정 페이지에서 같은 폼 컴포넌트 재사용. board prop이 undefined면 생성, 있으면 수정으로 분기 — 같은 BoardForm 컴포넌트를 create/edit 페이지에서 공유
- 코드: apps/examples/docs/patterns/validation/ZodPageIntegration.md
