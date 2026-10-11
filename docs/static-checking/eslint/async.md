비동기·Promise를 다루는 규칙입니다. 따로 적지 않은 규칙은 `eslint.config.base.mts`의 `baseRules`에 있습니다.

## `@typescript-eslint/no-floating-promises` (앱 소스 off, 테스트 파일 error)

Promise를 await, return, `.then()` 없이 버리면(floating) 에러가 조용히 삼켜질 수 있습니다. 앱 소스에서는 의도적으로 결과를 무시하는 호출에 `void` 키워드를 강제하므로 **비활성화**합니다 — `void`를 코드에 쓰지 않는다는 방침이라, 이 룰을 켜면 그 방침과 충돌합니다. 앱 소스의 await 누락은 코드리뷰로 잡습니다. `return promise`에서 await를 강제하는 것은 이 룰이 아니라 `return-await` 룰입니다.

```typescript
// 앱 소스 — 린트에 걸리지 않음, 리뷰어가 주의
fetchData(); // Promise를 어디에도 안 넘기고 버림
```

**테스트 파일(`*.test.*`·`*.spec.*`)에서는 `error`로 되살립니다**(`testFilesConfig`). 테스트에서 `await`를 빠뜨리면 동작이 반영되기 전에 다음 검사가 돌아 조용히 잘못된 결과가 나오는데, 이건 리뷰로 잡기 어려운 부류입니다. 반면 테스트 코드는 Promise를 의도적으로 버리는 일이 없어 `void` 강제가 발생하지 않습니다 — 도입 시점의 테스트 파일 19개에서 위반이 0건이었고, 기존 코드를 한 줄도 고치지 않았습니다.

Playwright 공식 [Best Practices](https://playwright.dev/docs/best-practices)의 "Lint your tests"도 같은 룰을 지목합니다.

> Use [`@typescript-eslint/no-floating-promises`](https://typescript-eslint.io/rules/no-floating-promises/) [ESLint](https://eslint.org) rule to make sure there are no missing awaits before the asynchronous calls to the Playwright API.

```typescript
// ❌ await 누락 — 클릭이 반영되기 전에 다음 줄이 실행됨
user.click(screen.getByRole('button'));
screen.findByRole('alert'); // findBy*는 Promise 반환 — 아무것도 기다리지 않음

// ✅
await user.click(screen.getByRole('button'));
expect(await screen.findByRole('alert')).toBeInTheDocument();
```

## `@typescript-eslint/return-await` (in-try-catch)

try/catch 안에서 `return promise`하면 rejection이 catch를 우회합니다. `return await`를 강제하여 이를 방지합니다. try/catch 밖에서는 `return await`를 금지합니다 (동작 차이 없이 불필요한 microtick만 추가).

```typescript
// ❌ try/catch 안에서 await 누락 — rejection이 catch를 우회
async function fetchData() {
  try {
    return fetch('/api');
  } catch (e) {
    // fetch가 reject되어도 여기 안 들어옴
  }
}

// ✅ try/catch 안에서 await — rejection이 catch에 포착
async function fetchData() {
  try {
    return await fetch('/api');
  } catch (e) {
    // fetch가 reject되면 여기서 잡힘
  }
}
```

## `@typescript-eslint/no-misused-promises` (checksVoidReturn.attributes: false)

두 가지를 검사합니다:

- **checksConditionals** (유지): Promise 객체를 조건문에 넣는 실수를 방지합니다.
- **checksVoidReturn.attributes** (off): JSX 이벤트 핸들러에 async 함수를 전달하는 패턴을 허용합니다. 켜두면 `void` 래핑이 강제되므로 비활성화했습니다.

```typescript
// ❌ checksConditionals — Promise 객체는 항상 truthy
if (fetchData()) { ... }

// ✅
if (await fetchData()) { ... }

// ✅ checksVoidReturn.attributes off — void 래핑 없이 사용 가능
<form onSubmit={handleSubmit(onSubmit)} />
```

## `@typescript-eslint/await-thenable`

설정 위치: `recommendedTypeChecked` 프리셋 (워크스페이스별 config가 켬)

Promise가 아닌 값에 `await`를 사용하는 것을 방지합니다.

```typescript
// ❌
const value = 42;
const result = await value; // 의미 없는 await

// ✅
const result = value;
```

## `@typescript-eslint/require-await`

설정 위치: `recommendedTypeChecked` 프리셋 (워크스페이스별 config가 켬)

`async` 함수 내에 `await`가 없으면 에러로 잡습니다.

```typescript
// ❌
async function getData() {
  return cachedData; // await 없음 → async 불필요
}

// ✅
function getData() {
  return cachedData;
}
```
