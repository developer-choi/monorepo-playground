이름 짓기와 코드 모양을 정하는 규칙입니다. 따로 적지 않은 규칙은 `eslint.config.base.mts`의 `baseRules`에 있습니다.

## `@typescript-eslint/naming-convention`

식별자 네이밍 컨벤션을 강제합니다. 변수는 camelCase·PascalCase·UPPER_CASE, 함수는 camelCase·PascalCase, 타입/클래스는 PascalCase를 사용합니다. snake_case 같은 그 밖의 형식을 막습니다.

```typescript
// ❌
const my_variable = 1;
type user_type = {name: string};

// ✅
const myVariable = 1;
type UserType = {name: string};
```

변수에는 PascalCase를 허용합니다. JSX에서 대문자로 렌더할 값을 변수에 담는 일(`memo`로 감싼 컴포넌트, `asChild`로 고른 `Slot.Root | 'button'`)이 PascalCase 값 변수(`const MaxCount = 10`)를 실수로 쓰는 일보다 잦아서, 막으면 억제 주석이 더 많이 생기기 때문입니다.

```tsx
// ✅ 억제 주석 없이 통과
const SlowList = memo(function SlowList({text}: {text: string}) { ... });
const Comp: ElementType = asChild ? Slot.Root : 'button';
```

예전에는 변수 PascalCase를 막고 함수 타입(`types: ['function']`)만 열었습니다. 그러면 `ElementType`처럼 컴포넌트와 태그 문자열의 합집합인 값이 예외에 안 걸려 억제 주석이 필요했습니다. `function`은 "`Function | null | undefined`에 대입 가능한 타입"이라 문자열이 섞이면 조건이 깨집니다.

> 출처: https://typescript-eslint.io/rules/naming-convention/
>
> "`function` matches any type assignable to `Function | null | undefined`"

Next.js 라우트 핸들러(`GET`, `POST` 등)와 구조 분해 변수(외부 API 키 이름 그대로 사용)도 예외입니다. 다만 구조 분해 예외는 **이름을 그대로 받을 때만** 적용되고, 이름을 바꿔 받으면 해당하지 않습니다 — 그런 경우는 일반 변수 규칙으로 판정합니다.

> 출처: https://typescript-eslint.io/rules/naming-convention/
>
> "`destructured` - matches a variable declared via an object destructuring pattern (`const {x, z = 2}`). Note that this does not match renamed destructured properties (`const {x: y, a: b = 2}`)."

객체 property는 camelCase/UPPER_CASE만 허용하며, 서버 DTO 등 snake_case가 필요한 파일은 파일 단위 eslint-disable로 처리합니다.

따옴표가 **필수**인 이름(하이픈·공백 등이 들어가 식별자로 쓸 수 없는 이름)은 `requiresQuotes` modifier + `format: null`로 검사에서 면제합니다. `'Content-Type'` 같은 HTTP 표준 헤더는 우리가 이름을 정할 수 없는데, 예외가 없으면 헤더 리터럴마다 eslint-disable을 달아야 합니다(채용과제에서 실제 발생).

```typescript
// ✅ 통과 — 따옴표가 필수라 식별자로 쓸 수 없는 이름
const headers = {'Content-Type': 'application/json'};

// ❌ 여전히 위반 — 따옴표 없이 쓸 수 있는데 snake_case를 택한 경우
const dto = {post_title: 'a'};
```

선택자 목록은 [typescript-eslint 공식 예시](https://typescript-eslint.io/rules/naming-convention/)를 그대로 따릅니다("use the `requiresQuotes` modifier to match any property name that _requires_ quoting, and use `format: null` to ignore the name"). 이 예외는 **이름을 우리가 못 정하는 경우**만 열어주므로, 서버 DTO의 snake_case(`post_title` 등)는 따옴표 없이 쓸 수 있어 그대로 걸리고 파일 단위 eslint-disable로 계속 처리합니다.

## `id-length` (min: 2)

1글자 식별자를 금지합니다. 예외 없이 모든 변수, 파라미터, 프로퍼티에 2글자 이상을 요구합니다.

```typescript
// ❌
const e = event.target;
array.forEach((v) => console.log(v));
array.sort((a, b) => a - b);
for (let i = 0; i < 10; i++) { ... }

// ✅
const target = event.target;
array.forEach((value) => console.log(value));
array.sort((left, right) => left - right);
for (let index = 0; index < 10; index++) { ... }
```

## `id-denylist` (`['Props', 'State']`)

`Props`, `State`를 식별자(interface/type/변수) 이름으로 단독 사용하는 것을 금지합니다. 컴포넌트별로 prefix를 붙여 `ButtonProps`, `BoardFormProps`처럼 사용하도록 강제합니다.

```typescript
// ❌
interface Props { onClick: () => void; }
type State = {value: string};

// ✅
interface ButtonProps { onClick: () => void; }
type FormState = {value: string};
```

같은 모듈 안에서 컴포넌트 이름을 prefix로 붙이면 export 시 충돌이 없고, IDE에서 컴포넌트 따라 찾기가 쉽습니다.

## `@typescript-eslint/no-unused-vars` (error)

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

## `no-console` (allow: warn, error)

`console.log`가 프로덕션에 유출되는 것을 방지합니다. `console.warn`과 `console.error`는 허용합니다.

```typescript
// ❌
console.log('debug:', data);

// ✅
console.error('예상치 못한 상태:', state);
```

## `max-params` (2)

함수 파라미터를 최대 2개로 제한합니다. 파라미터가 많으면 객체로 묶어 가독성을 높입니다.

```typescript
// ❌
function createUser(name: string, email: string, age: number) { ... }

// ✅
function createUser(params: { name: string; email: string; age: number }) { ... }
```

## `curly` (all)

if/else/for/while 등 제어문에 중괄호를 반드시 사용합니다. 한 줄이라도 중괄호 없이 쓰면 나중에 줄을 추가할 때 실수할 수 있습니다.

```typescript
// ❌ curly 위반
if (disabled) return null;

// ✅ 올바른 사용
if (disabled) {
  return null;
}
```

## `no-magic-numbers`

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

## `@typescript-eslint/parameter-properties` (error)

constructor 파라미터에 접근 제한자를 붙여 필드를 암묵적으로 선언하는 패턴을 금지합니다. 클래스 필드를 명시적으로 선언해야 어떤 프로퍼티가 있는지 한눈에 파악할 수 있습니다.

```typescript
// ❌
class ApiClient {
  constructor(protected readonly baseUrl: string) {}
}

// ✅
class ApiClient {
  protected readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }
}
```
