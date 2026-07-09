---
keywords: [API 통신, ApiClient, ApiResponseError, query-string, es-toolkit, snake_case, zod 검증, 쿼리, TanStack Query, queryOptions, infiniteQueryOptions, useMutation, mutationFn]
---

# Best Practices — API 통신 · 쿼리

## API 통신

### ApiClient + ApiResponseError — 수동 매핑

- 기술스택: ApiClient (자체 추상화) + ApiResponseError + query-string
- 상황: HTTP 라이브러리(fetch, ky, axios)에 의존하지 않는 API 호출 계층. ApiClient로 라이브러리 교체를 호출부와 분리하고, 4xx/5xx·네트워크 에러를 ApiResponseError/ApiRequestError로 정규화. API 함수/타입 네이밍 컨벤션, Response.data 반환 원칙, query-string 기반 쿼리스트링 처리 포함
- 코드: apps/examples/docs/patterns/api/FetchApiClientUsage.md

### ApiClient + ApiResponseError — es-toolkit + zod 검증

- 기술스택: ApiClient (자체 추상화) + ApiResponseError + es-toolkit + zod
- 상황: 위 패턴에 snake_case/camelCase 자동 변환(es-toolkit)과 zod 런타임 응답 검증을 추가. 수동 매핑 함수 대신 스키마 기반으로 변환·검증
- 코드: apps/examples/docs/patterns/api/FetchApiClientZodValidation.md

## 쿼리

### queryOptions / infiniteQueryOptions 팩토리

- 기술스택: TanStack Query v5
- 상황: queryKey + queryFn을 팩토리 객체로 중앙화. useSuspenseQuery, prefetchQuery, invalidateQueries에서 동일 옵션 재사용
- 코드: apps/examples/docs/patterns/query/QueryOptionsFactory.md

### 변경 API 호출 — useMutation vs 직접 호출

- 기술스택: TanStack Query v5
- 상황: 변경(POST/PATCH/DELETE) API 호출 시 useMutation으로 감쌀지 직접 호출할지 선택
- 코드: apps/examples/docs/patterns/query/MutationCallApproach.md

### useMutation mutationFn 작성

- 기술스택: TanStack Query v5
- 상황: useMutation의 mutationFn에 무엇을 박을지, 호출 시 필요한 값·가드·조립 로직을 어디에 둘지 결정할 때. instance method(this 바인딩)를 mutationFn으로 쓰는 경우 포함
- 코드: docs/static-checking/eslint.md (no-restricted-syntax — useMutation `mutationFn` 래핑 금지)
