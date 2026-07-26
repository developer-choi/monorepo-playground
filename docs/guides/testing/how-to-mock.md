# 모킹은 언제, 어디까지 하나요?

## 목차
1. [왜 테스트 코드를 작성해야 할까요?](./why-to-test.md)
2. [어느 레벨로 테스트를 작성해야 할까요?](./test-levels.md)
3. [테스트 선정과 작성](./how-to-test.md)
4. **모킹은 언제, 어디까지 하나요?** ← 현재 문서

---

## 이 단계의 목표

테스트에서 실제 의존성 대신, 정해둔 대로만 응답하는 가짜로 교체하는 것을 모킹(mock)이라고 합니다.

그런데 막상 하려고 보니 **어디까지 가짜로 만들어야 하는지**가 애매했습니다. 함수 하나를 통째로 가짜로 바꿔도 모킹이고, 네트워크로 나가는 요청만 가로채도 모킹입니다. 같은 "서버를 부르지 않는다"를 만드는 방법이 여러 개인데, 무엇을 고를지 판단할 기준이 없었습니다.

그 기준을 잡으려고 공부한 내용을 정리했습니다.

예를 들어, 댓글 작성 기능을 개발했다고 가정해보겠습니다.

```ts
async function createComment(postId: number, text: string) {
  const response = await fetch(`/api/posts/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }), // 버튼을 누르면 서버로 요청이 나가는데, 서버는 body에 `{ text }`가 담겨 오기를 기대합니다.
  });

  return response.json();
}
```

통합 테스트에서 진짜 서버를 부를 수는 없으니 무언가를 가짜로 교체해야 합니다.

이 때, 모킹의 범위는 다양하게 정할 수 있습니다.

```tsx
vi.mock('./createComment', () => ({
  createComment: vi.fn().mockResolvedValue({ id: 1, text: '잘 봤습니다' }),
}));

test('댓글을 등록하면 목록에 나타난다', async () => {
  render(<CommentForm postId={1} />);

  await userEvent.type(screen.getByLabelText('댓글'), '잘 봤습니다');
  await userEvent.click(screen.getByRole('button', { name: '등록' }));

  expect(await screen.findByText('잘 봤습니다')).toBeInTheDocument();
});
```

이렇게 테스트코드를 작성하면 성공합니다. 우리는 이게 성공했다고 프로덕션에서도 문제가 없을거라고 과연 신뢰할 수 있을까요?

이 글에서는, 위 예제를 개선해 나아가며 결론에 도달하고자 합니다.

## 통째로 모킹하는것이 잘못된 이유

`createComment`를 통째로 가짜로 바꿨기 때문에, 이 테스트가 실행되는 동안 `createComment` 안쪽은 한 줄도 실행되지 않습니다. 주소를 만드는 코드도, `body`를 조립하는 코드도 전부 건너뜁니다.

그래서 누군가 `createComment`를 이렇게 고쳐놔도 테스트는 그대로 성공합니다.

```ts
async function createComment(postId: number, text: string) {
  const response = await fetch(`/api/posts/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: text }), // 서버가 기대하는 건 { text }인데 { content }를 보낸다
  });

  return response.json();
}
```

가짜는 `body`를 쳐다보지 않고 정해둔 `{ id: 1, text: '잘 봤습니다' }`만 돌려줍니다.

테스트는 통과하고, 댓글이 안 달린다는 사실은 프로덕션에서 처음 드러납니다.

여기서 모킹의 특징이 드러납니다. 모킹은 **트레이드오프** 입니다.

모킹을 하면, 모킹 한 대상에서 오류가 발생해도, 잡을 수 없게됩니다.

그렇기 때문에, 모킹은 확신(Confidence)과 편의 2가지를 거래하는 것입니다.

위와같이 통째로 모킹하면 가장 많은 확신을 잃게됩니다.

즉, **모킹의 범위와 확신의 크기는 서로 반비례**하는 관계를 가지고있습니다.

## fetch에서 끊기: 요청 조립까지는 실제로 실행된다

한 칸 바깥에서 모킹 하는것도 가능합니다.

`createComment`는 그대로 두고, 그 안에서 부르는 `fetch`만 바꿉니다.

```ts
vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
  json: async () => ({ id: 1, text: '잘 봤습니다' }),
}));
```

이제 `createComment` 안쪽이 실제로 실행됩니다. 주소를 만들고 `body`를 조립하는 코드가 다 실행됩니다.

```ts
// 주소에 오타가 나도
await fetch(`/api/posts/${postId}/coments`, ...);
```

가짜는 어떤 주소로 불리든 정해둔 값을 돌려줍니다. 그래서 이 테스트는 여전히 성공합니다.

### 얻는 것과 잃는 것

- ✅ 앞보다 확신을 덜 잃습니다. 요청을 조립하는 코드가 실제로 실행됩니다.
- ❌ 조립한 결과가 맞는지는 여전히 아무도 검증하지 않습니다. 주소가 틀려도 통과하므로, 확인하려면 테스트마다 `fetch`가 무엇으로 불렸는지 직접 꺼내 봐야 합니다.

## 네트워크 문턱에서 끊기: MSW

가장 바깥에서 끊어보겠습니다. MSW는 앱이 네트워크로 내보낸 요청을 가로챕니다.

```ts
const server = setupServer(
  http.post('/api/posts/:postId/comments', async ({ request }) => {
    const { text } = await request.json();
    return HttpResponse.json({ id: 1, text });
  }),
);
```

가로채는 자리가 네트워크라 앱 코드가 끝까지 실제로 실행됩니다. 그리고 요청을 받는 쪽이 주소와 본문을 보고 있습니다.

- 주소를 `/coments`로 잘못 적으면 이 핸들러가 호출되지 않아 테스트가 (의도대로) 실패합니다.
- `text` 대신 `content`를 보내면 `request.json()`에서 `text`가 비어 화면에 기대한 댓글이 뜨지 않습니다.

앞의 두 방법에서는 그냥 통과해버리던 버그가 여기서는 잡힙니다. 별도로 검증 코드를 더 쓴 게 아니라, 끊는 지점을 바깥으로 밀었더니 검증이 따라온 것입니다.

### 얻는 것과 잃는 것

- ✅ 확신을 가장 적게 잃습니다. 주소·헤더·본문을 조립하는 코드가 전부 실제로 실행되고, 어긋나면 테스트가 깨집니다.
- ❌ 그래도 서버는 진짜가 아닙니다. 서버가 실제로 그 모양의 응답을 주는지는 이 테스트가 말해주지 않습니다. 이 부분은 어느 방법을 써도 남는 몫이라, 여기까지 지키려면 모킹을 안 하는 수밖에 없습니다.

## 애초에 모킹이 필요했나요

여기까지는 "모킹한다면 어디까지 할 것인가"였습니다. 그런데 그 앞에 던졌어야 할 질문이 있습니다. **모킹이 필요하긴 했나요?**

모킹하지 않으면 테스트가 아예 실행되지 않는 경우가 있습니다.

- **느림**: 진짜 서버에 요청을 보내면 응답이 올 때까지 기다려야 합니다.
- **불안정**: 실행할 때마다 값이 달라지면, 코드가 멀쩡해도 결과가 흔들립니다(flaky).
- **통제 못 할 부작용**: 테스트를 돌릴 때마다 진짜 결제가 승인되면 곤란합니다.

댓글 예시는 앞의 두 가지에 걸립니다. 응답을 기다려야 하고, 서버 사정에 따라 결과도 흔들립니다.

모킹이 정당했으니, 그래서 "어디까지 모킹할까"를 따진 게 의미가 있었습니다.

셋 중 어디에도 안 걸리는데 모킹했다면, 그건 어디까지 모킹했느냐 이전에 모킹할 이유 자체가 없었던 경우입니다.

```ts
function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// ❌ 부르는 즉시 답이 나오고, 언제 불러도 같은 값을 주는 함수
vi.mock('./isValidEmail');
```

`isValidEmail`은 느리지도, 흔들리지도, 부작용을 내지도 않습니다. 진짜를 그대로 쓰면 되는데 가짜로 바꾸면, 얻는 것 없이 확신만 잃습니다. 게다가 정규식이 잘못돼도 테스트는 통과합니다.

## 결론

테스트는 실제 사용에 가까울수록 더 큰 확신을 준다고 생각합니다.

모킹은 진짜를 가짜로 교체하는 일이라, 많이 할수록 실제 사용에서 멀어집니다. 확신을 편의와 거래하는 셈입니다.

그래서 모킹을 해야한다면, 모킹하려는 이유를 없앨 만큼만 교체해야 한다고 생각합니다.

네트워크 요청을 모킹하는 이유는 실서버가 느리고 결과도 일정하지 않다는 것입니다. 서버만 가짜로 두면 그 이유가 사라지므로, 저는 MSW로 네트워크만 가로챕니다. 주소와 본문을 만드는 코드까지 건너뛸 이유는 없습니다.

결제 SDK를 모킹하는 이유는 진짜 청구가 일어난다는 것입니다. 이건 SDK를 부르지 않아야 사라지므로 모듈째 바꿉니다.

## References

### [The Merits of Mocking](https://kentcdodds.com/blog/the-merits-of-mocking)

> When you mock something, you're making a trade-off. You're trading confidence for something else.

- 모킹을 거래로 본 근거입니다. 내주는 것이 확신이라는 게 이 문서 전체의 출발점입니다.

> Mocking severs the real-world connection between what you're testing and what you're mocking.

- 모킹한 그 연결이 끊긴다는 뜻입니다. `createComment`를 통째로 바꿨을 때 `text`와 `content`가 어긋나도 끝까지 안 잡히는 이유가 여기 있습니다.

### [Write tests. Not too many. Mostly integration.](https://kentcdodds.com/blog/write-tests)

> When you mock something you're removing all confidence in the integration between what you're testing and what's being mocked.

- 확신이 조금 줄어드는 게 아니라, 그 연결에 대해서는 남지 않습니다. 모킹의 범위와 확신의 크기가 반비례하는 근거입니다.

### [Static vs Unit vs Integration vs E2E Testing](https://kentcdodds.com/blog/static-vs-unit-vs-integration-vs-e2e-tests)

> The more your tests resemble the way your software is used, the more confidence they can give you.

- 결론의 첫 문장이 그대로 여기서 나왔습니다. 확신을 재는 잣대가 모킹의 양이 아니라 실제 사용과의 거리라는 근거입니다.

> I pretty much only mock:
> 1. Network requests (using MSW)
> 2. Components responsible for animation

- 모킹할 대상을 목록으로 한정하고, 네트워크 요청에는 MSW를 지목합니다.

### [Testing in Practice](https://vitest.dev/guide/learn/testing-in-practice.html)

> Only reach for mocks when the real thing is slow, flaky, or has side effects you can't control in a test.

- 「애초에 모킹이 필요했나요」의 세 갈래가 이 문장입니다.

> If a dependency is a simple in-memory data structure or a pure function, there's no reason to mock it.

- `isValidEmail`을 모킹하면 안 되는 이유입니다. 셋 중 어디에도 안 걸리는 대상이 여기 해당합니다.

### [Stop Mocking Fetch](https://kentcdodds.com/blog/stop-mocking-fetch)

> If I get something wrong with the way I call `fetch`, then my server handler won't be called and my test (correctly) fails, which would save me from shipping broken code.

- 주소를 `/coments`로 잘못 적었을 때 MSW에서만 테스트가 깨지는 이유입니다. 별도 검증 코드 없이 검증이 따라오는 구조를 그대로 설명합니다.

> One thing that really bothers me about mocking things like `fetch` is that you end up re-implementing your entire backend... everywhere in your tests.

- `fetch`에서 끊었을 때 남는 몫입니다. 조립한 결과가 맞는지 확인하려면 테스트마다 직접 꺼내 봐야 하는 것이 이 재구현에 해당합니다.

### [Mock Service Worker](https://mswjs.io/docs/)

> MSW uses the Service Worker API to intercept actual production requests on the network level. Instead of patching `fetch` and meddling with your application's integrity, MSW bets on the platform, utilizing the standard browser API to implement a revolutionary request interception logic.

- `fetch`를 바꿔치기하는 것과 네트워크에서 가로채는 것을 가르는 지점입니다. 끊는 지점을 바깥으로 미는 근거입니다.

### [Philosophy](https://mswjs.io/docs/philosophy)

> We are convinced that API mocking deserves a layer of its own in your application.

- 모킹을 테스트 도구에 얹힌 기능이 아니라 별도 계층으로 두라는 주장입니다.

### [React Testing Library](https://testing-library.com/docs/react-testing-library/example-intro)

> We recommend using the Mock Service Worker (MSW) library to declaratively mock API communication in your tests instead of stubbing `window.fetch`, or relying on third-party adapters.

- 같은 결론을 테스트 라이브러리 쪽에서도 권장하고 있습니다.
