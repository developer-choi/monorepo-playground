# MSW 핸들러에 응답 타입 붙이기

MSW로 가짜 API 응답(목)을 만들 때, 그 응답에 타입을 붙일지 말지·어떻게 붙일지에 대한 규칙.

출처: https://mswjs.io/docs/best-practices/typescript

> All request handlers in the `http` namespace support three generic arguments:
> `http.get<Params, RequestBodyType, ResponseBodyType, Path>(path, resolver)`

## 문제 — 타입을 안 붙이면 목이 조용히 틀린다

MSW 핸들러는 기본적으로 **응답이 어떤 모양이든 검사하지 않는다.** 그래서 실제 API와
전혀 다른 모양을 반환해도 빨간 줄 하나 안 뜨고 그냥 통과한다.

```ts
// ❌ 나쁜 예 — 응답에 타입이 없다
import {http, HttpResponse} from 'msw';

export const handlers = [
  http.get('*/api/demo-user', () => {
    // 실제 API는 { id, name } 을 주는데,
    // name을 빠뜨리고 엉뚱한 nickname을 넣어도 아무 에러가 안 난다.
    return HttpResponse.json({id: '1', nickname: 'John'});
  }),
];
```

이러면 목을 쓰는 테스트는 초록불인데, 정작 실제 서버 응답과는 모양이 다르다.
목이 "자신 있게 틀린 응답"을 주는 것이다.

## 규칙 1 — 응답에는 타입을 붙이되, 실제 API가 쓰는 그 타입을 쓴다

가장 중요한 규칙이다. 응답 타입을 **목 파일 안에서 새로 손으로 정의하지 말고**,
실제 API 코드가 이미 쓰고 있는 그 타입을 그대로 `import` 해서 쓴다.

```ts
// ❌ 나쁜 예 — 목 파일 안에서 타입을 새로 정의
type DemoUser = {id: string; name: string};

http.get('*/api/demo-user', () =>
  HttpResponse.json<DemoUser>({id: '1', name: 'John'}),
);
// 실제 API가 name → fullName 으로 바뀌어도, 이 목은 옛날 타입 그대로라
// 여전히 통과한다. 결국 실제와 어긋나도 못 잡는다.
```

```ts
// ✅ 좋은 예 — 실제 API가 쓰는 타입을 그대로 가져온다
import {http, HttpResponse} from 'msw';
import type {DemoUser} from '@/api/demo-user'; // 실제 응답을 정의한 그 타입

export const handlers = [
  http.get('*/api/demo-user', () => {
    // DemoUser와 모양이 다르면 여기서 바로 컴파일 에러가 난다.
    return HttpResponse.json<DemoUser>({id: '1', name: 'John Doe'});
  }),
];
```

이렇게 해야 실제 API의 타입이 바뀌는 순간 목도 같이 빨간 줄이 뜬다.
타입을 한 곳에서만 정의하고 목이 그걸 공유하기 때문이다.

> 실제 API에 공유할 타입이 아예 없다면, 목에 억지로 타입을 지어 붙이지 않는다.
> 그건 검사하는 척만 할 뿐 실제와 맞는지는 못 보장한다.
> 이럴 땐 타입을 먼저 한 곳에 만들거나(클라이언트 코드에도 어차피 필요하다),
> 그냥 타입 없이 두는 편이 정직하다.

## 규칙 2 — 파라미터·요청 바디는 "핸들러가 실제로 읽을 때만" 타입을 붙인다

핸들러가 URL 파라미터(`params`)나 요청 바디를 꺼내 쓰는 경우엔, 거기에도 타입이
필요할 수 있다. 기본 상태에서는 `params`가 **아무 키나 허용**해서, 키 이름을 오타 내도
그냥 통과하기 때문이다.

```ts
// ❌ 나쁜 예 — params에 타입이 없어 키 오타가 안 잡힌다
http.get('*/api/user/:userId', ({params}) => {
  const id = params.userIdd; // 오타(userIdd)인데 에러가 안 난다 → id는 사실 undefined
  return HttpResponse.json<DemoUser>({id, name: 'John'});
});
```

이럴 때만 핸들러 제네릭에 타입을 준다. `params` 타입을 앞에, 응답 타입을 뒤에 놓는다
(가운데 요청 바디 칸은 GET이라 안 쓰므로 `never`).

```ts
// ✅ 좋은 예 — params에 타입을 붙이면 키 오타가 컴파일 에러가 된다
http.get<{userId: string}, never, DemoUser>('*/api/user/:userId', ({params}) => {
  const id = params.userId; // userIdd로 쓰면 여기서 빨간 줄
  return HttpResponse.json({id, name: 'John'}); // 응답 타입은 위에서 이미 지정됐다
});
```

반대로, **`params`나 바디를 안 읽는 핸들러엔 이걸 붙이지 않는다.** 안 읽는 값에
타입을 달아봐야 아무것도 안 지켜주고 코드만 지저분해진다.
