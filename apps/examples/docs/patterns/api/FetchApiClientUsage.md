# ApiClient + ApiResponseError — 수동 매핑

## 개요

HTTP 라이브러리(fetch, ky, axios)에 의존하지 않는 API 호출 계층.

- **ApiClient**: abstract class로 HTTP 메서드를 추상화. 구현체(FetchApiClient, KyApiClient)를 교체해도 호출부 코드는 변경 없음
- **ApiResponseError**: 4xx/5xx 에러를 라이브러리 고유 에러(ky의 HTTPError 등) 대신 공통 에러 클래스로 정규화. status, url, errorData 포함
- **ApiRequestError**: 네트워크 실패 등 요청 자체가 실패한 경우. cause에 원본 에러 체이닝

## 네이밍 컨벤션

### API 함수

접미사 `Api` 사용. 형식: `[METHOD] + [DOMAIN] + [유형(List, Detail 등)] + Api`

```typescript
function getBoardListApi() {}
function getBoardDetailApi() {}
function postBoardDetailApi() {}
function patchBoardDetailApi() {}
function deleteBoardDetailApi() {}

// 파라미터 변수명은 반드시 'request'를 사용합니다.
function postLoginApi(request: LoginApiRequest) {}
```

### API 타입

형식: `[함수명과 동일한 Prefix] + Request / Response`. METHOD를 포함한 전체 함수명 Prefix를 사용합니다.

```typescript
// postLoginApi → PostLoginApiRequest
interface PostLoginApiRequest {}
interface PostLoginApiResponse {}

// getBoardListApi → GetBoardListApiRequest
interface GetBoardListApiRequest {}
interface GetBoardListApiResponse {}
```

## Response.data 반환 원칙

API 호출 함수는 Response 객체를 그대로 반환하지 않고, 반드시 **데이터(JSON 등)를 추출하여 반환**합니다. 원시 fetch를 쓰든 ApiClient를 쓰든 동일합니다.

- React Query 사용 시, `status`나 `headers` 같은 불필요한 메타 데이터가 상태(`data`)에 저장되는 실수를 방지합니다.
- ApiClient 구현체는 내부에서 `response.json()`을 수행하여 `data`만 돌려주므로, 호출부는 항상 데이터를 받습니다.

```typescript
// ❌ Bad — fetch Response 객체가 그대로 반환됨
export function getUserApi() {
  return fetch('/api/users/me');
}

// ✅ Good — JSON 추출 후 반환
export async function getUserApi() {
  const response = await fetch('/api/users/me');
  const data: GetUserApiResponse = await response.json();
  return data;
}

// ✅ Good — ApiClient 사용 시에도 동일 원칙 (ApiClient가 내부에서 추출)
export function getUserApi() {
  return apiClient.get<GetUserApiResponse>('/api/users/me');
}
```

## 쿼리스트링은 query-string 라이브러리로 통일합니다

API 호출과 페이지 이동 모두 객체를 쿼리스트링으로 변환해야 합니다.
`URLSearchParams`로 직접 하면 배열 처리, 빈 문자열 제거, undefined 생략을 매번 수동으로 작성해야 합니다.

```typescript
const qs = queryString.stringify(
  {
    ...data,
    lessonType: isAllTypes ? undefined : data.lessonType,
    category: data.category === 'all' ? undefined : data.category,
  },
  {skipEmptyString: true},
);
router.push(qs ? `/lesson?${qs}` : '/lesson');
```

`query-string`은 배열을 `key=a&key=b`로, `undefined`는 자동 생략, `skipEmptyString`으로 빈 문자열도 제거해 줍니다.

## [CRITICAL] 참조 코드

- 클라이언트 싱글턴: `apps/examples/src/shared/api/client.ts`
- API 함수 (GET + searchParams, 수동 매핑): `apps/examples/src/shared/board/api.ts`
- ApiClient 추상 클래스: `apps/examples/src/shared/api/ApiClient.ts`
- FetchApiClient 구현체: `apps/examples/src/shared/api/FetchApiClient.ts`
- ApiResponseError: `apps/examples/src/shared/error/class/ApiResponseError.ts`
- ApiRequestError: `apps/examples/src/shared/error/class/ApiRequestError.ts`

## 참고

- 설계 의도: `apps/examples/docs/api-client-design-decisions.md`
