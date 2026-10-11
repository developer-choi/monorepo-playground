TanStack Query 사용 모양을 정하는 규칙입니다. 따로 적지 않은 규칙은 `eslint.config.base.mts`의 `baseRules`에 있습니다.

`no-restricted-syntax` 항목은 [eslint.md](../eslint.md#no-restricted-syntax-항목)의 공통 처리(위반 시 `eslint-disable` + 사유 주석)를 따릅니다.

## `no-restricted-syntax` — useMutation `mutationFn` 래핑 금지

셀렉터: `Property[key.name='mutationFn'] > ...` 3개 셀렉터

`mutationFn`에는 API 함수 reference만 박고, 인자는 `mutateAsync`로 전달합니다. 인라인 화살표 래핑·블록 본문 가드·`function` 표현식을 금지합니다. 단 instance method는 `this` 바인딩 때문에 멤버식 callee(`x.method(...)`)로 래핑이 불가피하므로 허용합니다 — callee가 식별자일 때만 차단합니다.

```ts
// ❌ (args) => api(args) 인라인 래핑
useMutation({mutationFn: (args) => postBoardApi(args)});

// ❌ 블록 본문 가드·조립
useMutation({mutationFn: (args) => { if (!args.title) { throw new Error(); } return postBoardApi(args); }});

// ✅ reference만
useMutation({mutationFn: postBoardApi});

// ✅ instance method 예외(멤버식 callee)
useMutation({mutationFn: ({widget, ...params}) => widget.requestPayment(params)});
```

> 한계: 멤버식 callee는 `this` 필요 여부를 타입 없이 판별할 수 없어 전부 허용합니다. `this`가 필요 없는데도 `(a) => api.create(a)`로 래핑하면 잡지 못합니다.
