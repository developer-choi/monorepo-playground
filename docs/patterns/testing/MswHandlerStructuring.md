# MSW 핸들러를 목적별로 나눠 구조화해요

핸들러를 아무렇게나 한 배열에 늘어놓으면 두 가지가 무너진다. "성공 응답"과 "에러 응답"을 같이 두면 에러 테스트가 성공 테스트를 깨뜨리고, 앱이 커지면 핸들러 수십 개가 한 파일에 쌓여 감당이 안 된다. 기본은 happy path만 두고, 예외는 그때만 갈아끼우고, 규모가 커지면 도메인별로 쪼갠다.

출처: https://mswjs.io/docs/best-practices/structuring-handlers

> We recommend utilizing a single handlers.js module to describe the successful states (happy paths) of your network.

## 기본 핸들러엔 happy path만 담고 예외는 그때만 갈아끼운다

기본 `handlers` 배열에는 **성공 상태(happy path)만** 담는다. `GET /user`는 언제나 정상 유저를 돌려준다.

```ts
// mocks/handlers.ts
import {http, HttpResponse} from 'msw';

export const handlers = [
  http.get('/user', () => {
    return HttpResponse.json({name: 'John Maverick'});
  }),
];
```

그럼 "서버 에러가 났을 때 UI가 잘 뜨나"는 어떻게 테스트할까. 기본 핸들러를 500으로 고치면 성공 테스트가 깨진다. 그래서 **그 테스트 안에서만** `server.use()`로 잠깐 덮어쓴다(런타임 오버라이드). 끝나면 `afterEach`의 `server.resetHandlers()`가 기본 상태로 되돌린다.

```ts
import {http, HttpResponse} from 'msw';
import {server} from '../mocks/node';

afterEach(() => server.resetHandlers()); // 매 테스트 후 handlers.ts 원본으로 복귀

it('유저 이름을 보여준다', async () => {
  render(<UserComponent />);
  expect(await screen.findByText('John Maverick')).toBeVisible(); // 기본 핸들러
});

it('에러가 나면 에러 UI를 보여준다', async () => {
  // 이 테스트 동안만 /user 를 500으로 바꿔치기
  server.use(
    http.get('/user', () => new HttpResponse(null, {status: 500})),
  );

  render(<UserComponent />);
  expect(await screen.findByRole('alert')).toHaveTextContent('Error!');
});
```

`resetHandlers()`가 핵심이다. 두 번째 테스트에서 `/user`를 500으로 바꿨는데 안 되돌리면 **다음 테스트에서도 계속 500이 나온다.** `afterEach(() => server.resetHandlers())`가 매번 `handlers.ts` 원본으로 리셋해 오버라이드가 다음 테스트로 새지 않게 막는다. 이 "기본 → 이 테스트만 오버라이드 → 리셋" 생명주기가 우리가 `server.use()`를 쓸 때마다 지키는 규칙이다.

## 핸들러가 많아지면 도메인별 파일로 쪼갠다

한 배열에 수십 개를 몰아넣지 말고 제품 영역(도메인)별로 파일을 나눈 뒤 index에서 합친다.

```
mocks/
  handlers/
    user.ts       // 유저 관련 요청
    checkout.ts   // 결제 관련 요청
    index.ts      // 위 둘을 하나로 합침
```

```ts
// mocks/handlers/user.ts
import {http} from 'msw';

export const handlers = [
  http.get('/user', getUserResolver),
  http.post('/login', loginResolver),
  http.delete('/user/:userId', deleteUserResolver),
];
```

```ts
// mocks/handlers/index.ts — 흩어진 걸 다시 하나로 모음
import {handlers as userHandlers} from './user';
import {handlers as checkoutHandlers} from './checkout';

export const handlers = [...userHandlers, ...checkoutHandlers];
```

스프레드(`...`)로 유저 핸들러 + 결제 핸들러를 하나의 배열로 합친다. 특정 테스트에서 유저 기능만 검사하고 싶으면 그 묶음만 골라 적용한다.

```ts
import {handlers as userHandlers} from '../../mocks/handlers/user';

server.use(...userHandlers); // 유저 핸들러만 적용
```

## 겹치는 로직은 higher-order resolver로 감싼다

핸들러 여러 개가 똑같은 처리(예: 인증 검사)를 반복하면 유틸 함수로 뺀다. 더 복잡하면 리졸버를 감싸는 **higher-order resolver**를 쓴다 — 리졸버를 인자로 받아 공통 처리를 덧입힌 새 리졸버를 돌려주는 함수다.

```ts
import {http} from 'msw';
import {withAuth} from './withAuth';

export const handlers = [
  // withAuth가 '인증 확인'이라는 공통 처리를 리졸버 바깥에서 감싼다
  http.get('/cart', withAuth(getCartResolver)),
  http.post('/checkout/:cartId', withAuth(checkoutResolver)),
];
```

`withAuth(getCartResolver)`는 "`getCartResolver`를 실행하기 전에 인증부터 확인해라"처럼 리졸버를 감싸 공통 처리를 덧입힌다. 함수를 감싸는 함수라 "고차(higher-order) 리졸버"다. 같은 패턴을 재사용이 아니라 **요청 매칭**(쿼리·바디 값으로 골라 가로채기)에 쓰는 경우는 [MswDeferredTechniques.md](./MswDeferredTechniques.md)를 참고한다.
