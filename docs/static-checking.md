## 배경

정적 분석(ESLint + tsconfig)으로 코드 품질 안전망을 구축합니다.

버그를 줄이려면 에러를 잘 처리하는 것도 중요하지만, 애초에 에러가 발생하지 않도록 예방하는 것이 더 중요합니다. 예방 수단을 도입 비용이 저렴한 순서로 정리하면:

1. **정적 분석 (린트, 타입 체크)** ← 이 문서의 범위
2. 테스트 코드
3. AI 코드 리뷰

이 안전망은 AI 개발 생산성과도 직결됩니다. AI가 작성한 코드의 양이 늘수록 사람이 리뷰해야 할 양도 늘어나는데, 정적 분석이 자동으로 걸러주면 리뷰어는 로직과 설계에 집중할 수 있습니다. AI가 아래와 같은 코드를 작성하더라도 커밋 시점에 자동으로 차단됩니다:

```typescript
fetchData();                        // await 없이 Promise 호출 → 에러가 조용히 삼켜짐
const data = JSON.parse(response);  // any가 조용히 퍼져나감
const count = input || 10;          // input이 0이면 10이 됨
const msg = `user: ${user.name}`;   // undefined면 "user: undefined"
```

## 설정 중앙화

### tsconfig

`tsconfig.base.json`을 루트에 생성하고, 각 워크스페이스의 tsconfig이 `extends`로 상속합니다.

```jsonc
// tsconfig.base.json
{
  "compilerOptions": {
    "strict": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    // ...
  }
}
```

```jsonc
// apps/examples/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  // 워크스페이스별 추가 옵션만 작성
}
```

### ESLint

`eslint.config.base.mts`에 공통 규칙을 export하고, 각 워크스페이스가 import해서 `rules`에 spread합니다.

```js
// eslint.config.base.mts
export const baseRules = {
  '@typescript-eslint/no-floating-promises': 'error',
  '@typescript-eslint/switch-exhaustiveness-check': 'error',
  // ...
};
```

```js
// apps/examples/eslint.config.mjs
import { baseRules } from '../../eslint.config.base.mts';

export default defineConfig([
  ...tseslint.configs.recommendedTypeChecked,
  {
    rules: {
      ...baseRules,
      // 워크스페이스별 추가 규칙
    },
  },
]);
```

프리셋(`recommendedTypeChecked`)은 `parserOptions.projectService`가 필요하므로 워크스페이스별로 설정합니다.

## 2단계 검증 구조

### 왜 2단계인가?

커밋할 때마다 전체 린트 + 타입 체크를 돌리면 느립니다. 커밋 시점에는 변경된 파일 위주로 빠르게 검사하고, 푸시 전에 전체를 돌려 보완합니다.

| 시점 | 스크립트 | 내용 |
|------|---------|------|
| pre-commit | `test-staged` | `lint-staged && turbo check-types` |
| pre-push | `test-all` | `turbo check-types && turbo lint` |

### lint-staged — staged 파일만 린트

모노레포에서는 워크스페이스별로 eslint config 경로가 다르므로, lint-staged 패턴을 워크스페이스별로 나눠 `--config`를 명시합니다.

```json
{
  "lint-staged": {
    "apps/examples/**/*.{ts,tsx}": "eslint --fix --config apps/examples/eslint.config.mjs",
    "packages/design-system/**/*.{ts,tsx}": "eslint --fix --config packages/design-system/eslint.config.js",
    "packages/recruitment/**/*.{ts,tsx}": "eslint --fix --config packages/recruitment/eslint.config.js"
  }
}
```

### turbo check-types — 전체 타입 체크

tsc는 파일 단위 실행이 불가능하므로, `test-staged`에서도 전체 타입 체크를 수행합니다. `turbo check-types`는 각 워크스페이스의 `tsc --noEmit`을 병렬로 실행하며, 변경이 없으면 캐시를 활용합니다.

## 도입한 규칙 목록

### ESLint — 수동 추가 (`eslint.config.base.mts`)

#### 1. `@typescript-eslint/no-floating-promises`

await 없이 Promise를 호출하면 에러가 조용히 삼켜집니다.

```typescript
// ❌
fetchData();  // 에러 발생해도 아무도 모름

// ✅
await fetchData();
// 또는
void fetchData();  // 의도적으로 무시할 때
```

#### 2. `@typescript-eslint/switch-exhaustiveness-check`

union 타입의 switch 문에서 케이스 누락을 방지합니다.

```typescript
// ❌
type Status = "success" | "error" | "loading";
function getMessage(status: Status): string {
  switch (status) {
    case "success": return "완료";
    case "error": return "실패";
    // "loading" 케이스 누락 → undefined 반환
  }
}
```

#### 3. `@typescript-eslint/no-misused-promises`

void를 기대하는 자리에 async 함수를 전달하는 것을 방지합니다.

```typescript
// ❌
<button onClick={async () => { await submitForm(); }} />

// ✅
<button onClick={() => { void submitForm(); }} />
```

#### 4. `@typescript-eslint/prefer-nullish-coalescing`

`||` 대신 `??`를 강제합니다. `||`는 `0`, `""`, `false`도 falsy로 처리합니다.

```typescript
// ❌
const count = input || 10;  // input이 0이면 10이 됨

// ✅
const count = input ?? 10;  // input이 null/undefined일 때만 10
```

#### 5. `@typescript-eslint/no-unnecessary-condition`

타입상 항상 true이거나 항상 false인 조건을 감지합니다.

```typescript
// ❌
const file = formData.get("image") as File;
if (!file) { ... }  // as File로 단언했으므로 항상 truthy → 죽은 코드
```

#### 6. `eqeqeq` (always)

`==` / `!=` 사용을 금지하고 `===` / `!==`를 강제합니다.

```typescript
// ❌
if (value == null) { ... }   // undefined도 매칭 — 의도적이어도 금지

// ✅
if (value === null || value === undefined) { ... }
```

#### 7. `no-console` (allow: warn, error)

`console.log`가 프로덕션에 유출되는 것을 방지합니다. `console.warn`과 `console.error`는 허용합니다.

```typescript
// ❌
console.log("debug:", data);

// ✅
console.error("예상치 못한 상태:", state);
```

#### 8. `@typescript-eslint/restrict-template-expressions` (allowNullish: false)

템플릿 리터럴에 `undefined`, `null`, 객체 등이 삽입되는 것을 방지합니다. 기본값은 `allowNullish: true`이므로 명시적으로 `false`로 설정해야 합니다.

```typescript
// ❌
const msg = `user: ${user.name}`;  // user.name이 undefined면 "user: undefined"

// ✅
const msg = `user: ${user.name ?? "(알 수 없음)"}`;
```

#### 9. `max-params` (2)

함수 파라미터를 최대 2개로 제한합니다. 파라미터가 많으면 객체로 묶어 가독성을 높입니다.

```typescript
// ❌
function createUser(name: string, email: string, age: number) { ... }

// ✅
function createUser(params: { name: string; email: string; age: number }) { ... }
```

#### 10. `@typescript-eslint/no-explicit-any` (off)

any 사용을 허용합니다. 다만 아래 `no-unsafe-*` 규칙들이 any의 전파를 차단하므로, any를 선언하더라도 그것이 다른 변수/함수/반환값으로 퍼지는 것은 막힙니다.

#### 11. `@typescript-eslint/no-unused-vars` (error)

미사용 변수, 함수, import, 파라미터를 전부 차단합니다. `_` 접두사는 의도적 미사용으로 허용합니다.

```typescript
// ❌
import { unused } from './module';
const temp = 42;
function helper() { ... }  // 호출되지 않음

// ✅
import { used } from './module';
function onClick(_event: MouseEvent) { ... }  // _로 시작하면 허용
```

### ESLint — `recommendedTypeChecked` 프리셋

`recommendedTypeChecked` 프리셋에 포함된 규칙들입니다. `recommended`에서 업그레이드하면 활성화되며, TypeScript 컴파일러의 타입 정보를 활용합니다.

#### 12. `@typescript-eslint/no-unsafe-assignment`

`any` 타입 값이 변수에 할당되는 것을 방지합니다. `any`가 한 번 변수에 들어가면 타입 체크가 무력화됩니다.

```typescript
// ❌
const data = JSON.parse(response);  // data는 any

// ✅
const raw: unknown = JSON.parse(response);
const data = schema.parse(raw);  // 검증 후 사용
```

#### 13. `@typescript-eslint/no-unsafe-call`

`any` 타입 값을 함수처럼 호출하는 것을 방지합니다.

```typescript
// ❌
const fn = JSON.parse(str);
fn();  // any를 함수로 호출

// ✅
const fn: (() => void) = validateAndParse(str);
fn();
```

#### 14. `@typescript-eslint/no-unsafe-member-access`

`any` 타입 값에서 프로퍼티에 접근하는 것을 방지합니다.

```typescript
// ❌
const data = JSON.parse(str);
const name = data.user.name;  // any 체이닝

// ✅
const data: UserResponse = schema.parse(JSON.parse(str));
const name = data.user.name;
```

#### 15. `@typescript-eslint/no-unsafe-return`

타입이 있는 함수에서 `any` 값을 반환하는 것을 방지합니다.

```typescript
// ❌
function getConfig(): AppConfig {
  return JSON.parse(str);  // any를 AppConfig로 반환
}

// ✅
function getConfig(): AppConfig {
  return configSchema.parse(JSON.parse(str));
}
```

#### 16. `@typescript-eslint/no-unsafe-argument`

타입이 있는 파라미터에 `any` 값을 전달하는 것을 방지합니다.

```typescript
// ❌
function greet(name: string) { ... }
const data = JSON.parse(str);
greet(data.name);  // any를 string에 전달

// ✅
const data: { name: string } = schema.parse(JSON.parse(str));
greet(data.name);
```

#### 17. `@typescript-eslint/await-thenable`

Promise가 아닌 값에 `await`를 사용하는 것을 방지합니다.

```typescript
// ❌
const value = 42;
const result = await value;  // 의미 없는 await

// ✅
const result = value;
```

#### 18. `@typescript-eslint/require-await`

`async` 함수 내에 `await`가 없으면 에러로 잡습니다.

```typescript
// ❌
async function getData() {
  return cachedData;  // await 없음 → async 불필요
}

// ✅
function getData() {
  return cachedData;
}
```

#### 19. `@typescript-eslint/no-base-to-string`

`toString()`이 정의되지 않은 객체를 문자열로 변환하면 `[object Object]`가 됩니다. 이를 방지합니다.

```typescript
// ❌
const obj = { name: "test" };
console.error(`result: ${obj}`);  // "result: [object Object]"

// ✅
console.error(`result: ${JSON.stringify(obj)}`);
```

이 외에 `no-unsafe-enum-comparison`, `no-redundant-type-constituents`, `restrict-plus-operands`, `no-unnecessary-type-assertion` 등도 프리셋에 포함되어 있습니다.

### tsconfig

#### 20. `noUncheckedIndexedAccess`

배열이나 객체의 인덱스 접근 시 반환 타입에 `| undefined`를 자동으로 추가합니다.

```typescript
// ❌ (옵션 OFF 시)
const users = ["Alice", "Bob"];
const first: string = users[5];  // undefined인데 string으로 통과

// ✅ (옵션 ON 시)
const first = users[5];  // string | undefined
if (first) {
  console.error(first.toUpperCase());
}
```

#### 21. `noFallthroughCasesInSwitch`

switch 문에서 break/return 없이 다음 케이스로 떨어지는 것을 방지합니다.

```typescript
// ❌
switch (status) {
  case "a":
    doA();
  // break 없이 case "b"로 떨어짐
  case "b":
    doB();
    break;
}

// ✅
switch (status) {
  case "a":
    doA();
    break;
  case "b":
    doB();
    break;
}
```
