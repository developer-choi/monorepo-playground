React 컴포넌트와 JSX를 다루는 규칙입니다. 따로 적지 않은 규칙은 `eslint.config.base.mts`의 `baseRules`에 있습니다. 제목 끝에 `— examples`가 붙은 규칙은 `apps/examples` config에만 있습니다.

`no-restricted-syntax` 항목은 [eslint.md](../eslint.md#no-restricted-syntax-항목)의 공통 처리(위반 시 `eslint-disable` + 사유 주석)를 따릅니다.

## `react/function-component-definition`

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

## `react/jsx-sort-props`

JSX 속성을 알파벳 순으로 정렬합니다. 콜백(on\*)은 마지막, shorthand는 먼저, key/ref는 최우선으로 배치합니다. auto-fix 지원.

```tsx
// ❌
<Input onChange={handleChange} disabled type="text" className={styles.input} />

// ✅
<Input disabled className={styles.input} type="text" onChange={handleChange} />
```

## `no-restricted-imports` — `react`의 구버전 ref API 금지

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

## `no-restricted-syntax` — `React.X` 네임스페이스 접근 금지

셀렉터: 셀렉터 3개

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

## `no-restricted-syntax` — JSX 속성 안 블록 본문 함수 금지

셀렉터: `JSXAttribute[name.name!='ref'] > JSXExpressionContainer > :matches(ArrowFunctionExpression[body.type='BlockStatement'], FunctionExpression)`

return부는 컴포넌트 구조를 한눈에 보는 자리라, 속성 안에 핸들러 본문을 펼치면 마크업 사이로 이벤트 처리 로직이 끼어 구조가 안 읽힙니다. `{ }` 본문을 가진 함수(`function` 표현식 포함)는 줄 수와 무관하게 컴포넌트 본문에 동작을 드러내는 이름(`addTagOnEnter`)으로 빼고 속성엔 이름만 넘깁니다. 인자를 묶는 식 본문 한 줄(`() => removeTag(tag)`)과 `ref` 콜백은 허용합니다.

줄 수(예: 3줄 이하 허용)로 가르지 않는 이유: `no-restricted-syntax`의 셀렉터는 노드 위치를 상수와만 비교할 수 있어 끝 줄 − 시작 줄을 셀 수 없고, 그러려면 커스텀 룰을 짜야 합니다. 한 줄 블록은 `() => {alert('x')}` → `() => alert('x')`로 중괄호만 빼면 됩니다.

스토리 파일(`**/*.stories.{ts,tsx}`)은 `storyFilesConfig`(base export, 각 워크스페이스 config 배열에 추가)가 이 항목만 빼고 다시 선언합니다. 스토리의 `() => {setOpen(false); args.onClose();}`는 데모용 `args` 배선이라 붙일 동작 이름이 없습니다.

```tsx
// ❌ 속성 안에 블록 본문
<TextField
  onKeyDown={(event) => {
    if (event.key !== 'Enter') {
      return;
    }
    event.preventDefault();
    addTag();
  }}
/>;

// ✅ 동작 이름으로 빼고 이름만 넘김
const addTagOnEnter = (event: KeyboardEvent<HTMLInputElement>) => {
  if (event.key !== 'Enter') {
    return;
  }
  event.preventDefault();
  addTag();
};
<TextField onKeyDown={addTagOnEnter} />;

// ✅ 인자를 묶는 식 본문 한 줄 — 린트에 걸리지 않음
<Chip onRemove={() => removeTag(tag)} />;
```

## `no-restricted-syntax` — 인라인 스타일 객체 리터럴 금지

셀렉터: `JSXAttribute[name.name='style'] > JSXExpressionContainer > ObjectExpression`

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

## `no-restricted-syntax` — clsx 삼항 래핑 금지

셀렉터: `ConditionalExpression > CallExpression[callee.name='clsx']`

clsx는 falsy 인자를 버리므로 조건은 인자로 표현합니다. clsx 호출을 삼항으로 감싸면 공통 인자가 양 갈래에 중복됩니다.

```tsx
// ❌
className={cond ? clsx(styles.a, styles.b, className) : clsx(styles.a, styles.b)}

// ✅
className={clsx(styles.a, styles.b, cond && className)}
```

## `no-restricted-syntax` — SVG 직접 작성 금지

셀렉터: `JSXElement > JSXOpeningElement[name.name='svg']`

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

## `no-restricted-syntax` — 빈 alt 속성 금지

셀렉터: `JSXAttribute[name.name='alt'][value.value='']` 등 3개 셀렉터

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

## `react-hooks/error-boundaries` (off) — examples

`try` 블록 안에서 JSX를 만드는 코드를 잡는 규칙입니다. JSX는 만들어질 때 실행되지 않고 React가 나중에 렌더할 때 실행되므로, 그 컴포넌트가 렌더 중 던진 에러는 이미 `try`를 빠져나온 뒤라 `catch`가 받지 못합니다.

출처: https://github.com/facebook/react/blob/main/compiler/packages/babel-plugin-react-compiler/src/Validation/ValidateNoJSXInTryStatement.ts

> React does not immediately render components when JSX is rendered, so any errors from this component will not be caught by the try/catch. To catch errors in rendering a given component, wrap that component in an error boundary.

**비활성화 이유는 코드 모양입니다.** 서버 컴포넌트에서 데이터를 받아 렌더하는 페이지가 이 규칙에 걸립니다 — `try`가 지키려는 건 위쪽의 데이터 요청인데 `return`이 `try` 안에 있어 JSX까지 딸려 들어가기 때문입니다.

```tsx
// src/app/validation/integration/[id]/page.tsx — 규칙을 켜면 return 줄이 걸린다
try {
  const board = await getBoardApi(parseNumericId(id));
  return <BoardDetail board={board} />;
} catch (error) {
  return handleServerSideError(error);
}
```

규칙을 켜려면 JSX를 `try` 밖으로 빼야 하는데(`let board;` 선언 + `try` 뒤에서 `return`), 이 모양을 쓰지 않기로 했습니다. 데이터 요청을 감싸는 SSR 페이지 외에는 `try`로 렌더링을 감싸는 코드를 작성하지 않으므로, 규칙이 잡아줄 대상이 사실상 이 형태뿐입니다.

플러그인 옵션으로 이 형태만 예외 처리할 수는 없습니다. 규칙 `schema`가 열린 객체지만 React 컴파일러 공통 옵션 자루이고, `ErrorCategory.ErrorBoundaries`에 대해 severity만 정할 뿐 패턴별 예외를 받지 않습니다.

`packages/design-system`은 이 override가 없어 규칙이 켜져 있습니다(`reactHooks.configs.flat.recommended`의 기본값 `error`).

2026-02-19 `4668a6c9`에서 처음 `off`로 내려뒀는데, 그 시점 앱에는 `try`가 한 줄도 없었고 커밋 본문도 비어 있어 최초 근거는 복원하지 못했습니다. 위 설명은 2026-08-04에 다시 판단한 내용입니다.
