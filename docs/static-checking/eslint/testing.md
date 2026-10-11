테스트·목 코드에 적용하는 규칙입니다. 따로 적지 않은 규칙은 `eslint.config.base.mts`의 `baseRules`에 있습니다. 제목에 `testFilesConfig`가 붙은 규칙은 테스트 파일(`**/*.test.{ts,tsx}`·`**/*.spec.{ts,tsx}`)에만 적용됩니다.

`no-restricted-syntax` 항목은 [eslint.md](../eslint.md#no-restricted-syntax-항목)의 공통 처리(위반 시 `eslint-disable` + 사유 주석)를 따릅니다.

## 테스트 파일 전용: `aria-*` 금지 (`testFilesConfig`)

`testFilesConfig`(base export, 각 워크스페이스 config 배열에 추가)가 테스트 JSX의 `aria-*` 작성을 `no-restricted-syntax`로 금지합니다. **a11y가 현재 우선순위가 아니라** 테스트에 접근성 계약을 박지 않기 위함입니다. `getByRole`는 허용하며(base 기존 `no-restricted-syntax` 항목도 보존), 불가피하면 `eslint-disable` + 사유로 처리합니다.

적용 대상은 `**/*.test.{ts,tsx}`와 `**/*.spec.{ts,tsx}`입니다. `.spec`은 Playwright E2E 스펙 확장자로, 스펙이 생기기 전에 넣어둬 첫 스펙부터 걸리게 합니다. 이 블록은 [`no-floating-promises`](async.md#typescript-eslintno-floating-promises-앱-소스-off-테스트-파일-error)를 `error`로 되살리는 자리이기도 합니다.

```tsx
render(<Callout aria-label="알림">내용</Callout>); // ❌ 테스트 JSX에 aria-*
render(<Callout>내용</Callout>);                   // ✅ role로 쿼리
expect(screen.getByRole('note')).toBeInTheDocument();
```

## 테스트 파일 전용: `expect()` 안에서 목 내부 파헤치기 금지 (`testFilesConfig`)

`expect(...)` 안에서 `mock.calls`·`mock.lastCall`·`mock.results`·`mock.settledResults`·`mock.instances`·`mock.invocationCallOrder`에 접근하는 코드를 `no-restricted-syntax`로 금지합니다.

죄목은 목 접근 자체가 아니라 **단언이 안 읽히는 것**입니다. `expect(onChange.mock.calls[0][0].target.value)`는 파헤치는 경로가 문장을 삼켜 "무엇을 기대하는가"가 안 보입니다. 다른 게이트는 이 모양을 못 잡습니다 — [`no-unsafe-assignment`](type-safety.md#typescript-eslintno-unsafe-assignment)은 `any` 누수만 볼 뿐이고(2026-08-04 서브에이전트 실측: lint 0건 통과), tsc의 `noUncheckedIndexedAccess`가 한 번 걸지만 `!` 하나로 뚫리며 `no-non-null-assertion`은 이 레포에 없습니다.

경계는 "**단언 안에서** 파헤치는가"입니다. 목에서 값을 꺼내는 것 자체는 정당한 용도가 있어(꺼낸 인자로 메서드 호출, 목이 받은 콜백을 꺼내 직접 실행 — 매처는 "인자가 이 모양인가"만 답할 수 있어 대체 불가) `expect()` 밖에서 이름 붙여 꺼내는 건 허용합니다. 테스트 파일 전체 금지(넓은 안)를 검토했으나, 그 정당한 용도를 막고 disable 주석 말고는 출구가 없어 기각했습니다.

```tsx
// ❌ 단언 안에서 파헤침 — 경로가 문장을 삼킴
expect(onChange.mock.calls[0][0].target.value).toBe('agree');

// ✅ 인자 검증은 toHaveBeenCalledWith + 한 겹 objectContaining
expect(onChange).toHaveBeenCalledWith(expect.objectContaining({target: checkbox}));

// ✅ 꼭 꺼내야 하면 expect() 밖에서 이름 붙여 분리 (목이 받은 콜백을 직접 실행해야 할 때)
const [{onRetry}] = openToast.mock.lastCall!;
onRetry();
expect(await screen.findByRole('status')).toHaveTextContent('다시 불러왔습니다');
```

## 테스트 파일 전용: `custom-test/no-uniform-table-column` (커스텀 룰)

`it.for`·`test.for`·`describe.for`(및 `.each`)에 넘기는 표에서 **모든 행이 같은 값인 열**을 금지합니다.

표의 열은 "케이스를 가르는 축"으로 읽힙니다. 행마다 안 변하는 값이 섞여 있으면 읽는 사람이 매 행을 눈으로 대조해야 그게 축이 아님을 알게 되므로, 고정 값은 표 밖 상수로 뺍니다. 행끼리 비교해야 판정되는 규칙이라 `no-restricted-syntax` 셀렉터로는 표현할 수 없어 AST 룰로 구현합니다.

검사 범위와 판정 기준:

- 호출 자리에 직접 쓴 배열 리터럴(`as const` 포함)과 **같은 파일의 `const` 배열**까지 따라갑니다. 다른 파일에서 import한 표는 검사하지 않습니다.
- 행이 객체면 키별로, 배열이면 자리별로 묶고, 행 자체가 값이면 표 전체를 비교합니다.
- "같은 값"은 **소스 텍스트**로 판정합니다. 그래서 `HTTP_STATUS.OK`처럼 상수 참조도 잡히고, 반대로 `200`과 `HTTP_STATUS.OK`처럼 텍스트만 다른 같은 값은 놓칩니다. 값을 실제로 계산하려면 코드를 실행해야 하므로 거기까지 가지 않습니다.
- 값이 **함수 호출·`new`**면 비교에서 제외합니다. 텍스트가 같아도 행마다 다른 값을 만들 수 있어(`makeClient()`) 오탐이 되기 때문입니다.

```ts
// ❌ status가 세 행 모두 같음 — 케이스를 가르지 않는 열
it.for([
  {method: 'post', status: HTTP_STATUS.OK},
  {method: 'put', status: HTTP_STATUS.OK},
  {method: 'patch', status: HTTP_STATUS.OK},
])('$method 요청 후 JSON을 반환한다', async ({method, status}) => { ... });

// ✅ 고정 값은 표 밖으로
it.for(['post', 'put', 'patch'] as const)('$method 요청 후 JSON을 반환한다', async (method) => {
  // status는 HTTP_STATUS.OK 상수를 그대로 참조
});

// ✅ 두 열 다 행마다 달라지면 통과
it.for([
  {method: 'post', status: HTTP_STATUS.CREATED},
  {method: 'put', status: HTTP_STATUS.OK},
])('$method 요청 후 JSON을 반환한다', async ({method, status}) => { ... });
```

## `no-restricted-syntax` — 테스트 파라미터화 `.each` 금지 — `.for` 강제

셀렉터: `it`·`test`·`describe`; call + tagged template 셀렉터, modifier chain 포함

같은 로직을 여러 케이스로 돌릴 때 `.each`(`it.each`/`test.each`/`describe.each`) 대신 `.for`(`it.for`/`test.for`/`describe.for`)를 씁니다. `.each`는 (1) 배열 인자를 spread해 넘기고 (2) Test Context에 접근할 수 없으며 (3) Jest 호환용 레거시입니다. `.for`는 Vitest 네이티브 API로 `test.for`/`it.for`는 v2, `describe.for`는 v3에서 신설됐습니다. Jest에서 마이그레이션하지 않으므로 신규 코드에 `.each`를 쓸 이유가 없습니다. [Vitest 공식](https://vitest.dev/guide/learn/writing-tests.html)이 `test.for`에 대해 "It works similarly but spreads array arguments instead of passing them as a single value, and doesn't provide access to the Test Context. It exists mainly for Jest compatibility. **Prefer `test.for` in new code.**"라고 명시합니다.

```ts
// ❌ it.each — 객체가 단일 인자로 넘어옴, Test Context 없음
it.each([{input: 42, expected: '42'}])('$input', ({input, expected}) => {
  expect(serialize(input)).toBe(expected);
});

// ✅ it.for — 객체 케이스는 콜백·타이틀 그대로, .each만 .for로
it.for([{input: 42, expected: '42'}])('$input', ({input, expected}) => {
  expect(serialize(input)).toBe(expected);
});

// ✅ describe.for — 여러 구현체에 같은 테스트 묶음
describe.for(algorithms)('정렬 알고리즘 > $name', ({fn}) => {
  it('오름차순 정렬', () => expect(fn([3, 1, 2])).toEqual([1, 2, 3]));
});
```

객체 배열이면 `.each`→`.for` 단어만 바꾸면 됩니다(타이틀 `$속성` 보간 동일). **배열 배열**(`[[a, b], ...]`)이면 `.each`의 `(a, b) =>`를 `.for`에선 `([a, b]) =>`로 구조분해합니다.

## `no-restricted-syntax` — vi.mock 문자열 인자 금지

셀렉터: `CallExpression[callee.object.name='vi'][callee.property.name=/^(mock|doMock)$/][arguments.0.type='Literal']`

`vi.mock`·`vi.doMock`의 첫 인자는 문자열 경로(`'./db'`)가 아니라 `import('./db')`로 넘깁니다. [Vitest 공식 문서](https://vitest.dev/guide/learn/mock-functions.html)도 "Always pass `import('./db.js')` rather than a plain string `'./db.js'`"라고 권장합니다. 문자열 오버로드(`mock(path: string, ...)`)는 모듈 타입을 `unknown`으로 두어 factory 반환값을 검사하지 않지만, `import()` 오버로드(`mock<T>(module: Promise<T>, ...)`)는 `T`가 채워져 factory 반환값을 실제 모듈 모양과 대조합니다.

```ts
// ❌ 문자열 — factory 반환 타입 검사 없음
vi.mock('./db', () => ({getUser: 123})); // getUser는 함수인데 숫자여도 통과

// ✅ import() — 잘못된 모킹을 tsc가 차단
vi.mock(import('./db'), () => ({getUser: vi.fn()}));
```

무엇이 실제로 갈리는지(검증):

| factory에 넣은 실수 | 문자열 `'./db'` | `import('./db')` |
| ------------------- | --------------- | ---------------- |
| 제공한 export를 틀린 타입으로 (`getUser: 123`) | 통과 | **tsc 에러** |
| 없는 export 추가 (`nope: 1`) | 통과 | 통과 (반환 타입이 `Partial` union이라 excess 검사 느슨) |
| export 누락 (`{}`) | 통과 | 통과 (`Partial`이라 모두 선택적) |

즉 타입 이득은 "제공한 가짜의 타입이 진짜와 다를 때"로 좁고, 그 외엔 IDE 파일 이동 시 경로 자동 갱신 이점입니다. 모킹한 `getUser`를 쓰는 쪽(호출 인자·반환 사용)의 타입 검사는 정적 `import` 바인딩이 유지하므로 문자열이든 `import()`든 동일하게 적용됩니다.

## `no-restricted-syntax` — MSW resolver에서 `resetHandlers()` 인자 금지

셀렉터: `CallExpression[callee.property.name='resetHandlers'][arguments.length>0]` — 전역

`server.resetHandlers()`·`worker.resetHandlers()`는 **인자 없이** 호출합니다. 인자 없는 `resetHandlers()`는 `.use()`로 추가한 runtime 핸들러만 제거하고 초기(initial) 핸들러는 남기므로, `afterEach(() => server.resetHandlers())`가 테스트 간 격리의 표준 청소가 됩니다. 반면 인자를 넘기면(`resetHandlers(...next)`) initial+runtime을 통째로 밀고 넘긴 핸들러를 **새 initial로 교체**해, 테스트마다 기반 네트워크가 바뀌어 "지금 어떤 핸들러가 유효한지" 예측성이 깨집니다. [MSW 공식 문서](https://mswjs.io/docs/best-practices/network-behavior-overrides)도 "Mutating the initial request handlers is generally not recommended because it harms the predictability of the network."라고 하며, 예외로 "It can be useful, however, in certain situations, like testing different behaviors while developing in the browser."만 인정합니다. `resetHandlers`는 MSW 전용 메서드명이라 충돌 위험이 낮아 전역(`baseRules`)으로 둡니다. 청소는 `resetHandlers()`, 새 핸들러는 `use(...)`로 나눠 씁니다.

```ts
// ❌ initial까지 밀고 넘긴 핸들러를 새 initial로 교체 — 기반 네트워크가 테스트마다 바뀜
server.resetHandlers(http.get('/products', () => HttpResponse.json([])));

// ✅ 청소는 인자 없이, 새로 얹기는 use로 분리
server.resetHandlers();
server.use(http.get('/products', () => HttpResponse.json([])));
```

## `no-restricted-syntax` — MSW predicate에 쿼리 파라미터 금지

셀렉터: `CallExpression[callee.object.name='http'][...][arguments.0.value=/[?]/]` + TemplateLiteral 변형 — 목/테스트 스코프

이 룰은 **목/핸들러 파일에만** 적용합니다(`mockFilesConfig`: `src/mocks/**`·`*.mock.*`, 테스트 파일은 `testFilesConfig`). 전역으로 잡으면 실제 앱 소스에서 오탐하기 때문입니다 — `http.get(url, cb)`는 `node:http`에서 정당하게 쓰입니다.

`http.get/post/put/delete/patch/all`의 첫 인자(predicate)에 쿼리스트링(`?...`)을 넣지 않습니다. 쿼리는 리소스 경로가 아니라 요청에 딸린 부가 데이터라, `/products?page=2`·`?page=3`은 같은 리소스 → predicate `/products` 하나로 둘 다 잡힙니다. predicate에 쿼리를 넣으면 MSW가 **런타임 경고 없이 조용히 제거**해서, 개발자는 "2페이지만 잡았다"고 착각하지만 실제로는 `/products` 전체를 잡습니다(사람이 놓치기 쉬운 지점이라 린트가 정확한 게이트). [MSW 공식 문서](https://mswjs.io/docs/http/intercepting-requests/)도 "Query parameters do not describe resource paths but rather additional data sent with the request. As such, they must not be present in the request predicate. Any query parameters accidentally included in the request predicate will automatically be removed and have no effect on the URL matching."라고 명시합니다. 쿼리 값이 필요하면 resolver에서 `new URL(request.url).searchParams.get('page')`로 읽습니다 — 역할 분담: predicate=경로로 "잡을지" 판정, resolver=쿼리 값 보고 "무엇으로 답할지".

```ts
// ❌ predicate에 쿼리 — MSW가 조용히 제거, /products 전체를 잡음
http.get('/products?page=2', () => HttpResponse.json([]));

// ✅ predicate는 경로만, 쿼리는 resolver에서 읽음
http.get('/products', ({request}) => {
  const page = new URL(request.url).searchParams.get('page');
  return HttpResponse.json(pageOf(page));
});
```

## `no-restricted-syntax` — Playwright `networkidle` 금지

셀렉터: `Property[key.name='waitUntil'][value.value='networkidle']` + `CallExpression[callee.property.name='waitForLoadState'][arguments.0.value='networkidle']` — 전역

E2E에서 "네트워크가 잠잠해질 때까지" 기다리는 `networkidle`을 쓰지 않습니다. Playwright 공식이 이 값에 **DISCOURAGED**를 붙이고 "Don't use this method for testing, rely on web assertions to assess readiness instead."라고 명시합니다([`page.goto`의 `waitUntil`](https://playwright.dev/docs/api/class-page#page-goto), [`page.waitForLoadState`의 `state`](https://playwright.dev/docs/api/class-page#page-wait-for-load-state) 양쪽 동일). 대신 검사문(assertion)이 조건을 만족할 때까지 스스로 재시도합니다 — [공식 Best Practices](https://playwright.dev/docs/best-practices)의 "By using web first assertions Playwright will wait until the expected condition is met.", "If the alert message takes half a second to appear, assertions such as `toBeVisible()` will wait and retry if needed." 타입스크립트로는 못 잡습니다(`'networkidle'`은 `WaitUntilState`·`LoadState`의 정당한 멤버라 컴파일이 통과) — 린트가 유일한 게이트입니다. 두 진입점이 모두 Playwright 전용 이름이라 충돌 위험이 낮아 전역(`baseRules`)으로 둡니다.

```ts
// ❌ 네트워크가 잠잠해지길 기다림 — 폴링·keep-alive가 있으면 타임아웃까지 매달림
await page.goto('/products', {waitUntil: 'networkidle'});
await page.waitForLoadState('networkidle');

// ✅ 기다리지 말고, 보여야 할 것이 보이는지 검사한다 (자동 재시도)
await page.goto('/products');
await expect(page.getByRole('listitem').first()).toBeVisible();
```

기본값 아닌 나머지 두 값(`domcontentloaded`·`commit`)은 공식이 금지하지 않아 **지금은 막지 않습니다**. 정당한 쓰임이 있고, 아직 이 레포에서 필요해진 사례가 없어 메시지를 제대로 쓸 근거가 없기 때문입니다. 실제로 이 옵션들을 만지고 싶어지는 상황이 생기면 그때 제약 방식을 정합니다 — 검토 재료는 `backlog` 레포 `projects/monorepo-playground/inactive/lint/playwright-goto-waituntil-restriction.md`에 있습니다.
