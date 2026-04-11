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
