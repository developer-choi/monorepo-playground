# ApiClient 설계 의도

## 구조

```
ApiClient  (abstract class)
  ├── FetchApiClient
  └── KyApiClient
```

## 핵심 설계 결정

### 1. abstract class를 선택한 이유

interface + implements도 고려했지만, 생성자에서 `baseUrl`을 공유해야 하므로 abstract class로 결정.
interface에는 constructor를 정의할 수 없음.

### 2. request()를 제거하고 비-json은 roadmap 4로 미룬 이유

API 호출의 99%는 json 응답. 편의 메서드(get, post 등)는 이 대다수를 커버하기 위해 json 파싱 후 `T`를 반환함.

나머지 1%(blob, text 등)를 위해 `request()`가 있었음. 편의 메서드와 달리 json 파싱 없이 원본 Response를 그대로 반환하여, 호출부가 파싱 방식을 직접 선택하는 구조:

```ts
abstract class ApiClient<RawResponse> {
  abstract get<T>(url: string, options?: BaseOptions): Promise<T>; // json 파싱 후 반환
  abstract request(url: string, options: Options): Promise<RawResponse>; // 원본 그대로 반환
}

// 호출부
const blob = await client.request('/file', {method: 'GET'}).then((r) => r.blob());
const text = await client.request('/log', {method: 'GET'}).then((r) => r.text());
```

그러나 이 방식은 fetch/ky의 "응답 후 파싱" 모델을 전제함. axios는 요청 시점에 `responseType`을 지정하고 `response.data`에 이미 파싱된 결과가 담기므로, `.blob()` 같은 메서드 자체가 없음. request()가 원본을 반환해봤자 할 수 있는 게 없음.

라이브러리 중립 추상화라는 목표에 맞지 않으므로 `request()` + `RawResponse` 클래스 레벨 제네릭을 제거. 비-json 응답 지원은 roadmap 4에서 `responseType` 옵션 도입으로 대응.

### 3. options는 abstract에서 공통(BaseOptions)만, 구현체에서 extend

세 라이브러리(fetch, ky, axios)의 옵션이 모두 다름:

- Next.js fetch 전용: `cache`, `next.revalidate`, `next.tags`
- ky 전용: `retry`, `timeout`
- axios 전용: `auth`, `params`

공통 분모(`headers`, `searchParams`)만 `BaseOptions`로 추출하고,
각 구현체가 `FetchOptions extends BaseOptions` 형태로 자기 옵션을 추가.

TypeScript에서 메소드 오버라이드 시 파라미터를 서브타입으로 좁히는 것이 허용되므로 가능.

### 4. searchParams 타입을 object로 선언한 이유

query-string의 `StringifiableRecord`는 `Record<string, Stringifiable | Stringifiable[]>` 즉 index signature 기반 타입.
TypeScript에서 interface는 declaration merging이 가능하므로 컴파일러가 implicit index signature를 부여하지 않음(TS #15300).
따라서 interface로 선언한 API Request 타입을 `searchParams`에 직접 전달하면 타입 에러 발생.

```ts
type Req1 = {id: string};
interface Req2 {
  id: string;
}

const a: StringifiableRecord = {} as Req1; // ✅ type은 통과
const b: StringifiableRecord = {} as Req2; // ❌ interface는 실패
```

주요 라이브러리들도 해결하지 못한 문제(axios는 `any`, ky/got은 strict Record로 interface 비호환 방치, query-string은 `Record<string, any>`로 후퇴).

해결: `BaseOptions.searchParams`를 `object`로 선언하여 interface/type 모두 호환. 구현체 내부에서 query-string에 전달할 때만 `as StringifiableRecord`로 캐스팅.

### 5. 에러 처리는 각 구현체 책임

`get/post` 등에서 각 구현체가 자기 방식으로 에러를 감지하고 `ApiResponseError`로 감싸서 던짐:

- FetchApiClient: `if (!response.ok)` 체크 필요 (fetch는 4xx/5xx에서 throw 안 함)
- KyApiClient: ky가 자동 throw하므로 catch에서 감싸기
- AxiosApiClient: axios도 자동 throw

abstract에서 공통 에러 처리를 할 수 없는 이유: 구현체마다 응답 객체 구조가 다르므로 `.ok`, `.status` 같은 필드에 일괄 접근 불가.

### 6. ky 훅이 아닌 외부 catch로 에러 변환

ky의 `beforeError`/`afterResponse` 훅 안에서 HTTPError → ApiResponseError 변환을 시도했으나 실패.
훅 API의 반환 타입 제약과 async 동작 문제로 커스텀 에러를 훅 내부에서 처리하기 어려웠음.

현재 방식: ky 내부(훅)를 건드리지 않고, 각 메소드에서 `try/catch`로 잡아서 변환.
ky의 내부 파이프라인에 의존하지 않으므로 안정적.

### 7. KyApiClient — HTTPError를 handleError에서 래핑

ky는 4xx/5xx에서 `HTTPError`를 throw함. 편의 메서드의 handleError에서 이를 catch하여 `ApiResponseError`로 래핑. fetch 자체가 4xx/5xx에서 throw하지 않으므로, 구현체 간 에러 동작을 정규화하는 역할.

## 에러 클래스

### BaseError

모든 커스텀 에러의 부모. Sentry 등 특정 도구 이름을 제거하고 범용 필드만 보유:

- `level`: `'fatal' | 'error' | 'warning' | 'low'` (기본값: `'error'`)
- `tags`: 에러에 대한 메타데이터
- `cause`: 원본 에러 체이닝

모니터링 도구(Sentry 등)에 리포트할지 여부는 에러 클래스의 관심사가 아님.
에러 핸들러/모니터링 레이어에서 `instanceof`로 분기하여 처리.

### ApiResponseError

서버 응답은 왔지만 에러 상태코드(4xx, 5xx)인 경우:

- `status`: HTTP 상태 코드
- `url`: 요청 URL
- `errorData`: 백엔드에서 보낸 에러 응답 데이터 (이미 파싱된 상태)

`errorData`를 생성자에서 받는 이유: `response.json()`이 async인데 constructor는 async 불가.
따라서 호출하는 쪽(FetchApiClient 등)에서 미리 파싱해서 넘김.

### ApiRequestError

요청 자체가 실패한 경우 (네트워크 에러, DNS 실패 등). 서버 응답 없음:

- `url`: 요청 URL
- `cause`: 원본 에러 (fetch의 TypeError 등)
