# ApiClient + ApiResponseError — es-toolkit + zod 검증

## 선행 패턴

- docs/patterns/api/FetchApiClientUsage.md

## 개요

API 호출 계층에 es-toolkit(snake_case/camelCase 자동 변환)과 zod(런타임 응답 검증)를 추가한 패턴.

- **es-toolkit**: `toSnakeCaseKeys`/`toCamelCaseKeys`로 요청·응답 키 변환을 자동화. 수동 매핑 함수 불필요
- **zod**: `validateApiResponse`로 서버 응답을 스키마 기반으로 런타임 검증. 타입과 실제 데이터의 불일치를 즉시 감지

## [CRITICAL] 참조 코드

- API 함수 (GET/POST/PATCH/DELETE, zod 검증): `apps/examples/src/validation/integration/api.ts`
- zod 스키마 정의: `apps/examples/src/validation/integration/schema.ts`
- validateApiResponse 유틸: `apps/examples/src/shared/api/parse.ts`
