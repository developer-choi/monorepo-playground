# 방향성 정의 2회차. InputBase 클릭 시 내부 input으로 포커스를 위임하는 방식

## 목표

InputBase 컨테이너의 padding 영역을 포함한 전체 클릭 영역에서, **내부 단일 input**으로 포커스를 이동시킵니다.

이 회차는 단일 input 기본 케이스를 중심으로 다루되, `leading` / `trailing`에 또 다른 폼 요소(select 등)가 끼는 복합 케이스도 결론에서 함께 정리합니다.

## 왜 구현 방법이 중요한가

피그마 스펙상 "Input 영역 전체가 터치 영역"입니다. 실제 `<input>`보다 InputBase 컨테이너(테두리 + padding)가 더 넓기 때문에, **padding 영역을 클릭했을 때도 내부 input으로 포커스가 이동해야** 스펙을 만족합니다.

1회차 결정에 따라 InputBase는 내부 요소를 **children으로 전달**받습니다. 이때 InputBase는 전달받은 요소의 DOM 참조를 직접 알 수 없습니다.

따라서, 이 제약 위에서 padding 클릭 → 포커스 이동을 어떻게 구현할지에 따라 최상위 태그(`<label>` vs `<div>`) 선택과 1차 소비자의 보일러플레이트 양이 달라집니다.

현재 InputBase 코드 스케치:

```tsx
export function InputBase({ leading, trailing, suffix, children }: Props) {
  return (
    <WHICH_TAG className="레이아웃 + 상태 스타일링()">
      {leading && <span className={styles.slot}>{leading}</span>}
      <span className={styles.content}>
        {children}
        {suffix && <span className={styles.suffix}>{suffix}</span>}
      </span>
      {trailing && <span className={styles.slot}>{trailing}</span>}
    </WHICH_TAG>
  );
}
```

## 구현 방법

### 방법 1. `<label>`로 감싸기 (브라우저 네이티브 위임)

```tsx
export function InputBase({leading, trailing, children}: Props) {
  return (
    <label className="레이아웃 + 상태 스타일링()">
      {leading && <span className={styles.slot}>{leading}</span>}
      <span className={styles.content}>{children}</span>
      {trailing && <span className={styles.slot}>{trailing}</span>}
    </label>
  );
}

// 1차 소비자: ref, id, handleClick 어느 것도 필요 없음
function TextField({title, ...props}) {
  return (
    <>
      <label>{title}</label>
      <InputBase>
        <input {...props} />
      </InputBase>
    </>
  );
}
```

단일 input 케이스에서는 `<label>`이 브라우저 네이티브로 padding 클릭 → 내부 input 포커스를 처리합니다. InputBase 코드에 포커스 관련 JS가 한 줄도 없고, 1차 소비자도 별도 ref 전달이 필요 없습니다.

**장점:**

- **JS 0줄: 기본값이 "아무것도 안 써도 동작함".** `handleClick`, `ref`, `id` 어느 것도 InputBase와 1차 소비자 양쪽에 쓰지 않아도, `<label>` 네이티브 위임이 padding 클릭 → 내부 input 포커스를 처리합니다.
- **1차 소비자가 InputBase에 ref를 별도 전달할 필요 없음.** `<InputBase><input /></InputBase>` 한 줄이면 끝이므로 TextField / PasswordTextField / TextAreaField 등 모든 파생 필드에서 포커스 위임용 보일러플레이트가 생기지 않습니다.

**단점:**

- **시맨틱 중복: 한 필드에 `<label>`이 두 개.** 위 예제처럼 제목 `<label>`과 InputBase를 함께 쓰면 한 input이 두 개의 `<label>`에 연결됩니다. 시각적·기능적 문제는 없지만 시맨틱은 깔끔하지 않습니다.

### 방법 2. `<div>` + `handleClick` + `inputRef` 전달

`<div>`로 감싸면 브라우저 네이티브 위임이 없으므로 클릭 → 포커스 이동을 직접 구현해야 합니다. 그런데 children으로 전달받는 구조에서는 `handleClick`만으로는 포커스 대상을 가리킬 수단이 없습니다.

```tsx
export function InputBase({children}: Props) {
  const handleClick = () => {
    // children은 ReactNode일 뿐, 전달받은 <input>의 DOM 노드에 접근할 방법이 없음
  };
  return <div onClick={handleClick}>{children}</div>;
}
```

결국 1차 소비자가 ref를 만들어 InputBase로 넘겨야 합니다.

```tsx
export function InputBase({inputRef, leading, trailing, children}: Props) {
  const handleClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) inputRef.current?.focus();
  };
  return (
    <div className="레이아웃 + 상태 스타일링()" onClick={handleClick}>
      {leading && <span className={styles.slot}>{leading}</span>}
      <span className={styles.content}>{children}</span>
      {trailing && <span className={styles.slot}>{trailing}</span>}
    </div>
  );
}

// 1차 소비자: useRef 생성 + inputRef prop 전달 + <input>에 ref 연결
function TextField(props) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <InputBase inputRef={inputRef}>
      <input ref={inputRef} {...props} />
    </InputBase>
  );
}
```

**장점:**

- **시맨틱 깔끔: label 중복 없음.** InputBase가 `<div>`이므로 제목 `<label>` 하나만 input과 연결되어 a11y 트리가 단순합니다.

**단점:**

`inputRef` prop 패턴으로 `handleClick`이 InputBase에 자리 잡긴 하지만, **문제가 이전된 것이지 해결된 것은 아닙니다**.

- **최소한 `handleClick` 함수 선언이 필요.** "아무것도 안 써도 되는" label 방식과 대비되는 가장 작은 비용입니다. padding 클릭과 children 내부 클릭을 구분하는 처리도 함께 들어갑니다(예: 클릭 대상이 컨테이너 자신인지 확인).
- **보일러플레이트 3단계가 파생 필드마다 반복.** `inputRef` prop을 InputBase에 전달, 1차 소비자에서 `useRef` 생성, 내부 input에 `ref` 연결. TextField / PasswordTextField / TextAreaField 각각에서 같은 3단계가 중복됩니다.
- **`forwardRef`로 외부 ref를 받으면 ref 병합이 필요.** 1차 소비자가 `forwardRef<HTMLInputElement>`로 외부 ref를 받으면 내부 `inputRef`와 외부 ref를 둘 다 input에 연결해야 합니다. ref 병합 유틸이 필요합니다 ([MUI 예시](https://github.com/mui/material-ui/blob/v9.0.0/packages/mui-material/src/InputBase/InputBase.js)).

## 결론

**기본값의 비용**을 따져보면 방법 1(`<label>`로 감싸기)이 더 적합하다고 판단합니다.

label 방식은 InputBase에도, 1차 소비자에도 포커스 이동 관련 코드를 한 줄도 쓰지 않아도 동작합니다.

반면 handleClick 방식은 최소 단위에서도 `handleClick` 함수 선언과 `inputRef` prop 배선이 필요하고, `forwardRef` 조합에서는 ref 병합까지 따라옵니다. 같은 UX를 얻으려고 handleClick 쪽에만 비용이 누적되는데 그만큼의 반대급부가 보이지 않습니다.

`<label>` 중복이라는 시맨틱 비용은 감수합니다. 시맨틱 정합성은 이번 요구사항이 아니기 때문입니다.

이 결론은 복합 케이스에도 그대로 이어집니다. `leading` / `trailing`에 또 다른 폼 요소(예: PhoneNumberField의 국가코드 `<select>`)가 끼더라도, 포커스 타겟을 `<label>`의 `htmlFor`와 대상 요소의 `id` 한 쌍으로 명시하면 padding 클릭은 메인 input으로, 슬롯 요소 직접 클릭은 그 요소로 가도록 네이티브 위임이 그대로 동작합니다(포커스 JS 0줄). `<div>` + `handleClick`도 같은 결과를 내지만 `ref` 배선과 `.focus()` 호출을 명령형 JS로 작성해야 하고, 그 비용은 복합 필드에만 생기는 label과 달리 단순 필드에도 따라붙습니다. 따라서 복합 케이스에서도 `<label>` + `htmlFor`를 유지합니다.
