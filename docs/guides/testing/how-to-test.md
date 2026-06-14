# 테스트 선정과 작성

## 선정 기준

테스트를 쓰기 전에 "이걸 검증할 가치가 있나"부터 고릅니다. 두 가지 규칙이면 대부분 가려집니다.

### 로직·경계·에러 세 갈래

하나의 대상을 테스트할 때 세 갈래를 덮습니다.
- 코드가 갈라지는 모든 분기(로직)
- 일반·경계·범위 밖 입력(경계)
- 잘못된 입력을 만났을 때의 처리(에러)

```ts
function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) throw new Error('value must be a number');
  return Math.min(Math.max(value, min), max);
}

it.each([
  [5, 5], //    일반
  [1, 1], //    경계(하한)
  [10, 10], //  경계(상한)
  [-1, 1], //   범위 밖 → 하한으로 보정
  [11, 10], //  범위 밖 → 상한으로 보정
])('clamp(%i, 1, 10)은 %i이다', (value, expected) => {
  expect(clamp(value, 1, 10)).toBe(expected);
});

it('NaN을 넣으면 에러가 발생한다', () => {
  expect(() => clamp(NaN, 1, 10)).toThrow();
});
```

함수로 예를 들었지만 컴포넌트도 같은 세 갈래입니다.

### 검증된 기반: 더한 부분만

이미 누군가 검증한 것 위에 테스트를 또 쌓는 건 코드만 늘립니다. "이미 검증된 것"은 두 종류입니다.

- **남이 보장하는 것**: React가 prop·ref를 전달하는 동작, 라이브러리(radix 등)가 보장하는 키보드 네비게이션·포커스. 그쪽 테스트가 이미 지킵니다.
- **우리 기반이 이미 검증한 것**: 우리 함수 A를 우리 함수 B가 부르면, A가 검증한 입력을 B에서 또 검증하지 않습니다.

우리가 **새로 더한 부분만** 테스트합니다.

```ts
// isNonEmpty: 빈 문자열·공백 검증 (기반)
// isValidEmail: isNonEmpty 호출 + 이메일 형식 검사를 더함

// ❌ 기반이 이미 본 케이스: 중복
it('빈 문자열이면 false', () => {
  expect(isValidEmail('')).toBe(false);
});

// ✅ 기반으로 전파되는지 1건 + 우리가 더한 로직만
it('공백뿐이면 false (기반으로 전파되는지)', () => {
  expect(isValidEmail('   ')).toBe(false);
});
it('형식이 맞으면 true, 아니면 false', () => {
  expect(isValidEmail('user@test.com')).toBe(true);
  expect(isValidEmail('user')).toBe(false);
});
```

컴포넌트도 같습니다. radix Select를 감싼 커스텀 Select라면 radix의 키보드 네비게이션을 다시 테스트하지 않고, 우리가 더한 것(예: 커스텀 className 전달)만 봅니다.

```tsx
// ✅ 우리가 더한 것만
it('커스텀 className이 루트에 적용된다', () => {
  const {container} = render(<Select className="custom" options={[]} />);
  expect(container.firstChild).toHaveClass('custom');
});
```

## 제외 기준

"쓸 수 있는 테스트"와 "써야 하는 테스트"는 다릅니다. 아래는 흔히 손이 가지만, 확신을 더해주지 않아 빼는 사례들입니다.

### 타입·정적 분석이 막는 것

타입이 이미 금지한 입력은 런타임 테스트로 또 막지 않습니다. 재현하려면 `as any`로 타입을 일부러 뚫어야 하는데, 실제 호출부에선 컴파일러가 막아 도달조차 하지 않는 경로입니다.

```ts
function add(a: number, b: number): number {
  return a + b;
}

// ❌ 타입이 string 인자를 이미 금지: as any로 뚫어야만 재현됨
it('문자열을 넣으면 NaN이 된다', () => {
  expect(add('1' as any, 2)).toBeNaN();
});

// ✅ 타입이 못 잡는 값의 경계·계산만
it('음수도 올바르게 더한다', () => {
  expect(add(-1, -2)).toBe(-3);
});
```

타입·eslint·stylelint가 컴파일·CI에서 더 싸고 확실하게 잡는 것은 테스트로 중복하지 않습니다.

### children 렌더

```tsx
it('children을 넘기면 화면에 보인다', () => {
  render(<Badge>신규</Badge>);
  expect(screen.getByText('신규')).toBeInTheDocument();
});
```

이게 깨지는 경우는 컴포넌트가 children을 받아놓고 안 그릴 때뿐인데, 그러면 모든 곳에서 빈 칸이 되어 바로 드러납니다.

게다가 `getByText`는 "DOM에 글자가 있다"까지만 보지 "사용자 눈에 보인다"는 검증하지 못합니다(`display:none`·투명·가림이면 그대로 통과). 실제로 보이는지는 시각 회귀(Chromatic)가 봅니다.

### ref 전달

```tsx
it('ref가 button에 전달된다', () => {
  const ref = createRef<HTMLButtonElement>();
  render(<Button ref={ref}>확인</Button>);
  expect(ref.current).toBeInstanceOf(HTMLButtonElement);
});
```

ref를 루트로 그냥 흘려보내는 것은 React가 보장합니다(앞의 "남이 보장하는 것"). 우리가 ref를 **재지정**할 때(내부 요소로 넘기거나, 여러 ref를 병합하는 등)만 `.focus()` 같은 관찰 가능한 동작으로 테스트합니다.

## 작성 규칙

무엇을 쓸지 골랐다면, 이제 읽기 쉽고 실패가 또렷한 코드로 옮깁니다.

### 준비-실행-검증(AAA)

테스트는 세 단계로 씁니다. **준비**(Arrange: 렌더·입력 셋업), **실행**(Act: 사용자 행동), **검증**(Assert: 결과 확인)입니다.

React Testing Library에선 각각 `render`, `userEvent`, `expect`가 맡습니다.

```tsx
it('이름을 입력하고 제출하면 확인 메시지가 뜬다', async () => {
  render(<SignupForm />); // 준비
  await userEvent.type(screen.getByLabelText('이름'), '홍길동'); // 실행
  await userEvent.click(screen.getByRole('button', {name: '가입'}));
  expect(screen.getByText('가입이 완료됐습니다')).toBeInTheDocument(); // 검증
});
```

### 한 테스트, 한 단언

단언을 하나로 두면 실패했을 때 원인이 바로 짚입니다. 한 `it`에 단언이 여럿이면 첫 번째가 깨진 순간 나머지는 실행되지 않아, "무엇이 더 깨졌는지" 정보가 사라집니다.

```tsx
// ❌ 여러 단언: 어디서 깨졌는지 흐려짐
it('폼 제출 결과를 확인한다', async () => {
  render(<Form />);
  await userEvent.click(screen.getByRole('button', {name: '제출'}));
  expect(screen.getByText('성공')).toBeInTheDocument(); // 여기서 깨지면
  expect(screen.queryByText('오류')).not.toBeInTheDocument(); // 이건 실행 안 됨
});

// ✅ 케이스별 1단언
it('제출이 성공하면 성공 메시지가 뜬다', async () => {
  render(<Form />);
  await userEvent.click(screen.getByRole('button', {name: '제출'}));
  expect(screen.getByText('성공')).toBeInTheDocument();
});
it('제출이 실패하면 오류 메시지가 뜬다', async () => {
  render(
    <Form
      onSubmit={() => {
        throw new Error();
      }}
    />,
  );
  await userEvent.click(screen.getByRole('button', {name: '제출'}));
  expect(screen.getByText('오류')).toBeInTheDocument();
});
```

### 이름은 사용자 관점으로

테스트 이름은 구현 용어(URL 파라미터·변수·메서드명)가 아니라 사용자가 인식하는 행동으로 씁니다. 테스트가 실패했을 때 그 이름이 곧 "무엇이 안 되는가"를 알려주기 때문입니다.

```ts
// ❌ 구현 용어
it('gender=F로 이동한다', ...);
it('router.replace가 호출된다', ...);

// ✅ 사용자가 인식하는 행동
it('여성 필터를 선택하면 해당 조건으로 이동한다', ...);
it('선택을 확정하면 URL이 갱신된다', ...);
```
