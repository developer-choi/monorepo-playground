# 어느 레벨로 테스트를 작성해야 할까요?

## 목차
1. [왜 테스트 코드를 작성해야 할까요?](./why-to-test.md)
2. **어느 레벨로 테스트를 작성해야 할까요?** ← 현재 문서
3. [테스트 선정과 작성](./how-to-test.md)
4. [모킹은 언제, 어디까지 하나요?](./how-to-mock.md)

---

## 이 단계의 목표

테스트 코드를 작성할 때, 이걸 E2E / 통합 / 단위 중 **어떤 레벨로 작성해야하는지**, **왜 그래야하는지**를 이해하는것이 목적입니다.

예를들어, 로그인 폼을 개발했는데 이메일 유효성검증을 테스트 해야한다고 가정해보겠습니다.

### E2E로 작성한 경우

```ts
test('이메일 형식이 틀리면 에러 메시지가 뜬다', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('이메일').fill('helloworld');
  await page.getByRole('button', { name: '로그인' }).click();

  await expect(page.getByText('이메일 형식이 올바르지 않습니다')).toBeVisible();
});

test('이메일이 비어 있으면 에러 메시지가 뜬다', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: '로그인' }).click();

  await expect(page.getByText('이메일을 입력해 주세요')).toBeVisible();
});
```

왜 이렇게 작성하면 손해인지 차례차례 풀어보겠습니다.

## E2E: 사용자처럼 앱 전체를 돌린다

방금 본 코드가 E2E test입니다. 실제 브라우저를 띄워 사용자가 하듯 클릭·입력하고, 프론트부터 서버·DB까지 전 구간을 진짜로 통과시킵니다. `page.goto('/login')`은 진짜 서버에 요청을 보내고, `fill`과 `click`은 진짜 브라우저 이벤트를 일으킵니다.

로그인이 잘 되는지 보려면 직접 로그인해보는 게 가장 확실합니다.

### 얻는 것과 잃는 것

- ✅ 확신이 가장 높습니다. 프론트·네트워크·백엔드·DB가 실제로 맞물려 도는 전체 흐름을 검증합니다.
- ❌ 가장 느립니다. 브라우저와 서버를 실제로 띄워야 하고, 실패 지점이 여러 계층에 흩어져 원인 추적이 어렵습니다. 내 코드와 무관한 외부 요인 탓에 엉뚱하게 깨지기도(flaky) 합니다.

## Integration: 여러 단위가 맞물려 도는지 본다

그럼 이메일 유효성 검증을 E2E로 짜면 왜 손해일까요?

이메일 형식이 맞는지는 브라우저 안에서 끝나는 판정인데, 그걸 확인하자고 서버를 띄우고 페이지를 내려받고 브라우저를 실행했습니다. 형식이 틀린 케이스마다 이 왕복을 통째로 반복해야 하고, 다른 외부 요인에 의해 테스트 대상 코드와 무관하게 테스트가 깨질 수 있습니다.

그런데 이 판정에 실제로 관여하는 건 로그인 폼 하나입니다. 그럼 다른 것을 걷어내고, 폼 컴포넌트만 메모리에 렌더해서 똑같이 확인하면 됩니다. 이렇게 여러 단위를 함께 렌더해 돌려보는 게 integration test입니다.

```tsx
render(<LoginForm />);

await userEvent.type(screen.getByLabelText('이메일'), 'helloworld');
await userEvent.click(screen.getByRole('button', { name: '로그인' }));

expect(await screen.findByText('이메일 형식이 올바르지 않습니다')).toBeInTheDocument();
```

E2E 때와 사실상 같은 행동입니다. 사용자가 하는 행동을 그대로 따라가니 확신도 크게 떨어지지 않습니다.

### 얻는 것과 잃는 것

- ✅ 실제 사용 경로를 통째로 검증하면서도 앱 전체를 띄우지 않아 E2E보다 훨씬 빠릅니다. 깨져도 폼 안쪽으로 원인이 좁혀집니다.
- ❌ 확신은 E2E보다 낮습니다. 폼 안에서 벌어지는 일만 보므로, 이 폼이 실제 페이지에 제대로 얹혀 사용자에게 닿는지까지는 말해주지 못합니다.

따라서, 위 경우라면, E2E 보다는 통합테스트가 더 나은 선택입니다.

훨씬 빠른 속도로 거의 똑같은 확신을 얻을 수 있기 때문입니다.

**하지만, 아직 최선이 아닙니다.**

## Unit: 가장 작은 단위 하나를 격리해서 본다

integration으로 내려와도 남는 문제가 있습니다. 이메일 형식은 틀리는 방법이 여러 가지라 케이스가 금방 늘어나는데, 그때마다 폼을 새로 렌더하고 타이핑을 흉내 내야 합니다. 깨졌을 때 폼 안쪽 어디가 문제인지 한 번 더 들여다봐야 하는 것도 그대로입니다.

그런데 "이 문자열이 이메일 형식인가"는 폼도 화면도 필요 없는, 함수 하나의 판정입니다. 이럴 때 그 함수만 떼어 테스트하는 게 unit test입니다.

```ts
function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

test.each([
  ['helloworld', false],
  ['', false],
  ['user@example', false],
  ['user@example.com', true],
])('%s → %s', (input, expected) => {
  expect(isValidEmail(input)).toBe(expected);
});
```

의존성(DB·네트워크·다른 컴포넌트) 없이 대상만 부르므로, 케이스를 늘려도 부담이 적고 깨지면 원인이 이 함수 하나로 곧장 좁혀집니다.

### 얻는 것과 잃는 것

- ✅ 가장 빠릅니다. 실패하면 원인이 그 함수 하나로 곧장 좁혀집니다.
- ❌ 확신은 가장 낮습니다. 사용자는 함수를 부르지 않고 입력칸에 타이핑합니다. 실제 사용에서 가장 먼 자리라 닮은 정도가 가장 낮고, 그만큼 확신도 낮습니다.

따라서, **이메일 유효성검증**이 목적이라면 E2E보다, Integration보다, Unit으로 테스트하는것이 가장 좋습니다.

1. 거의 같은 확신을 얻으면서,
2. 가장 빠르게 테스트코드가 실행 및 종료될 수 있으며,
3. 테스트가 깨졌을 때 어디에서 깨졌는지 가장 좁은 범위로 찝어주기 때문에 가장 빠르게 고칠 수 있습니다.

반대로 E2E로 작성할 경우, 확신은 별차이 없는데 가장 느리고, 테스트 깨졌을 때 어디서 잘못된건지 찾을 때 범위가 제일 넓어서 디버깅 시 오래걸립니다.

그럼, 이메일 유효성검증 말고 다른 경우는 어떤 레벨을 선택해야할까요?

정답은 없지만, 오답은 있습니다.

## 오답은 있습니다: icecream cone

E2E가 제일 많고 unit이 제일 적은 뒤집힌 모양, **icecream cone**은 잘못된 형태입니다.

E2E 테스트가 가장 많은 형태를 뜻하며, 코드로 비유하자면 이렇습니다.

```ts
// e2e/login.spec.ts
test('이메일 형식이 틀리면 에러 메시지가 뜬다', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('이메일').fill('helloworld');
  await page.getByRole('button', { name: '로그인' }).click();

  await expect(page.getByText('이메일 형식이 올바르지 않습니다')).toBeVisible();
});

// 이메일이 비어 있으면 에러 메시지가 뜬다
// 비밀번호가 8자 미만이면 에러 메시지가 뜬다
// 비밀번호에 특수문자가 없으면 에러 메시지가 뜬다
// 비밀번호 표시 버튼을 누르면 입력값이 보인다
// 아이디 저장을 체크하고 다시 오면 이메일이 채워져 있다
// 비밀번호 찾기를 누르면 해당 페이지로 이동한다
```

```tsx
// LoginForm.test.tsx
// 로그인에 성공하면 대시보드로 이동한다
```

로그인 페이지의 케이스가 거의 다 위쪽 파일에 몰려 있습니다. 이 파일 하나를 돌리는 데 매번 브라우저와 서버가 뜹니다.

이런식으로 E2E를 가장 많이 작성하게될 경우, 위에서 말씀드린 E2E 단점을 그대로 겪게됩니다.

## 결론: 레벨 선택 기준

레벨은 순서대로 골라야한다고 생각합니다.

테스트코드를 작성해야한다면,

1. Unit, Integration으로 거의 동일한 결과를 얻을 수 있다면, Unit, Integration으로 작성하고,
2. 불가능한 부분은 E2E로 작성해야한다고 생각합니다.

Unit이 제일 많은 피라미드나, Integration이 제일 많은 트로피 형태 둘다 좋다고 생각합니다.

최소한, icecream cone 모델은 위와같은 사유로 잘못되었다고 생각합니다.

결과가 동일하다면, 이메일 유효성검증이 잘 되는지를 동일하게 확인할 수 있다면,

E2E를 선택해서 얻을 수 있는 이득이 없기 때문입니다.

## References: [Just Say No to More End-to-End Tests](https://testing.googleblog.com/2015/04/just-say-no-to-more-end-to-end-tests.html)

> If two units do not integrate properly, why write an end-to-end test when you can write a much smaller, more focused integration test that will detect the same bug?

- 같은 버그가 잡힌다면 E2E를 쓸 이유가 없다는 뜻입니다. 위에서 이메일 유효성검증을 아래로 내린 근거와 같습니다.

> Even with both unit tests and integration tests, you probably still will want a small number of end-to-end tests to verify the system as a whole.

- 그렇다고 E2E를 없애라는 말은 아닙니다. 아래에서 못 잡는 것, 전체가 붙어야만 드러나는 것을 위해 소수는 남깁니다.
