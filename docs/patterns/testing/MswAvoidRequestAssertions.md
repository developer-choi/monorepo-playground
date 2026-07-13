# 가로챈 요청이 아니라 앱의 반응을 테스트해요

MSW로 요청을 가로챌 때, **그 요청 자체를 단언(assert)하지 않는다.** "진짜 `/login`으로 요청이 나갔나, 바디에 email이 담겼나, 이 핸들러가 불렸나"를 확인하는 것은 앱이 *무엇을 하는가(what it does)*가 아니라 *어떻게 짜였는가(how it's written)*를 검사하는 **구현 세부 테스트**다. 대신 **그 요청에 앱이 어떻게 반응하는지(화면이 어떻게 바뀌는지)**를 본다. 판정 근거는 [WhatToTest.md](./WhatToTest.md)의 "구현 세부사항은 테스트하지 않는다"와 같다.

출처: https://mswjs.io/docs/best-practices/avoid-request-assertions

> Instead of asserting that a particular request was made, test how your application reacts to that request.

아래 예시는 로그인 폼이다. email·비번을 `/login`으로 POST 하고, 성공하면 "환영합니다", 실패(400 등)면 "로그인 실패"를 띄운다.

```tsx
function LoginForm() {
  const [msg, setMsg] = useState('');

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const res = await fetch('/login', {method: 'POST', body: form});
        setMsg(res.ok ? '환영합니다' : '로그인 실패');
      }}
    >
      <input name="email" />
      <input name="password" type="password" />
      <button>로그인</button>
      <p role="status">{msg}</p>
    </form>
  );
}
```

## 나간 요청을 캡처해 URL·바디를 단언한다

```tsx
it('로그인하면 email을 담아 요청을 보낸다', async () => {
  let capturedRequest: Request;
  server.events.on('request:start', ({request}) => {
    capturedRequest = request;
  });

  render(<LoginForm />);
  await userEvent.type(screen.getByRole('textbox'), 'a@b.com');
  await userEvent.click(screen.getByRole('button'));

  const body = await capturedRequest.formData();
  expect(capturedRequest.url).toBe('http://localhost/login'); // 구현을 붙잡음
  expect(body.get('email')).toBe('a@b.com');
});
```

이 테스트는 "화면이 뭘 하는가"가 아니라 "코드가 요청을 어떻게 짰는가"를 검사한다 — 요청 URL·바디 같은 구현 세부에 단언을 걸었기 때문이다. 앱이 겉으로 하는 일이 그대로여도, 요청을 만드는 내부 방식이 바뀌면 이런 테스트가 깨진다.

→ **대신**: 요청이 나갔는지는 보지 않고, 그 결과로 화면에 뭐가 떴는지를 본다.

```tsx
it('로그인에 성공하면 환영 메시지를 보여준다', async () => {
  render(<LoginForm />);
  await userEvent.type(screen.getByRole('textbox'), 'a@b.com');
  await userEvent.click(screen.getByRole('button'));

  expect(await screen.findByText('환영합니다')).toBeVisible();
});
```

## "요청이 올바른지"는 핸들러로 검증한다

"email 없이 보내면 안 된다"를 테스트에서 `expect(body.email).toBeDefined()`로 확인하지 않는다. **핸들러를 진짜 서버처럼** 만들어 email이 없으면 400을 주게 하고, 테스트는 그 결과 화면만 본다.

```ts
// mocks/handlers.ts — 핸들러가 실제 서버처럼 유효성 검사
export const handlers = [
  http.post('/login', async ({request}) => {
    const data = await request.formData();
    const email = data.get('email');

    if (!email) {
      return new HttpResponse('Missing email', {status: 400});
    }
    return HttpResponse.json({ok: true});
  }),
];
```

```tsx
it('email 없이 제출하면 실패 메시지를 보여준다', async () => {
  render(<LoginForm />);
  await userEvent.click(screen.getByRole('button')); // email 안 채우고 제출

  // 앱이 email을 빠뜨림 → 핸들러가 400 → 화면에 '로그인 실패'
  expect(await screen.findByText('로그인 실패')).toBeVisible();
});
```

email이 바디에 있는지 테스트가 직접 확인하지 않는다. 핸들러가 400을 주고, 그 결과인 '로그인 실패' 화면을 검증한다. 앱이 실수로 email을 빠뜨리면 이 테스트가 자동으로 실패한다. 덤으로 핸들러가 프로덕션 서버 동작에 가까워진다. 더 좁은 검증이 필요하면 `.use()` 오버라이드로 그 테스트에서만 핸들러 로직을 덧붙인다 — 오버라이드가 다음 테스트로 새지 않게 리셋하는 생명주기는 [MswHandlerStructuring.md](./MswHandlerStructuring.md)를 참고한다.

## 예상 못 한 요청은 그물망으로 막는다

개별 요청을 일일이 감시하는 대신, "핸들러 없는 요청은 전부 에러"를 셋업에 한 번 깔아둔다.

```ts
// vitest.setup.ts
import {server} from './mocks/node';

beforeAll(() => {
  server.listen({onUnhandledRequest: 'error'}); // 등록 안 된 요청 만나면 테스트 실패
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

앱이 실수로 `/analytics`나 `/unknown-api`를 몰래 호출하면 핸들러가 없으므로 테스트가 에러로 터진다. "예상 못 한 요청 안 보냈나"를 테스트마다 단언하지 않아도 자동으로 보장된다.

## 예외 — 화면에 흔적 없는 단방향 요청만 직접 검증한다

애널리틱스·모니터링처럼 **화면에 아무 흔적도 안 남기는 단방향 요청**은 반응으로 검증할 수 없다(볼 화면이 없으니까). 이것만 예외로, Life-cycle events로 요청 자체를 확인한다.

```tsx
it('버튼 클릭 시 애널리틱스 이벤트를 보낸다', async () => {
  const requests: Request[] = [];
  server.events.on('request:start', ({request}) => {
    if (request.url.includes('/analytics')) requests.push(request);
  });

  render(<Page />);
  await userEvent.click(screen.getByRole('button', {name: '구매'}));

  expect(requests).toHaveLength(1);
});
```

첫 안티패턴 코드와 겉모습이 비슷하지만, **여기선 검증할 화면 반응이 없기 때문에** 정당하다. 반응이 있는 요청(로그인 등)에 이 방식을 쓰면 다시 안티패턴이다.
