## 설정 중앙화

`eslint.config.base.mts`에 공통 규칙을 export하고, 각 워크스페이스가 import해서 `rules`에 spread합니다.

```js
// eslint.config.base.mts
export const baseRules = {
  '@typescript-eslint/no-floating-promises': 'off',
  '@typescript-eslint/return-await': ['error', 'in-try-catch'],
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

## 경고도 차단

ESLint는 `--max-warnings 0` 옵션으로 실행합니다 (워크스페이스별 `lint` 스크립트, lint-staged 모두). severity가 `'warn'`인 규칙도 실패로 간주되어 푸시·커밋을 막습니다. 새 규칙은 처음부터 `'error'`로 도입하고, `'warn'`으로 둘 이유가 있다면 [gradual-migration.md](gradual-migration.md)의 file-level disable + hook 패턴으로 대체합니다.

## 도입한 ESLint 규칙

### 수동 추가 (`eslint.config.base.mts`)

#### `@typescript-eslint/no-floating-promises` (off)

Promise를 await, return, `.then()` 없이 버리면(floating) 에러가 조용히 삼켜질 수 있습니다. 이 규칙을 켜면 의도적으로 결과를 무시하는 호출에 `void` 키워드를 강제하므로 **비활성화**했습니다. await 누락은 코드리뷰로 잡습니다. `return promise`에서 await를 강제하는 것은 이 룰이 아니라 `return-await` 룰입니다.

```typescript
// 아래 코드가 린트에 걸리지 않음 — 리뷰어가 주의
fetchData(); // Promise를 어디에도 안 넘기고 버림
```

#### `@typescript-eslint/return-await` (in-try-catch)

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

#### `@typescript-eslint/switch-exhaustiveness-check`

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

#### `@typescript-eslint/no-misused-promises` (checksVoidReturn.attributes: false)

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

#### `@typescript-eslint/prefer-nullish-coalescing`

`||` 대신 `??`를 강제합니다. `||`는 `0`, `""`, `false`도 falsy로 처리합니다.

```typescript
// ❌
const count = input || 10; // input이 0이면 10이 됨

// ✅
const count = input ?? 10; // input이 null/undefined일 때만 10
```

#### `@typescript-eslint/no-unnecessary-condition`

타입상 항상 true이거나 항상 false인 조건을 감지합니다.

```typescript
// ❌
const file = formData.get("image") as File;
if (!file) { ... }  // as File로 단언했으므로 항상 truthy → 죽은 코드
```

#### `eqeqeq` (always)

`==` / `!=` 사용을 금지하고 `===` / `!==`를 강제합니다.

```typescript
// ❌
if (value == null) { ... }   // undefined도 매칭 — 의도적이어도 금지

// ✅
if (value === null || value === undefined) { ... }
```

#### `no-console` (allow: warn, error)

`console.log`가 프로덕션에 유출되는 것을 방지합니다. `console.warn`과 `console.error`는 허용합니다.

```typescript
// ❌
console.log('debug:', data);

// ✅
console.error('예상치 못한 상태:', state);
```

#### `@typescript-eslint/restrict-template-expressions` (allowNullish: false)

템플릿 리터럴에 `undefined`, `null`, 객체 등이 삽입되는 것을 방지합니다. 기본값은 `allowNullish: true`이므로 명시적으로 `false`로 설정해야 합니다.

```typescript
// ❌
const msg = `user: ${user.name}`; // user.name이 undefined면 "user: undefined"

// ✅
const msg = `user: ${user.name ?? '(알 수 없음)'}`;
```

#### `max-params` (2)

함수 파라미터를 최대 2개로 제한합니다. 파라미터가 많으면 객체로 묶어 가독성을 높입니다.

```typescript
// ❌
function createUser(name: string, email: string, age: number) { ... }

// ✅
function createUser(params: { name: string; email: string; age: number }) { ... }
```

#### `@typescript-eslint/no-explicit-any` (error)

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

#### `@typescript-eslint/no-unused-vars` (error)

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

#### `@typescript-eslint/ban-ts-comment`

`@ts-ignore`, `@ts-nocheck` 등의 타입 체크 우회 주석을 금지합니다. 타입 에러를 숨기면 런타임 버그로 이어집니다. 불가피한 경우 `@ts-expect-error`를 사용하면 해당 줄의 에러가 해결되었을 때 린트가 알려줍니다.

```typescript
// ❌
// @ts-ignore
const value = unsafeFunction();

// ✅ 불가피한 경우
// @ts-expect-error — 서드파티 타입 정의 미비
const value = unsafeFunction();
```

#### `@typescript-eslint/naming-convention`

식별자 네이밍 컨벤션을 강제합니다. 변수/함수는 camelCase, 타입/클래스는 PascalCase, 상수는 UPPER_CASE를 사용합니다.

```typescript
// ❌
const MyVariable = 1;
type user_type = {name: string};

// ✅
const myVariable = 1;
type UserType = {name: string};
```

변수는 `camelCase` 또는 `UPPER_CASE`만 허용합니다. **PascalCase 변수는 차단**하여 `const SomeComponent = () => <div />` 같은 화살표 컴포넌트 패턴(`react/function-component-definition`과 짝)과 `const UserSchema = z.object(...)` 같은 PascalCase Zod 스키마 변수까지 일관되게 막습니다.

React 컴포넌트(PascalCase 함수), Next.js 라우트 핸들러(`GET`, `POST` 등), 구조 분해 변수(외부 API 키 이름 그대로 사용)는 예외를 허용합니다. 객체 property는 camelCase/UPPER_CASE만 허용하며, 서버 DTO 등 snake_case가 필요한 파일은 파일 단위 eslint-disable로 처리합니다.

Storybook의 `**/*.stories.{ts,tsx}` 파일은 Story export(`export const BasicUsage: Story = {...}`)가 Storybook 사이드바 표시 컨벤션상 PascalCase여야 하므로, 워크스페이스 eslint config에서 file-pattern override로 variable PascalCase를 다시 허용합니다.

`memo`로 감싼 컴포넌트는 JSX 사용을 위해 PascalCase 변수가 필수이므로 line-level eslint-disable + 사유 주석으로 예외 처리합니다.

```tsx
// eslint-disable-next-line @typescript-eslint/naming-convention -- memo로 감싼 컴포넌트는 JSX 사용을 위해 PascalCase 변수가 필수
const SlowList = memo(function SlowList({text}: {text: string}) { ... });
```

#### `curly` (all)

if/else/for/while 등 제어문에 중괄호를 반드시 사용합니다. 한 줄이라도 중괄호 없이 쓰면 나중에 줄을 추가할 때 실수할 수 있습니다.

```typescript
// ❌ curly 위반
if (disabled) return null;

// ✅ 올바른 사용
if (disabled) {
  return null;
}
```

#### `no-magic-numbers`

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

#### `react/function-component-definition`

함수 컴포넌트는 `function` 키워드로 선언합니다. `const Foo = () => <div />` 같은 화살표 컴포넌트를 금지하여 선언 형태를 통일합니다. `memo`로 감싼 경우는 `CallExpression`이라 이 룰이 잡지 않습니다 (반환 변수의 PascalCase 처리는 별도 `naming-convention` 룰 영역).

```tsx
// ❌
const Input = (props: ComponentProps<'input'>) => <input {...props} />;
const Input = function(props: ComponentProps<'input'>) { return <input {...props} />; };

// ✅
function Input(props: ComponentProps<'input'>) {
  return <input {...props} />;
}
```

#### `react/jsx-sort-props`

JSX 속성을 알파벳 순으로 정렬합니다. 콜백(on\*)은 마지막, shorthand는 먼저, key/ref는 최우선으로 배치합니다. auto-fix 지원.

```tsx
// ❌
<Input onChange={handleChange} disabled type="text" className={styles.input} />

// ✅
<Input disabled className={styles.input} type="text" onChange={handleChange} />
```

#### `@typescript-eslint/parameter-properties` (error)

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

#### `id-length` (min: 2)

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

#### `id-denylist` (`['Props', 'State']`)

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

#### `no-restricted-imports` — `react`의 구버전 ref API 금지

React 19부터 함수 컴포넌트가 `ref`를 일반 prop으로 받을 수 있어 `forwardRef`가 불필요합니다. 이에 따라 `forwardRef`와, `forwardRef` 래핑 시 props 타입에서 ref를 빼기 위해 주로 쓰이던 `ComponentPropsWithoutRef`·`ComponentPropsWithRef`를 함께 금지합니다. 대신 ref prop을 직접 받고 props 타입은 `ComponentProps`를 사용합니다.

에러 메시지는 API별로 분리되어 있어 AI/사람 모두 메시지만 보고 바로 수정할 수 있도록 구체적인 대체 코드 예시나 대안 선택 기준을 포함합니다.

```tsx
// ❌
import {forwardRef, ComponentPropsWithoutRef} from 'react';

type Props = ComponentPropsWithoutRef<'input'>;
const Input = forwardRef<HTMLInputElement, Props>((props, ref) => <input ref={ref} {...props} />);

// ✅
import {ComponentProps} from 'react';

type Props = ComponentProps<'input'>;
function Input({ref, ...props}: Props) {
  return <input ref={ref} {...props} />;
}
```

AST 기반 규칙이라 `import {forwardRef as fr}`, type-only import, 여러 줄 import, `import * as React` 네임스페이스 import까지 모두 막힙니다.

#### `no-restricted-imports` — 내부 barrel(`index`) import 금지

`**/index`, `**/index.ts`, `**/index.tsx`로 끝나는 import 경로를 패턴으로 차단합니다. 디렉토리별 `index.ts`(barrel)을 만들어 묶어서 re-export하는 패턴은 tree shaking 방해, 순환 의존, 빌드 성능 저하의 원인이 되므로 사용을 금지합니다.

```typescript
// ❌ 내부 barrel
import {Button} from './components/index';
import {Button} from '@/components';   // ./components/index.ts를 가리킴

// ✅ 직접 import
import {Button} from './components/Button';
import {Button} from '@/components/Button';

// ✅ 패키지 entry는 alias로 통과 — packages/design-system/src/index.ts는 패키지의 public API라 예외
import {Button} from '@monorepo-playground/design-system';
```

패키지 entry(예: `packages/design-system/src/index.ts`)는 외부 사용자가 `import {X} from '@scope/pkg'`로 접근하는 진입점이라 alias를 통해 통과합니다. 내부 디렉토리별 barrel만 금지합니다.

#### `no-restricted-syntax` — 금지 패턴 모음

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

**인라인 스타일 객체 리터럴 금지** (`JSXAttribute[name.name='style'] > JSXExpressionContainer > ObjectExpression`)

인라인 스타일 객체 리터럴(`style={{...}}`)은 CSS Modules로 분리합니다. 변수 참조(`style={someVar}`)는 허용합니다. 동적 값, CSS 변수 주입, 스켈레톤은 예외로 허용하며, 이 외의 경우 `eslint-disable` + 사유 주석으로 처리합니다.

```tsx
// ❌ 객체 리터럴
<div style={{color: 'red', marginTop: 8}}>텍스트</div>;

// ✅ CSS Modules
import styles from './Component.module.scss';
<div className={styles.title}>텍스트</div>;

// ✅ 변수 참조 — 린트에 걸리지 않음
const columnCountStyle: CSSProperties = {'--column-count': 4} as CSSProperties;
<section style={columnCountStyle}>...</section>;
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

**catch 변수 타입 어노테이션 금지** (`CatchClause > Identifier.param[typeAnnotation]`)

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

**`React.X` 네임스페이스 접근 금지** (셀렉터 3개)

- `TSTypeReference > TSQualifiedName[left.name="React"]` — 타입 위치 (`React.FormEvent`, `React.ReactNode` 등)
- `MemberExpression[object.name="React"]` — 값 위치 (`React.useState`, `React.createRef()`, `React.memo` 등)
- `JSXMemberExpression[object.name="React"]` — JSX 위치 (`<React.Fragment>`, `<React.Suspense>` 등)

타입·값·JSX 어느 위치에서든 `React.X` 네임스페이스 접근 대신 named import를 사용합니다.

```tsx
// ❌
function handleSubmit(event: React.FormEvent<HTMLFormElement>) { ... }
const [count, setCount] = React.useState(0);
return <React.Fragment>...</React.Fragment>;

// ✅
import {type FormEvent, useState, Fragment} from 'react';
function handleSubmit(event: FormEvent<HTMLFormElement>) { ... }
const [count, setCount] = useState(0);
return <Fragment>...</Fragment>;
```

**clsx 삼항 래핑 금지** (`ConditionalExpression > CallExpression[callee.name='clsx']`)

clsx는 falsy 인자를 버리므로 조건은 인자로 표현합니다. clsx 호출을 삼항으로 감싸면 공통 인자가 양 갈래에 중복됩니다.

```tsx
// ❌
className={cond ? clsx(styles.a, styles.b, className) : clsx(styles.a, styles.b)}

// ✅
className={clsx(styles.a, styles.b, cond && className)}
```

#### 테스트 파일 전용: `aria-*` 금지 (`testFilesConfig`)

`testFilesConfig`(base export, 각 워크스페이스 config 배열에 추가)가 테스트 JSX의 `aria-*` 작성을 `no-restricted-syntax`로 금지합니다. **a11y가 현재 우선순위가 아니라** 테스트에 접근성 계약을 박지 않기 위함입니다. `getByRole`는 허용하며(base 기존 `no-restricted-syntax` 항목도 보존), 불가피하면 `eslint-disable` + 사유로 처리합니다.

```tsx
render(<Callout aria-label="알림">내용</Callout>); // ❌ 테스트 JSX에 aria-*
render(<Callout>내용</Callout>);                   // ✅ role로 쿼리
expect(screen.getByRole('note')).toBeInTheDocument();
```

#### `custom/filename-export-convention` (커스텀 룰)

`src/` 하위에서 **컴포넌트(PascalCase)·훅(`use*`) export가 정확히 하나인 파일**은 파일명(첫 `.` 이전)에 **kebab-case(하이픈)·snake_case(언더스코어)를 쓸 수 없습니다** — PascalCase(컴포넌트) 또는 camelCase(훅)여야 합니다. 컴포넌트·훅이 0개거나 2개 이상(여러 컴포넌트를 묶은 모듈)이면 검사하지 않습니다.

파일명과 심볼명의 **정확한 일치는 요구하지 않습니다** — 검사하는 건 casing뿐입니다. 따라서 컨텍스트 기반 단일 단어 파일명(`client.tsx`에 훅 하나 등)은 허용됩니다. casing만 보는 `check-file`로는 "컴포넌트/훅이 몇 개인지"를 판정할 수 없어 `eslint.config.base.mts`에 AST 룰로 구현하고 3개 워크스페이스에 공통 적용합니다.

제외 대상:

- `src/` 밖 파일 (루트 `*.config.*`, `.storybook/` 등 도구 설정 파일)
- Next.js App Router 규약 파일 (`page`, `layout`, `error`, `not-found` 등 — 프레임워크가 파일명을 고정)
- `*.test.*`, `*.spec.*`, `*.stories.*`, `*.d.ts`

```tsx
// ❌ 단일 컴포넌트인데 kebab 파일명
// some-component.tsx
export function SomeComponent() { ... }

// ❌ 단일 훅인데 kebab 파일명
// use-some-hook.ts
export function useSomeHook() { ... }

// ✅ 단일 컴포넌트는 PascalCase, 단일 훅은 camelCase
// SomeComponent.tsx → export function SomeComponent
// useSomeHook.ts    → export function useSomeHook

// ✅ 여러 컴포넌트를 묶으면 kebab 파일명 + named export (컴포넌트 2개 이상 → 무검사)
// buttons.tsx
export function PrimaryButton() { ... }
export function SecondaryButton() { ... }
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

#### `check-file/folder-naming-convention` — 워크스페이스별

`eslint-plugin-check-file` 도입. 폴더 네이밍을 워크스페이스 성격에 맞게 강제합니다.

| 워크스페이스        | 패턴                                         | 의도                                                            |
| ------------------ | -------------------------------------------- | --------------------------------------------------------------- |
| `apps/examples`    | `src/**/*` → `NEXT_JS_APP_ROUTER_CASE`       | Next.js 동적 라우트(`[id]`, `[...slug]`) 자동 인정 + 그 외 kebab-case |
| `design-system`    | `src/**/*` → `KEBAB_CASE`                    | 모든 폴더 kebab. 카테고리(`inputs`/`feedback`/`data-display`/`surfaces`)도 묶음 서브폴더(`feedback/modal`)도 전부 kebab — PascalCase 폴더는 어느 깊이에서든 막힌다. |

`src/**/*` 한 패턴으로 깊이 제한 없이 재귀 검사하므로 카테고리(depth 1)뿐 아니라 묶음 서브폴더(`feedback/modal`, depth 2 이하)까지 kebab을 강제합니다. 컴포넌트는 카테고리 폴더 안에 플랫 파일로 두고, 폴더는 관련 컴포넌트를 둘 이상 묶을 때만 만들며 그 묶음 폴더도 kebab으로 둡니다([convention.md](../convention.md)의 폴더 구조 참고).

### `recommendedTypeChecked` 프리셋

`recommendedTypeChecked` 프리셋에 포함된 규칙들입니다. `recommended`에서 업그레이드하면 활성화되며, TypeScript 컴파일러의 타입 정보를 활용합니다.

#### `@typescript-eslint/no-unsafe-assignment`

`any` 타입 값이 변수에 할당되는 것을 방지합니다. `any`가 한 번 변수에 들어가면 타입 체크가 무력화됩니다.

```typescript
// ❌
const data = JSON.parse(response); // data는 any

// ✅
const raw: unknown = JSON.parse(response);
const data = schema.parse(raw); // 검증 후 사용
```

#### `@typescript-eslint/no-unsafe-call`

`any` 타입 값을 함수처럼 호출하는 것을 방지합니다.

```typescript
// ❌
const fn = JSON.parse(str);
fn(); // any를 함수로 호출

// ✅
const fn: () => void = validateAndParse(str);
fn();
```

#### `@typescript-eslint/no-unsafe-member-access`

`any` 타입 값에서 프로퍼티에 접근하는 것을 방지합니다.

```typescript
// ❌
const data = JSON.parse(str);
const name = data.user.name; // any 체이닝

// ✅
const data: UserResponse = schema.parse(JSON.parse(str));
const name = data.user.name;
```

#### `@typescript-eslint/no-unsafe-return`

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

#### `@typescript-eslint/no-unsafe-argument`

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

#### `@typescript-eslint/await-thenable`

Promise가 아닌 값에 `await`를 사용하는 것을 방지합니다.

```typescript
// ❌
const value = 42;
const result = await value; // 의미 없는 await

// ✅
const result = value;
```

#### `@typescript-eslint/require-await`

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

#### `@typescript-eslint/no-base-to-string`

`toString()`이 정의되지 않은 객체를 문자열로 변환하면 `[object Object]`가 됩니다. 이를 방지합니다.

```typescript
// ❌
const obj = {name: 'test'};
console.error(`result: ${obj}`); // "result: [object Object]"

// ✅
console.error(`result: ${JSON.stringify(obj)}`);
```

이 외에 `no-unsafe-enum-comparison`, `no-redundant-type-constituents`, `restrict-plus-operands`, `no-unnecessary-type-assertion` 등도 프리셋에 포함되어 있습니다.
