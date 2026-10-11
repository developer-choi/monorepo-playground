타입 안전성과 조건식 실수를 잡는 규칙입니다. 따로 적지 않은 규칙은 `eslint.config.base.mts`의 `baseRules`에 있습니다. 제목 끝에 `— examples`가 붙은 규칙은 `apps/examples` config에만 있습니다.

`no-restricted-syntax` 항목은 [eslint.md](../eslint.md#no-restricted-syntax-항목)의 공통 처리(위반 시 `eslint-disable` + 사유 주석)를 따릅니다.

## `@typescript-eslint/no-explicit-any` (error)

`any`를 사용하면 타입 안전성이 무너집니다. `unknown`을 사용하고 타입 가드로 좁히세요.

```typescript
// ❌
function parse(data: any) { ... }

// ✅ catch 절 — 어노테이션 없이도 TS 4.4+에서 unknown
try { ... } catch (error) {
  if (error instanceof Error) console.error(error.message);
}

// ✅ 불명확한 외부 데이터
function parse(data: unknown) {
  if (typeof data === 'object' && data !== null && 'name' in data) { ... }
}
```

## `@typescript-eslint/ban-ts-comment`

`@ts-ignore`, `@ts-nocheck` 등의 타입 체크 우회 주석을 금지합니다. 타입 에러를 숨기면 런타임 버그로 이어집니다. 불가피한 경우 `@ts-expect-error`를 사용하면 해당 줄의 에러가 해결되었을 때 린트가 알려줍니다.

```typescript
// ❌
// @ts-ignore
const value = unsafeFunction();

// ✅ 불가피한 경우
// @ts-expect-error — 서드파티 타입 정의 미비
const value = unsafeFunction();
```

## `@typescript-eslint/switch-exhaustiveness-check`

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

## `@typescript-eslint/prefer-nullish-coalescing`

`||` 대신 `??`를 강제합니다. `||`는 `0`, `""`, `false`도 falsy로 처리합니다.

```typescript
// ❌
const count = input || 10; // input이 0이면 10이 됨

// ✅
const count = input ?? 10; // input이 null/undefined일 때만 10
```

## `@typescript-eslint/no-unnecessary-condition`

타입상 항상 true이거나 항상 false인 조건을 감지합니다.

```typescript
// ❌
const file = formData.get("image") as File;
if (!file) { ... }  // as File로 단언했으므로 항상 truthy → 죽은 코드
```

## `eqeqeq` (always)

`==` / `!=` 사용을 금지하고 `===` / `!==`를 강제합니다.

```typescript
// ❌
if (value == null) { ... }   // undefined도 매칭 — 의도적이어도 금지

// ✅
if (value === null || value === undefined) { ... }
```

## `@typescript-eslint/restrict-template-expressions` (allowNullish: false)

템플릿 리터럴에 `undefined`, `null`, 객체 등이 삽입되는 것을 방지합니다. 기본값은 `allowNullish: true`이므로 명시적으로 `false`로 설정해야 합니다.

```typescript
// ❌
const msg = `user: ${user.name}`; // user.name이 undefined면 "user: undefined"

// ✅
const msg = `user: ${user.name ?? '(알 수 없음)'}`;
```

## `no-restricted-syntax` — enum 금지

셀렉터: `TSEnumDeclaration`

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

## `no-restricted-syntax` — catch 변수 타입 어노테이션 금지

셀렉터: `CatchClause > Identifier.param[typeAnnotation]`

TypeScript 4.4의 `useUnknownInCatchVariables`(strict에 포함)가 켜져 있으면 catch 변수는 명시하지 않아도 `unknown`이 기본입니다. `: unknown`은 잉여이고 `: any`는 타입 안전성을 무너뜨리므로 둘 다 금지합니다.

```typescript
// ❌
try { ... } catch (error: unknown) { ... }
try { ... } catch (error: any) { ... }

// ✅
try { ... } catch (error) {
  if (error instanceof Error) console.error(error.message);
}
```

## `@typescript-eslint/no-deprecated` (error) — examples

deprecated로 표시된 API 사용을 에러로 잡습니다. TypeScript가 취소선으로 보여주긴 하지만 시각적 힌트일 뿐이므로, 린트가 강제합니다.

```typescript
// ❌
/** @deprecated use fetchV2 instead */
function fetchData() { ... }
fetchData();  // deprecated API 사용

// ✅
fetchV2();
```

## `@typescript-eslint/no-unsafe-assignment`

설정 위치: `recommendedTypeChecked` 프리셋 (워크스페이스별 config가 켬)

`any` 타입 값이 변수에 할당되는 것을 방지합니다. `any`가 한 번 변수에 들어가면 타입 체크가 무력화됩니다.

```typescript
// ❌
const data = JSON.parse(response); // data는 any

// ✅
const raw: unknown = JSON.parse(response);
const data = schema.parse(raw); // 검증 후 사용
```

테스트에서 `expect.objectContaining`을 **자기 자신 안에 중첩하면** 이 룰에 걸립니다. vitest의 타입 정의가 반환을 `any`로 고정하고 있어(`objectContaining: <T = any>(expected: DeeplyAllowMatchers<T>) => any`), 안쪽 호출의 `any`가 바깥 객체 리터럴의 속성 자리에 대입되기 때문입니다. 제네릭 인자를 줘도 반환 타입에는 `T`가 쓰이지 않아 해소되지 않습니다. upstream은 이 이슈를 `not planned`로 닫았습니다(<https://github.com/vitest-dev/vitest/issues/1855>).

겹을 하나로 줄이면 됩니다. 한 겹이면 `any`는 맨 바깥에만 남고, 받는 쪽인 `toHaveBeenCalledWith: <E extends any[]>(...args: E) => void`도 `any`라 룰이 물지 않습니다.

```tsx
// ❌ 중첩 — 안쪽 any가 target 속성에 대입된다
expect(onChange).toHaveBeenCalledWith(
  expect.objectContaining({target: expect.objectContaining({value: 'apple'})}),
);

// ✅ 한 겹 — 클릭한 엘리먼트를 변수로 잡아 직접 대조한다
const appleRadio = screen.getByRole('radio', {name: '사과'});
await user.click(appleRadio);

expect(appleRadio).toHaveAttribute('value', 'apple');
expect(onChange).toHaveBeenCalledWith(expect.objectContaining({target: appleRadio}));
```

값 확인에 `toHaveValue`는 못 씁니다 — jest-dom이 `input[type=radio]`와 `input[type=checkbox]`를 대상에서 제외합니다(<https://github.com/testing-library/jest-dom#tohavevalue>).

> It accepts `<input>`, `<select>` and `<textarea>` elements with the exception of `<input type="checkbox">` and `<input type="radio">`

2026-08-04 이전에는 이 한 줄 때문에 `packages/design-system`과 vite 템플릿에서 **테스트 파일 전체**에 이 룰을 `off`로 내려두고 있었습니다. 위 형태로 바꾸면서 두 off 블록을 모두 걷어냈습니다.

## `@typescript-eslint/no-unsafe-call`

설정 위치: `recommendedTypeChecked` 프리셋 (워크스페이스별 config가 켬)

`any` 타입 값을 함수처럼 호출하는 것을 방지합니다.

```typescript
// ❌
const fn = JSON.parse(str);
fn(); // any를 함수로 호출

// ✅
const fn: () => void = validateAndParse(str);
fn();
```

## `@typescript-eslint/no-unsafe-member-access`

설정 위치: `recommendedTypeChecked` 프리셋 (워크스페이스별 config가 켬)

`any` 타입 값에서 프로퍼티에 접근하는 것을 방지합니다.

```typescript
// ❌
const data = JSON.parse(str);
const name = data.user.name; // any 체이닝

// ✅
const data: UserResponse = schema.parse(JSON.parse(str));
const name = data.user.name;
```

## `@typescript-eslint/no-unsafe-return`

설정 위치: `recommendedTypeChecked` 프리셋 (워크스페이스별 config가 켬)

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

## `@typescript-eslint/no-unsafe-argument`

설정 위치: `recommendedTypeChecked` 프리셋 (워크스페이스별 config가 켬)

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

## `@typescript-eslint/no-base-to-string`

설정 위치: `recommendedTypeChecked` 프리셋 (워크스페이스별 config가 켬)

`toString()`이 정의되지 않은 객체를 문자열로 변환하면 `[object Object]`가 됩니다. 이를 방지합니다.

```typescript
// ❌
const obj = {name: 'test'};
console.error(`result: ${obj}`); // "result: [object Object]"

// ✅
console.error(`result: ${JSON.stringify(obj)}`);
```

## 그 밖의 `recommendedTypeChecked` 프리셋 규칙

이 외에 `no-unsafe-enum-comparison`, `no-redundant-type-constituents`, `restrict-plus-operands`, `no-unnecessary-type-assertion` 등도 프리셋에 포함되어 있습니다.
