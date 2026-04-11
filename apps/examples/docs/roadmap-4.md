# 로드맵 4: 기타 부가기능

## TODO

- FormData 지원: buildBody에서 FormData 분기, buildHeaders에서 Content-Type 자동 설정 방지 (브라우저가 multipart boundary 처리). 현재 코드에서 제거됨, 여기서 재도입
- ky + Next.js 옵션 호환성 테스트 필요
- 절대 URL 감지: `startsWith('https://')` 시 baseUrl을 붙이지 않는 로직. 외부 API 호출 시 필요

## ky 도입 검토

대기업 개발블로그에서 도입 사례를 찾지 못함.

Next.js의 fetch() 옵션과의 호환성 문제가 지속적으로 제기됨:

- https://github.com/sindresorhus/ky/issues/541
- https://github.com/vercel/next.js/issues/48519

## Request Phase

### Content-Type 덮어쓰기 방지

[파일을 request에 싣기 위해, Content-Type을 직접 지정해서 호출한 경우, 이 값이 아래 기본값으로 덮어써지면 안됨.](https://github.com/developer-choi/react-playground/commit/013c0f008c2bdafee7b8e2de173c7e61f7baa3da)

### fetch() 호출 실패 케이스 — 구현 완료

FetchApiClient.request의 try/catch와 KyApiClient.handleError에서 ApiRequestError로 래핑 완료.
추가 리스트업이 필요한 케이스가 있는지 확인:

- https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch#exceptions
- 잘못된 도메인
- CORS 등

### Querystring

[객체 전달 시 쿼리스트링 자동 추가](https://github.com/developer-choi/react-playground/commit/0d5068384713beb468d7888d2d335ee2f8064bd1)는 명확하지만,
[쿼리스트링 예제에서 cleanQuery() 도입](https://github.com/developer-choi/react-playground/commit/bee6c5c0881194528916a6cca6f2fd2af76b5ccd)의 목적이 불분명. API 요청 전 쿼리스트링 값을 clean해야 하는 이유 확인 필요.

## Response Phase

### responseType 옵션 도입 (request() 대체)

`request()` + `RawResponse` 제거 이후, 비-json 응답(blob, text 등)을 편의 메서드에서 지원해야 함.
편의 메서드에 `responseType` 옵션을 추가하면 fetch/ky/axios 모두 대응 가능:

- fetch/ky 구현체: responseType에 따라 `.json()`, `.blob()`, `.text()` 분기
- axios 구현체: responseType을 axios 옵션으로 전달, `response.data` 반환

타입 안전성 설계 미확정 (오버로드 vs 단순 제네릭 + 캐스팅 vs 전용 메서드 분리).

현재 편의 메서드는 `response.json() as T`를 전제함. 서버가 2xx로 비-JSON(blob, text 등)을 응답하면 `.json()`에서 SyntaxError가 발생하며, **FetchApiClient와 KyApiClient의 에러 래핑 동작이 다름**:

- **FetchApiClient**: `response.json()`이 `request()` 밖에서 호출되므로 try/catch를 거치지 않음 → 날것의 SyntaxError가 노출됨 (`ApiResponseError`도 `ApiRequestError`도 아님)
- **KyApiClient**: ky의 `.json()`이 try 블록 안에서 호출됨 → SyntaxError가 catch에 잡히고, `HTTPError`가 아니므로 else 분기를 타서 `ApiRequestError`로 래핑됨 (cause에 원본 SyntaxError 체이닝)

동일한 서버 응답에 대해 에러 타입이 다르므로, `responseType` 도입 시 이 불일치도 함께 해소해야 함.

#### 코드 경로 분석

**FetchApiClient** — `response.json()`이 try/catch 밖에서 호출됨:

```ts
// FetchApiClient.ts:8-14
async get<T>(url: string, options?: FetchOptions) {
  const response = await this.request(url, {method: 'GET', body: undefined, ...options});
  if (!response.ok) {
    await this.toResponseError({method: 'GET', response, headers: options?.headers});
  }
  return response.json() as T;  // ← 2xx인데 비-JSON이면 여기서 SyntaxError. catch 없음.
}
```

**KyApiClient** — ky의 `.json()`이 try 안에서 호출되어 catch에 잡힘:

```ts
// KyApiClient.ts:19-24
async get<T>(url: string, options?: KyOptions) {
  try {
    return await this.client.get(url, {...options}).json<T>();  // ← .json() SyntaxError 발생
  } catch (error) {
    return this.handleError({error, method: 'GET', url, headers: options?.headers});
    // ↑ SyntaxError는 HTTPError가 아님 → else 분기 → ApiRequestError로 래핑
  }
}

// KyApiClient.ts:62-90
private async handleError(params: { error: unknown; ... }): Promise<never> {
  if (params.error instanceof HTTPError) { ... }  // SyntaxError는 여기 안 들어감
  throw new ApiRequestError(                       // ← 여기로 빠짐
    { method, url, body, headers },
    { cause: params.error },  // cause에 원본 SyntaxError 체이닝
  );
}
```

#### 재현 테스트 코드

**FetchApiClient (F-E7)** — `src/shared/api/FetchApiClient.test.ts`:

```ts
it('F-E7: 200 with plain text body → rejects (SyntaxError, not ApiResponseError/ApiRequestError)', async () => {
  mockFetch.mockResolvedValue(new Response('plain text', {status: 200}));
  const error = await client.get('/test').catch((e: unknown) => e);
  expect(error).not.toBeInstanceOf(ApiResponseError);
  expect(error).not.toBeInstanceOf(ApiRequestError);
  expect(error).toBeInstanceOf(Error);
});
```

**KyApiClient (K-E6)** — `src/shared/api/KyApiClient.test.ts`:

```ts
it('K-E6: GET returns 200 with non-JSON body → rejects with ApiRequestError (ky SyntaxError caught by handleError)', async () => {
  mockFetch.mockResolvedValue(
    new Response('plain text', {
      status: 200,
      headers: {'Content-Type': 'text/plain'},
    }),
  );

  let caughtError: unknown;
  try {
    await client.get('users', {retry: 0});
  } catch (error) {
    caughtError = error;
  }

  expect(caughtError).toBeDefined();
  expect(caughtError).not.toBeInstanceOf(ApiResponseError);
  expect(caughtError).toBeInstanceOf(ApiRequestError);
  expect((caughtError as ApiRequestError).cause).toBeInstanceOf(SyntaxError);
});
```

### Content-Type 처리 (auto/manual)

[response는 header의 content-type이 아니라, 별도의 customFetch()의 parameter로 어떻게 변환할지 받아야함.](https://github.com/developer-choi/react-playground/commit/013c0f008c2bdafee7b8e2de173c7e61f7baa3da)

[MismatchedApiResponseError 도입](https://github.com/developer-choi/react-playground/commit/ac3b83ee9441cca5b68d84d5ecce1804946511d7)

- 기본값은 auto (API response header의 Content-Type 기반 판단)
- manual 모드도 지원하여 response.blob() 등 직접 지정 가능하게 해야 함.

```ts
if (dataType === 'auto' && contentType) {
  if (contentType.includes('application/json')) {
    json = await response.json();
  } else if (contentType.includes('text/plain')) {
    text = await response.text();
  }
}
```

### .json()/.text() 동작 테스트 결과

이런식으로 API에서 응답 하게 하고,

```ts
case 'json-number':
  return Response.json(1);

case 'json-string':
  return Response.json('1');
```

각 응답에 대해 `.json()`과 `.text()`를 각각 호출하여 테스트.

```ts
const data = await response.json();
const data = await response.text();
console.log('contentType', contentType, data === '' ? '[empty string]' : data, typeof data);
```

결과:

```ts
/**
 * [제일 일반적인 케이스 1]
 * application/json + object
 * json() ==> object
 * text() ==> string
 *
 * [제일 일반적인 케이스 2]
 * text/plain + string
 * json() ==> SyntaxError 뜨고, json으로 변환 못한다고 나와있음.
 * text() ==> string
 *
 * application/json + number
 * json() ==> number
 * text() ==> string
 *
 * application/json + string
 * json() ==> string
 * text() ==> string
 *
 * application/json + null
 * json() ==> null (typeof object임)
 * text() ==> 'null'
 *
 * application/json + undefined
 * json() ==> SyntaxError 나서 애초에 메소드 호출이 실패함.
 * text() ==> '' (빈문자열이고, API는 500에러나지만, .text() 호출 자체가 성공하긴...함)
 */
```

주목할 점:

- `.json()` 반환값이 number, string이 될 수 있음
- `application/json` 응답을 `.text()`로 읽으면 문자열 형태의 JSON 데이터가 반환됨
- `.text()`는 거의 항상 성공함. HTTP Response Body가 근본적으로 문자열이기 때문.

### Zod 응답 검증 (ApiResponseValidationError)

2xx 성공 응답이지만 Zod 스키마와 불일치하는 경우 — 서버 측 버그일 가능성이 높음.

```ts
export default class ApiResponseValidationError extends BaseError {
  readonly name = 'ApiResponseValidationError';
  readonly response: unknown;
  readonly zodError: ZodError;

  constructor(response: unknown, zodError: ZodError) {
    super(zodError.message, {level: 'warning', cause: zodError});
    this.response = response;
    this.zodError = zodError;
  }
}
```

**주의: 자사 백엔드 한정 로직이어야 함.**
ApiClient는 자사 백엔드뿐 아니라 외부 API와도 통신함. Zod 응답 검증 같은 전역 로직이 모든 요청에 일괄 적용되면 안 됨. 자사 백엔드 전용 로직과 범용 로직을 구분할 수 있는 구조 필요.

## 기타

- policy가 `none` 또는 `public`이면 반드시 static build — dynamic 감지되면 안 됨
