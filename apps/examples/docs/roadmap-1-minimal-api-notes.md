# 로드맵 1: 최소 API Client (채용과제)

## 요구사항

인터페이스 확정이 최우선 과제. fetch/ky를 추상화한 abstract class를 만든다.

- HTTP METHOD별 메소드 (get, post, put, patch, delete)
- 기본 응답은 JSON 가정
- 비-JSON 응답(blob, text 등) 지원 → roadmap 4에서 responseType 옵션으로 대응 예정
- 에러 시 래핑하여 throw (모니터링용 필드 포함)
- fetch/ky 네이티브 옵션을 전부 노출 — 내부에서 관리하는 것(method, headers, body)만 Omit하고 나머지는 pass-through

## 테스트케이스

### FetchApiClient

#### 버그 수정 검증

- `buildBody(undefined)` → `undefined` 반환 (문자열 `"undefined"` 아님)
- `buildBody(null)` → `undefined` 반환
- 네트워크 에러(DNS 실패, 타임아웃 등) → `ApiRequestError`로 래핑 (fetch의 TypeError가 노출되면 안 됨)

#### buildBody 분기

| 입력               | 기대 출력                    |
| ------------------ | ---------------------------- |
| `undefined`        | `undefined`                  |
| `null`             | `undefined`                  |
| `{a: 1}`           | `'{"a":1}'` (JSON.stringify) |
| `42` (number)      | `"42"` (String 변환)         |
| `true` (boolean)   | `"true"`                     |
| `"hello"` (string) | `"hello"`                    |

#### buildHeaders 자동 Content-Type

- body가 plain object → `Content-Type: application/json` 자동 추가
- body가 `null`/`undefined` → Content-Type 미설정
- body가 object이지만 Content-Type이 이미 설정됨 → 기존 값 유지 (덮어쓰기 안 함)

#### buildUrl

- searchParams 없음 → `${baseUrl}${url}` 만 반환
- searchParams `{page: 1, size: 20}` → `?page=1&size=20` 형태로 append
- searchParams에 boolean 값 → `String(value)`로 변환

#### 편의 메소드 에러 정보

- POST 4xx → `ApiResponseError { method: 'POST', status: 400, url, body: 요청body, headers: 요청headers, errorData: 서버응답 }`
- GET 5xx → `ApiResponseError { method: 'GET', status: 500, url, body: undefined, headers, errorData }`
- DELETE 4xx → `ApiResponseError { method: 'DELETE', status: 403, url, body: undefined, headers }`
- PUT body 포함 요청 실패 → body가 ApiResponseError에 보존됨
- PATCH headers 포함 요청 실패 → headers가 ApiResponseError에 보존됨
- 서버 응답 body가 유효하지 않은 JSON → `errorData: null` (json() catch)
- 2xx 응답이지만 body가 비-JSON (blob, text 등) → 현재 `.json()`에서 SyntaxError 발생, 미래핑 상태 (roadmap 4 responseType 도입 시 처리)

### KyApiClient

#### 에러 래핑 (편의 메소드)

- 4xx 응답 → `ApiResponseError` throw (ky의 `HTTPError`가 노출되면 안 됨)
- 5xx 응답 → `ApiResponseError` throw
- `ApiResponseError`에 method, status, url, body, headers, errorData 모두 포함
- POST body 포함 요청 실패 → body가 `ApiResponseError`에 보존됨
- 서버 응답 body가 유효하지 않은 JSON → `errorData: null`
- 2xx 응답이지만 body가 비-JSON (blob, text 등) → 현재 `.json()`에서 SyntaxError 발생, 미래핑 상태 (roadmap 4 responseType 도입 시 처리)
- 네트워크 에러 → `ApiRequestError` throw, cause에 원본 에러 체이닝
- `ApiRequestError`의 url → `${baseUrl}/${url}` 형태 (전체 URL 복원)

#### FetchApiClient와의 계약 일치

- 동일 시나리오(4xx, 5xx, 네트워크 에러)에서 동일한 에러 타입 throw
- 편의 메소드 4xx/5xx → 둘 다 `ApiResponseError` throw
- 에러 필드 구조 일치: method, status, url, body, headers, errorData

### Error 클래스

#### BaseError

- `level` 기본값 → `'error'`
- `level` 옵션으로 오버라이드 → 설정한 값 반영
- `tags` 전달 → 에러 인스턴스에 보존
- `tags` 미전달 → `undefined`
- `cause`에 `unknown` 타입 전달 → 에러 생성 성공
- `cause`에 `Error` 인스턴스 전달 → 하위 호환 유지
- `cause`에 `string` 전달 → 에러 생성 성공 (TC39 표준)

#### ApiResponseError

- message 형식: `"GET 404 /api/users"`
- `method`, `status`, `url`, `body`, `headers`, `errorData` 필드 접근 가능
- `body` 미전달 시 → `undefined`
- `headers` 미전달 시 → `undefined`
- `errorData`는 any shape 허용 (서버 응답 구조 제약 없음)
- `instanceof BaseError` → `true`
- `instanceof ApiResponseError` → `true`
- `instanceof Error` → `true`
- `instanceof ApiRequestError` → `false`

#### ApiRequestError

- message 형식: `"GET /api/users"`
- `method`, `url`, `body`, `headers` 필드 접근 가능
- `body` 미전달 시 → `undefined`
- `headers` 미전달 시 → `undefined`
- `instanceof BaseError` → `true`
- `instanceof ApiRequestError` → `true`
- `instanceof ApiResponseError` → `false`

#### ApiResponseValidationError (변경 없음, 기존 동작 확인)

- `level` 기본값 → `'warning'` (다른 에러와 다름)
- `zodError` 필드 보존
- `response` 필드 보존 (원본 응답 데이터)
- `instanceof BaseError` → `true`
- `instanceof ApiResponseError` → `false`

### instanceof 분기 시나리오

catch 블록에서 에러 타입별 분기가 정확하게 동작해야 함:

```ts
try {
  await client.get('/api/users');
} catch (error) {
  if (error instanceof ApiResponseError) {
    /* 4xx/5xx */
  } else if (error instanceof ApiRequestError) {
    /* 네트워크 에러 */
  } else if (error instanceof ApiResponseValidationError) {
    /* 응답 검증 실패 */
  }
}
```

- 4xx 응답 → `ApiResponseError` 분기 진입
- 네트워크 에러 → `ApiRequestError` 분기 진입
- 세 타입이 서로 겹치지 않음 (각각 독립적 instanceof)
