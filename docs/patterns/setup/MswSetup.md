# MSW Setup (테스트)

## 상황

`TestSetup.md`의 Vitest + React Testing Library 환경 위에 네트워크 요청을 MSW로 목킹한다. **test-only(Node)** 범위다 — 브라우저에서 앱을 mock으로 띄우는 dev 셋업은 제외한다(맨 아래 "제외" 참고).

## 설치

```bash
npm i msw --save-dev
```

출처: https://mswjs.io/docs/quick-start
> npm i msw --save-dev

## 핸들러 — `src/mocks/handlers.ts`

happy path만 담는다. 에러 등 예외는 각 테스트에서 `server.use()`로 오버라이드한다. 핸들러 구조화·응답 타입·요청 매칭은 [MswHandlerStructuring](../testing/MswHandlerStructuring.md)·[MswHandlerTypes](../testing/MswHandlerTypes.md) 참고(여기서 중복하지 않는다).

```ts
import {http, HttpResponse} from 'msw';

export const handlers = [
  http.get('https://api.example.com/user', () => {
    return HttpResponse.json({id: 'abc-123', name: 'John Maverick'});
  }),
];
```

출처: https://mswjs.io/docs/quick-start

## 서버 — `src/mocks/node.ts`

`setupServer`에 핸들러를 펼쳐 넘겨 Node용 서버를 만든다. 3종 훅이 쓰는 `server`가 여기서 만들어진다.

```ts
import {setupServer} from 'msw/node';
import {handlers} from './handlers';

export const server = setupServer(...handlers);
```

출처: https://mswjs.io/docs/integrations/node
> Import the server anywhere in your Node.js application and call the .listen() method to enable API mocking.

### 핸들러 URL은 절대경로여야 한다 — Node엔 상대 URL이 없다

브라우저에서는 상대 URL이 `location.href` 기준으로 풀리지만 Node엔 그게 없다. 그래서 핸들러도, 앱이 실제로 보내는 요청도 **절대 URL**이어야 MSW가 매칭한다.

출처: https://mswjs.io/docs/http/intercepting-requests
> When you provide a _relative request URL_ as a predicate, it will be resolved against the current document (`location.href`). This is handy for in-browser mocking, but bear in mind that you need to configure the base URL in your Node.js tests because that's not a thing in Node.js.

앱이 baseURL을 env(`NEXT_PUBLIC_API_URL` 등)로 잡는다면, 테스트에도 **같은 env를 주입**해 싱글턴 클라이언트가 절대 URL을 만들게 한다. Vitest는 `test.env`로 `process.env`에 값을 넣을 수 있고, `loadEnv`로 `.env` 파일에서 읽어오면 값이 config에 하드코딩되지 않는다.

```ts
// vitest.config.mts
import {loadEnv} from 'vite';
export default defineConfig(({mode}) => ({
  test: {env: loadEnv(mode, process.cwd(), 'NEXT_PUBLIC_')},
}));
```

출처: https://vitest.dev/config/env
> Environment variables available on `process.env` and `import.meta.env` during tests.

## 배선 — `vitest.setup.ts` lifecycle 3종 훅

setup 파일에 3종 훅을 건다. 이 파일은 이미 `vitest.config.mts`의 `test.setupFiles`에 등록돼 있다([TestSetup](./TestSetup.md)).

```ts
import {beforeAll, afterEach, afterAll} from 'vitest';
import {server} from './src/mocks/node';

beforeAll(() => server.listen({onUnhandledRequest: 'error'}));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

출처: https://mswjs.io/docs/integrations/node (+ https://mswjs.io/docs/quick-start)
> There are three key steps to integrating MSW with any test runner:
> - Enable mocking before all tests run (server.listen());
> - Reset any request handlers between tests (server.resetHandlers());
> - Restore native request-issuing modules after all tests run (server.close()).

- **왜 setup 파일인가** — `setupFiles`는 각 테스트 파일 앞에서 매번 실행돼, 3종 훅이 모든 테스트 파일에 자동으로 걸린다.
  출처: https://vitest.dev/config/setupfiles
  > They will run before each _test file_ in the same process.
- **왜 await가 없나** — `server.listen()`은 동기 API다.
  출처: https://mswjs.io/docs/integrations/node
  > server.listen() is a synchronous API so you don't have to await it.
- **`onUnhandledRequest: 'error'`** — 핸들러 없는 요청을 테스트 실패로 만든다(MP 컨벤션). 근거는 [MswAvoidRequestAssertions](../testing/MswAvoidRequestAssertions.md)의 "예상 못 한 요청은 그물망으로 막는다".

## 제외 — 브라우저 전용은 test-only에 불필요

Node 테스트는 `setupServer`가 `http`/`https` 모듈을 직접 패치해 가로챈다. 브라우저의 Service Worker 경로가 아니므로 아래 둘은 쓰지 않는다.

- **`msw init` (워커 스크립트 public 복사)** — Service Worker를 앱이 직접 서빙해야 해서 필요한 단계. 브라우저 전용.
  출처: https://mswjs.io/docs/integrations/browser
  > If your application registers a Service Worker it must host and serve it. The library CLI provides you with the init command to quickly copy the ./mockServiceWorker.js worker script into your application's public directory.
- **`worker.start()`** — 브라우저 진입점에서 부르는 비동기 스위치(await 필요). 테스트는 동기 `server.listen()`을 쓴다.
  출처: https://mswjs.io/docs/integrations/browser
  > Make sure to await the worker.start() Promise! Service Worker registration is asynchronous and failing to await it may result in a race condition between the worker registration and the initial requests your application makes.

브라우저 dev 목킹이 필요해지면 공식 https://mswjs.io/docs/integrations/browser 를 따른다.
