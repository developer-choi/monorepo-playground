# @developer-choi/utils

UI가 아닌 공통 코드를 주제별 서브패스로 나눠 담습니다. 루트(`@developer-choi/utils`)에서는 아무것도 import할 수 없고, 서브패스로만 가져옵니다.

| 서브패스                    | 내용                                         |
| --------------------------- | -------------------------------------------- |
| `@developer-choi/utils/api` | API 클라이언트와 그 클라이언트가 던지는 에러 |

ESM 전용입니다.

## 설치

```sh
yarn add @developer-choi/utils
```

## api

```ts
import {FetchApiClient, ApiResponseError, HTTP_STATUS} from '@developer-choi/utils/api';

export const api = new FetchApiClient('https://api.example.com');

try {
  const user = await api.get<User>('users/1', {searchParams: {expand: 'profile'}});
} catch (error) {
  if (error instanceof ApiResponseError && error.status === HTTP_STATUS.NOT_FOUND) {
    // ...
  }
}
```

- 2xx가 아니면 `ApiResponseError`, 요청 자체가 실패하면(네트워크 오류 등) `ApiRequestError`를 던집니다. 둘 다 `BaseError`를 상속하고 `level`(`fatal`·`error`·`warning`·`low`)을 가집니다.
- 응답 본문은 JSON으로 읽습니다. 본문이 비면(204 등) `undefined`를 돌려주므로, 본문 없는 API는 결과를 쓰지 않거나 `api.delete<void>(…)`처럼 부릅니다. `T`는 검증 없는 단언이라 응답 모양을 보장하려면 zod 같은 스키마로 검증합니다.
- 요청 본문은 JSON으로 보냅니다. `FormData`(파일 업로드)만 예외로 그대로 보냅니다. `URLSearchParams`·`Map`처럼 JSON으로 바꿀 수 없는 값은 `{}`가 되니 일반 객체로 넘깁니다.
- 에러를 `instanceof`로 구분하므로, 에러 클래스는 반드시 이 패키지에서 import합니다. 같은 이름의 클래스를 앱에 복사해 두면 `instanceof`가 실패합니다.

### 요청마다 prefixUrl·헤더 바꾸기

생성자 2번째 인자로 넘긴 함수를 요청마다 불러, 돌려받은 `prefixUrl`·`headers`로 생성자 값을 덮습니다. 같은 헤더 키는 호출부(`api.get(url, {headers})`) 값이 이깁니다.

```ts
export const api = new FetchApiClient('', async () => {
  if (typeof window !== 'undefined') {
    return {prefixUrl: window.location.origin};
  }

  const {headers} = await import('next/headers');
  const requestHeaders = await headers();
  const cookie = requestHeaders.get('cookie');
  return {prefixUrl: `https://${requestHeaders.get('host')}`, headers: cookie ? [['Cookie', cookie]] : undefined};
});
```

여기서 넘긴 헤더는 에러 객체의 `headers`에 남지 않습니다. 에러가 Sentry 같은 모니터링 도구로 넘어갈 때 쿠키가 함께 실리지 않게 하기 위해서입니다.

## 버전

1.0 전까지는 아래 규칙으로 올립니다.

- **patch** (`0.1.0` → `0.1.1`): 버그 수정. 쓰는 쪽 코드를 고칠 필요가 없습니다.
- **minor** (`0.1.0` → `0.2.0`): 기능 추가, 또는 쓰는 쪽 코드를 고쳐야 하는 변경. 고쳐야 하는 변경이 있으면 [CHANGELOG.md](CHANGELOG.md)에 무엇을 어떻게 바꾸면 되는지 적습니다.

`package.json`의 `version`을 올린 PR이 master에 머지되면 GitHub Actions가 npm에 배포합니다. 이미 배포된 버전이면 건너뜁니다.

버전마다 바뀐 것은 [CHANGELOG.md](CHANGELOG.md)에 있습니다.
