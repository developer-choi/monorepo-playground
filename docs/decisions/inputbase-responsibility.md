---
type: decision
subtype: none
audience: design-system 팀, 미래의 본인
audience_knowledge: React 컴포넌트 합성(children 주입·forwardRef), CSS Module, 입력 폼 컴포넌트 설계에 익숙
purpose: InputBase의 책임 범위 결정 — 내부 요소를 children으로 주입할지 input을 직접 렌더할지
key_message: children 주입 채택 — InputBase는 레이아웃(3슬롯)과 상태 스타일만 책임지고 input·textarea 등 실제 요소는 소비자가 렌더, 확장성과 API 단순함 우선
length_target: 현재 분량 유지
rendering_env: markdown
placeholder_policy: keep
refs:
  related_files:
    - packages/design-system/src/components/InputBase/InputBase.tsx
    - packages/design-system/src/components/TextField/TextField.tsx
---

# InputBase의 책임 범위

## 목표: 다양한 기능의 입력 폼 요소

서비스에는 기능이 다른 여러 입력 폼 요소가 필요합니다. 아무 텍스트나 입력하는 것, 비밀번호를 가리고 입력하는 것, 여러 옵션 중 고르는 것, 여러 줄을 입력하는 것처럼요.

이걸 통일성 있게 제공하려고, 디자이너와 같은 바탕 위에서 모양만 달리하는 방식으로 스펙을 정했습니다.

- 아무 텍스트 입력: 아이콘 없이 → `TextField`
- 비밀번호 입력: 오른쪽에 눈 아이콘 → `PasswordTextField`
- 옵션 선택: 오른쪽에 화살표 + 아래 메뉴 → `SelectField`
- 여러 줄 입력: 세로로 길게 → `TextAreaField`
- 단위가 붙는 입력: 입력값 끝에 `원` 같은 글자 붙이기 (suffix)

네 가지 모두 테두리·패딩·상태 스타일은 똑같이 두고, 안쪽 내용과 양옆에 붙는 것만 바꿉니다. 이렇게 하면 입력 폼이 화면 어디에 있든 같은 모습으로 보이고, 새로운 입력 종류가 필요해질 때도 같은 바탕에서 금방 만들 수 있습니다.

## InputBase: 공통 시각 요소를 한 곳에

그래서 이 입력 폼들을 만들 때 공통으로 쓰는 시각 요소를 InputBase 한 곳에 모았습니다. 컴포넌트마다 같은 테두리·패딩·leading/trailing·상태 스타일을 다시 만들지 않아도 됩니다.

InputBase가 맡는 공통 시각 요소는 다음과 같습니다.

- 테두리
- 안쪽 패딩
- 왼쪽 leading
- 우측 trailing

## 구현 방법이 중요한 이유

InputBase가 `<input>`을 직접 렌더링하면, 모든 확장 컴포넌트에 공통 동작을 한 곳에서 적용할 수 있습니다.

하지만 TextAreaField는 `<textarea>`가 필요하고, SelectField도 구현에 따라 `<button>` 등 `<input>`이 아닌 요소가 들어갈 수 있습니다. InputBase 안에 요소 타입별 분기가 생기거나 교체 메커니즘이 필요해집니다.

반대로 InputBase가 내부 요소를 모르면, API는 단순해지지만 공통 동작을 적용할 수단이 없어집니다.

**InputBase에 `<input>`을 넣을지 말지가 이 컴포넌트의 책임 범위를 결정합니다.**

현재 InputBase 코드 스케치:

```tsx
export function InputBase() {
  return (
    <div className="레이아웃 + 상태 스타일링()">
      {leading && <span className={styles.slot}>{leading}</span>}
      <span className={styles.content}>
        {/* TODO 이 자리에 <input>이 들어갈 수도, 아닐 수도 */}
        {suffix && <span className={styles.suffix}>{suffix}</span>}
      </span>
      {trailing && <span className={styles.slot}>{trailing}</span>}
    </div>
  );
}
```

## 구현 방법

### 방법 1. `<input>`을 직접 렌더링

```tsx
export function InputBase(veryManyProps) {
  return (
    <label {...rest}>
      {leading && <span className={styles.slot}>{leading}</span>}
      <span className={styles.content}>
        <input
          {...veryManyProps}
          onClick={() => alert('모든 인풋에 공통 동작 적용 가능')}
        />
        {suffix && <span className={styles.suffix}>{suffix}</span>}
      </span>
      {trailing && <span className={styles.slot}>{trailing}</span>}
    </label>
  );
}
```

radix-themes도 이 방식을 사용합니다. 컴포넌트 안에 `<input>`이 직접 들어있습니다:

```tsx
const TextFieldRoot = React.forwardRef<TextFieldRootElement, TextFieldRootProps>(
  (props, forwardedRef) => {
    return (
      <div className={classNames('rt-TextFieldRoot', className)}>
        <input
          spellCheck="false"
          {...inputProps}
          ref={composeRefs(inputRef, forwardedRef)}
          className="rt-reset rt-TextFieldInput"
        />
        {children}
      </div>
    );
  },
);
```

**장점:**

- 의미상 통일이 가능합니다. 모든 인풋에 일괄적으로 공통 요구사항을 적용할 수 있어서, 디자이너가 공통 스펙을 요구해도 한 곳에서 대응할 수 있습니다.

**단점:**

- InputBase의 props가 많아집니다. InputBase가 `<input>`을 직접 렌더링하므로, `<input>`에 전달해야 하는 모든 속성(value·onChange·placeholder·type 등)을 InputBase가 prop으로 받아 그대로 넘겨줘야 하기 때문입니다.
- `<textarea>` 대응이 불가능합니다. InputBase가 내부적으로 `<input>`을 렌더링하기 때문에, 여러 줄 입력이 필요한 `<textarea>`로 바꿔 끼울 수 없습니다. 같은 이유로 `<button>`을 내부 폼 요소로 쓰는 것도 불가능합니다.

### 방법 2. children으로 주입

as 방식이든 render props든 어떤 형태든, 외부에서 내부 요소를 주입하는 접근입니다. 그중 가장 단순한 children 방식을 예시로 가져왔습니다.

```tsx
export function InputBase({ leading, trailing, suffix, children, ...rest }) {
  return (
    <div className="레이아웃 + 상태 스타일링()">
      {leading && <span className={styles.slot}>{leading}</span>}
      <span className={styles.content}>
        {children}
        {suffix && <span className={styles.suffix}>{suffix}</span>}
      </span>
      {trailing && <span className={styles.slot}>{trailing}</span>}
    </div>
  );
}
```

사용하는 쪽:

```tsx
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  function TextArea(props, ref) {
    return (
      <InputBase {...commonProps}>
        <textarea ref={ref} className={styles.textarea} {...textareaProps} />
      </InputBase>
    );
  },
);
```

**장점:**

- API가 단순합니다.
- 어떤 요소든 들어갈 수 있습니다. `<input>`, `<textarea>`, `<button>` 모두 대응 가능합니다.

**단점:**

- 모든 인풋에 적용하고 싶은 공통 동작이 있어도, InputBase에서 통일할 수 없습니다. TextField, PasswordTextField, TextAreaField, SelectField 각각에 넣어야 합니다.

소비자 계층으로 보면:

- **레이어 0** (최상위 부모) = InputBase
- **레이어 1** (1차 소비자) = TextField, PasswordTextField, TextAreaField, SomeField
- **레이어 2** (2차 소비자) = 어드민 / 사용자 사이트 등

레이어 0은 레이아웃과 스타일만 담당합니다. 1차 소비자마다 코드 중복이 발생할 수 있는데, `<input>`에 공통으로 전달해야 하는 동작을 TextField·PasswordTextField·TextAreaField 등 1차 소비자마다 각자 넣어야 하기 때문입니다. 이 중복은 별도로 해결해야 합니다.

### 방법 3. MUI 방식: 둘 다 지원

방법 2의 장점을 가져가면서 방법 1의 장점도 취하려는 접근입니다.

MUI는 `<TextField>`에 `multiline` prop을 전달하면 내부적으로 `<textarea>`로 렌더링되도록 분기합니다:

```tsx
if (multiline && InputComponent === 'input') {
  if (rows) {
    inputProps = { type: undefined, minRows: rows, maxRows: rows, ...inputProps };
  } else {
    inputProps = { type: undefined, maxRows, minRows, ...inputProps };
  }
  InputComponent = TextareaAutosize;
}
```

**장점:**

- 두 가지 방법의 장점을 모두 챙길 수 있습니다.

**단점:**

- InputBase 안에서 textarea인지를 따지는 분기문이 들어가야 하므로, 코드 복잡도가 높아집니다. `<textarea>` 외에도 `<button>` 등 전혀 다른 요소가 들어올 수 있어서, 분기는 계속 늘어날 수 있습니다.

### 방법 4. (번외) Radix 방식: 컴포넌트마다 독립 구현

Radix는 베이스 컴포넌트 없이 각 컴포넌트가 내부 요소를 직접 렌더링합니다:

```tsx
// TextField — <input> 직접 렌더링
<div className={classNames('rt-TextFieldRoot', className)}>
  <input {...inputProps} className="rt-reset rt-TextFieldInput" />
  {children}
</div>

// TextArea — <textarea> 직접 렌더링
<div className={classNames('rt-TextAreaRoot', className)}>
  <textarea {...textAreaProps} className="rt-reset rt-TextAreaInput" />
</div>

// SelectTrigger — <button> 직접 렌더링
<button {...triggerProps} className={classNames('rt-reset', 'rt-SelectTrigger', className)}>
  <span className="rt-SelectTriggerInner">
    <SelectPrimitive.Value placeholder={placeholder}>{children}</SelectPrimitive.Value>
  </span>
  <SelectPrimitive.Icon asChild>
    <ChevronDownIcon className="rt-SelectIcon" />
  </SelectPrimitive.Icon>
</button>
```

세 컴포넌트가 공유하는 베이스가 없으므로, 공통 레이아웃이나 스타일을 일괄 적용할 수 없습니다.

## 결론

확장성과 API 단순함을 고려하면 **방법 2(children)가 적합하다고 판단했습니다.**

### 다른 방법을 고르지 않은 이유

방법 1(`<input>` 직접 렌더링)은 두 가지가 걸립니다. InputBase가 `<input>`을 직접 렌더링하므로 value, onChange 같은 속성을 모두 prop으로 받아 넘겨야 해서 props가 많아집니다. 또한 내부가 `<input>`으로 고정되어 여러 줄 입력의 `<textarea>`나 폼 요소로 쓰는 `<button>`으로 바꿔 끼울 수 없습니다.

방법 3(둘 다 지원)은 InputBase 안에 textarea인지 따지는 분기가 들어갑니다. `<textarea>` 외에 `<button>` 등 다른 요소도 들어올 수 있어서 분기가 계속 늘고 복잡도가 높아집니다.

방법 4(컴포넌트마다 독립 구현)는 공유하는 베이스가 없습니다. 그래서 공통 레이아웃이나 상태 스타일을 한 번에 적용할 수 없습니다.

방법 2도 공통 동작을 1차 소비자마다 각자 넣어야 하는 비용이 있습니다. 다만 어떤 요소든 받아들이는 확장성과 단순한 API가 이를 상쇄한다고 판단했습니다.
