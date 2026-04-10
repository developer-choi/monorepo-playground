## 설정 중앙화

`eslint.config.base.mts`에 공통 규칙을 export하고, 각 워크스페이스가 import해서 `rules`에 spread합니다.

```js
// eslint.config.base.mts
export const baseRules = {
  '@typescript-eslint/no-floating-promises': 'off',
  '@typescript-eslint/no-misused-promises': ['error', {checksVoidReturn: {attributes: false}}],
  '@typescript-eslint/switch-exhaustiveness-check': 'error',
  // ...
};
```

```js
// apps/examples/eslint.config.mjs
import {baseRules} from '../../eslint.config.base.mts';

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

## 도입한 ESLint 규칙

### 수동 추가 (`eslint.config.base.mts`)

#### 1. `@typescript-eslint/no-floating-promises` (off)

await 없이 Promise를 호출하면 에러가 조용히 삼켜질 수 있습니다. 이 규칙을 켜면 `void` 키워드를 강제하는 상황이 생기므로 **비활성화**했습니다. await 누락은 코드리뷰로 잡습니다.

```typescript
// 아래 코드가 린트에 걸리지 않음 — 리뷰어가 주의
fetchData(); // await 빠뜨린 건 아닌지 확인 필요
```

#### 2. `@typescript-eslint/switch-exhaustiveness-check`

union 타입의 switch 문에서 케이스 누락을 방지합니다.

```typescript
// ❌
type Status = 'success' | 'error' | 'loading';
function getMessage(status: Status): string {
  switch (status) {
    case 'success':
      return '완료';
    case 'error':
      return '실패';
    // "loading" 케이스 누락 → undefined 반환
  }
}
```

#### 3. `@typescript-eslint/no-misused-promises` (checksVoidReturn.attributes: false)

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

#### 4. `@typescript-eslint/prefer-nullish-coalescing`

`||` 대신 `??`를 강제합니다. `||`는 `0`, `""`, `false`도 falsy로 처리합니다.

```typescript
// ❌
const count = input || 10; // input이 0이면 10이 됨

// ✅
const count = input ?? 10; // input이 null/undefined일 때만 10
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
console.log('debug:', data);

// ✅
console.error('예상치 못한 상태:', state);
```

#### 8. `@typescript-eslint/restrict-template-expressions` (allowNullish: false)

템플릿 리터럴에 `undefined`, `null`, 객체 등이 삽입되는 것을 방지합니다. 기본값은 `allowNullish: true`이므로 명시적으로 `false`로 설정해야 합니다.

```typescript
// ❌
const msg = `user: ${user.name}`; // user.name이 undefined면 "user: undefined"

// ✅
const msg = `user: ${user.name ?? '(알 수 없음)'}`;
```

#### 9. `max-params` (2)

함수 파라미터를 최대 2개로 제한합니다. 파라미터가 많으면 객체로 묶어 가독성을 높입니다.

```typescript
// ❌
function createUser(name: string, email: string, age: number) { ... }

// ✅
function createUser(params: { name: string; email: string; age: number }) { ... }
```

#### 10. `@typescript-eslint/no-explicit-any` (error)

`any`를 사용하면 타입 안전성이 무너집니다. `unknown`을 사용하고 타입 가드로 좁히세요.

```typescript
// ❌
function parse(data: any) { ... }

// ✅ catch 절
try { ... } catch (e: unknown) {
  if (e instanceof Error) console.error(e.message);
}

// ✅ 불명확한 외부 데이터
function parse(data: unknown) {
  if (typeof data === 'object' && data !== null && 'name' in data) { ... }
}
```

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

#### 12. `@typescript-eslint/ban-ts-comment`

`@ts-ignore`, `@ts-nocheck` 등의 타입 체크 우회 주석을 금지합니다. 타입 에러를 숨기면 런타임 버그로 이어집니다. 불가피한 경우 `@ts-expect-error`를 사용하면 해당 줄의 에러가 해결되었을 때 린트가 알려줍니다.

```typescript
// ❌
// @ts-ignore
const value = unsafeFunction();

// ✅ 불가피한 경우
// @ts-expect-error — 서드파티 타입 정의 미비
const value = unsafeFunction();
```

#### 13. `@typescript-eslint/naming-convention`

식별자 네이밍 컨벤션을 강제합니다. 변수/함수는 camelCase, 타입/클래스는 PascalCase, 상수는 UPPER_CASE를 사용합니다.

```typescript
// ❌
const MyVariable = 1;
type user_type = {name: string};

// ✅
const myVariable = 1;
type UserType = {name: string};
```

React 컴포넌트(PascalCase 함수/변수), Next.js 라우트 핸들러(`GET`, `POST` 등), Zod 스키마(PascalCase 변수), 구조 분해 변수(외부 API 키 이름 그대로 사용)는 예외를 허용합니다. 객체 property는 camelCase/UPPER_CASE만 허용하며, 서버 DTO 등 snake_case가 필요한 파일은 파일 단위 eslint-disable로 처리합니다.

#### 14. `curly` (all)

if/else/for/while 등 제어문에 중괄호를 반드시 사용합니다. 한 줄이라도 중괄호 없이 쓰면 나중에 줄을 추가할 때 실수할 수 있습니다.

```typescript
// ❌ curly 위반
if (disabled) return null;

// ✅ 올바른 사용
if (disabled) {
  return null;
}
```

#### 15. `no-magic-numbers`

의미 없는 숫자 리터럴 사용을 금지합니다. 숫자에 이름을 붙여 의도를 명확히 합니다. -1, 0, 1, 2는 허용합니다.

```typescript
// ❌
if (items.length > 10) { ... }
const timeout = 3000;

// ✅
const MAX_VISIBLE_ITEMS = 10;
if (items.length > MAX_VISIBLE_ITEMS) { ... }
const TIMEOUT_MS = 3000;
```

#### 16. `react/jsx-sort-props`

JSX 속성을 알파벳 순으로 정렬합니다. 콜백(on\*)은 마지막, shorthand는 먼저, key/ref는 최우선으로 배치합니다. auto-fix 지원.

```tsx
// ❌
<Input onChange={handleChange} disabled type="text" className={styles.input} />

// ✅
<Input disabled className={styles.input} type="text" onChange={handleChange} />
```

#### 17. `no-restricted-syntax` — 금지 패턴 모음

AST 셀렉터로 프로젝트에서 허용하지 않는 패턴을 일괄 금지합니다. 위반 시 `eslint-disable` + 사유 주석으로 예외를 처리합니다.

**빈 alt 속성 금지** (`JSXAttribute[name.name='alt'][value.value='']` 등 3개 셀렉터)

`<img alt="">` 처럼 빈 alt를 실수로 넣는 것을 방지합니다. `alt=""`, `alt=''`, `alt={''}`, ` alt={`} ``, `alt={""}` 5가지 패턴을 커버합니다.

```tsx
// ❌
<img alt="" src="/photo.jpg" />

// ✅
<img alt="프로필 사진" src="/photo.jpg" />

// 장식용 이미지라면 eslint-disable + 사유 주석
// eslint-disable-next-line no-restricted-syntax -- 배경 장식 이미지
<img alt="" src="/bg-pattern.png" />
```

**enum 금지** (`TSEnumDeclaration`)

TypeScript enum은 트리쉐이킹이 안 되고 역방향 매핑 등 예상치 못한 런타임 동작이 있습니다. `as const` 객체를 사용하세요.

```typescript
// ❌
enum Status {
  ACTIVE,
  INACTIVE,
}

// ✅
const STATUS = {ACTIVE: 'active', INACTIVE: 'inactive'} as const;
type Status = (typeof STATUS)[keyof typeof STATUS];
```

**`<button>` 직접 사용 금지** (`JSXOpeningElement[name.name='button']`)

`<button>`을 직접 사용하면 스타일/접근성 처리가 파편화됩니다. 공통 Button 컴포넌트를 사용하세요. Button 컴포넌트 내부 구현처럼 불가피한 경우 `eslint-disable` + 사유 주석을 남깁니다.

```tsx
// ❌
<button onClick={handleClick}>저장</button>;

// ✅
import {Button} from '@monorepo-playground/design-system';
<Button onClick={handleClick}>저장</Button>;
```

**인라인 스타일 금지** (`JSXAttribute[name.name='style']`)

인라인 스타일은 CSS Modules로 분리합니다. 동적 값, CSS 변수 주입, 스켈레톤은 예외로 허용하며, 이 외의 경우 `eslint-disable` + 사유 주석으로 처리합니다.

```tsx
// ❌
<div style={{color: 'red', marginTop: 8}}>텍스트</div>;

// ✅
import styles from './Component.module.scss';
<div className={styles.title}>텍스트</div>;
```

**SVG 직접 작성 금지** (`JSXElement > JSXOpeningElement[name.name='svg']`)

SVG를 JSX에 직접 작성하면 번들 크기가 커지고 재사용이 어렵습니다. 아이콘 컴포넌트나 SVG 파일로 분리하세요.

```tsx
// ❌
<svg width="24" height="24">
  <path d="..." />
</svg>;

// ✅
import {CheckIcon} from '@radix-ui/react-icons';
<CheckIcon height={24} width={24} />;
```

### 워크스페이스별 추가 규칙

`baseRules` 외에 특정 워크스페이스에서만 추가한 규칙입니다.

#### `@typescript-eslint/no-deprecated` (error) — examples

deprecated로 표시된 API 사용을 에러로 잡습니다. TypeScript가 취소선으로 보여주긴 하지만 시각적 힌트일 뿐이므로, 린트가 강제합니다.

```typescript
// ❌
/** @deprecated use fetchV2 instead */
function fetchData() { ... }
fetchData();  // deprecated API 사용

// ✅
fetchV2();
```

#### `react-hooks/error-boundaries` (off) — examples

React 19의 ErrorBoundary 관련 린트 규칙을 비활성화합니다.

### `recommendedTypeChecked` 프리셋

`recommendedTypeChecked` 프리셋에 포함된 규칙들입니다. `recommended`에서 업그레이드하면 활성화되며, TypeScript 컴파일러의 타입 정보를 활용합니다.

#### 18. `@typescript-eslint/no-unsafe-assignment`

`any` 타입 값이 변수에 할당되는 것을 방지합니다. `any`가 한 번 변수에 들어가면 타입 체크가 무력화됩니다.

```typescript
// ❌
const data = JSON.parse(response); // data는 any

// ✅
const raw: unknown = JSON.parse(response);
const data = schema.parse(raw); // 검증 후 사용
```

#### 19. `@typescript-eslint/no-unsafe-call`

`any` 타입 값을 함수처럼 호출하는 것을 방지합니다.

```typescript
// ❌
const fn = JSON.parse(str);
fn(); // any를 함수로 호출

// ✅
const fn: () => void = validateAndParse(str);
fn();
```

#### 20. `@typescript-eslint/no-unsafe-member-access`

`any` 타입 값에서 프로퍼티에 접근하는 것을 방지합니다.

```typescript
// ❌
const data = JSON.parse(str);
const name = data.user.name; // any 체이닝

// ✅
const data: UserResponse = schema.parse(JSON.parse(str));
const name = data.user.name;
```

#### 21. `@typescript-eslint/no-unsafe-return`

타입이 있는 함수에서 `any` 값을 반환하는 것을 방지합니다.

```typescript
// ❌
function getConfig(): AppConfig {
  return JSON.parse(str); // any를 AppConfig로 반환
}

// ✅
function getConfig(): AppConfig {
  return configSchema.parse(JSON.parse(str));
}
```

#### 22. `@typescript-eslint/no-unsafe-argument`

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

#### 23. `@typescript-eslint/await-thenable`

Promise가 아닌 값에 `await`를 사용하는 것을 방지합니다.

```typescript
// ❌
const value = 42;
const result = await value; // 의미 없는 await

// ✅
const result = value;
```

#### 24. `@typescript-eslint/require-await`

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

#### 25. `@typescript-eslint/no-base-to-string`

`toString()`이 정의되지 않은 객체를 문자열로 변환하면 `[object Object]`가 됩니다. 이를 방지합니다.

```typescript
// ❌
const obj = {name: 'test'};
console.error(`result: ${obj}`); // "result: [object Object]"

// ✅
console.error(`result: ${JSON.stringify(obj)}`);
```

이 외에 `no-unsafe-enum-comparison`, `no-redundant-type-constituents`, `restrict-plus-operands`, `no-unnecessary-type-assertion` 등도 프리셋에 포함되어 있습니다.
