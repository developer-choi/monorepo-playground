# 이런 테스트는 작성하지 않아요

아래는 컴포넌트 유닛 테스트에서 **흔히 끌리지만 작성하지 않는** 패턴들이다. 판정 근거는 [WhatToTest.md](./WhatToTest.md)의 판정 4문항이다. 각 항목은 "안 쓰는 코드 예시 / 왜 / 대신 무엇이 검증하나"로 구성한다.

핵심 한 줄: **유닛 테스트에서 빼는 것은 "검증하지 않는다"가 아니라 "유닛으로 검증하지 않는다 — 더 맞는 도구가 가진다"는 뜻이다.**

## 타입·정적 분석이 막는 것을 런타임으로 테스트한다

```tsx
function add(a: number, b: number): number {
  return a + b;
}

it('문자열을 넣으면 NaN이 된다', () => {
  expect(add('1' as any, 2)).toBeNaN(); // as any로 타입을 일부러 뚫어야만 재현됨
});
```

타입이 이미 `string` 인자를 금지하므로 이 입력은 `as any`로 타입을 뚫어야만 만들 수 있고, 실제 호출부에선 컴파일이 막아 도달조차 하지 않는다. 정적 분석(TS 타입, 타입드 CSS 모듈, eslint·stylelint)이 컴파일·CI에서 더 싸고 확실하게 잡는 것은 런타임 테스트로 중복 검증하지 않는다.

→ **대신**: 타입이 보장하지 못하는 **값의 경계·계산 오류**만 테스트한다.

```tsx
it('음수도 올바르게 더한다', () => {
  expect(add(-1, -2)).toBe(-3);
});
```

## children이 렌더된다

```tsx
it('children을 넘기면 화면에 보인다', () => {
  render(<Badge>신규</Badge>);
  expect(screen.getByText('신규')).toBeInTheDocument();
});
```

이 테스트가 깨지는 경우는 개발자가 children을 받아놓고 안 그리는 것뿐이다. 그러면 **모든 Badge가 빈 칸이 되어** dev 서버·스토리·다른 테스트가 즉시 잡는다(눈에 띄게 + 모든 사용처에서 깨짐). 게다가 `getByText`는 "DOM 트리에 글자가 있다"까지만 보지 "사용자 눈에 보인다"는 검증하지 못한다(`display:none`·투명·0px·가림이면 그대로 통과).

→ **대신**: 라벨이 실제로 보이는지는 Chromatic(시각)이 본다.

## onClick을 넘기면 클릭 시 호출된다 (그냥 흘려보내는 경우)

```tsx
it('onClick을 넘기면 클릭 시 호출된다', async () => {
  const onClick = vi.fn();
  render(<Button onClick={onClick}>확인</Button>);
  await userEvent.click(screen.getByRole('button'));
  expect(onClick).toHaveBeenCalled();
});
```

onClick을 엘리먼트에 연결하고 클릭 시 부르는 것은 React가 보장한다. 우리가 가공하지 않고 흘려보내기만 한다. 안 불리면 버튼이 반응을 안 해 즉시 들킨다. 그리고 loading 가드 같은 우리 로직을 테스트한다면 그 테스트의 대조군이 이미 이 경로를 밟는다.

→ **대신**: 우리가 onClick에 **로직을 얹은 경우**(예: `loading`이면 막기)만 테스트한다.

```tsx
it('loading=true면 클릭해도 onClick이 호출되지 않는다', async () => {
  const onClick = vi.fn();
  render(
    <Button loading onClick={onClick}>
      확인
    </Button>,
  );
  await userEvent.click(screen.getByRole('button'));
  expect(onClick).not.toHaveBeenCalled();
});
```

## 크래시 없이 렌더된다 (스모크)

```tsx
it('크래시 없이 렌더된다', () => {
  render(<Button>확인</Button>);
});
```

렌더 중 터지면 그 컴포넌트를 그리는 모든 스토리·테스트가 같이 빨개진다(눈에 띄게 + 모든 사용처에서). 게다가 storybook 브라우저 프로젝트가 모든 스토리를 한 번씩 렌더하므로 크래시는 거기서 잡힌다. 컴포넌트마다 스모크를 깔면 "일관성"은 생기지만 발견력은 0이다.

→ **대신**: storybook 브라우저 프로젝트의 스토리 렌더가 스모크 역할을 한다.

## ref가 전달된다 (루트로 그냥 넘기는 경우)

```tsx
it('ref가 button 엘리먼트에 전달된다', () => {
  const ref = createRef<HTMLButtonElement>();
  render(<Button ref={ref}>확인</Button>);
  expect(ref.current).toBeInstanceOf(HTMLButtonElement);
});
```

ref를 루트 엘리먼트로 그냥 흘려보내는 것은 React(ref-as-prop)와 타입이 보장한다.

→ **대신**: ref를 **재지정**할 때만 테스트한다 — 루트가 아닌 내부 엘리먼트로 forward, `useImperativeHandle`, 여러 ref 병합 등. 이때는 `.focus()` 같은 관찰 가능한 동작으로 검증한다.

## variant 클래스가 붙는다 (CSS 모듈 클래스명 단언)

```tsx
it('variant=contained면 contained 클래스가 붙는다', () => {
  render(<Button variant="contained">확인</Button>);
  expect(screen.getByRole('button')).toHaveClass(styles.contained);
});
```

클래스 문자열이 붙었는지만 보고 **그 클래스의 CSS가 맞는지(빨간색인지, 간격이 맞는지)는 못 잡아** 거짓 안심을 준다. 클래스는 맞는데 `.contained` 규칙이 비어 있거나 색이 틀려도 통과한다. CSS 모듈 해시라 리팩토링에도 잘 깨진다.

→ **대신**: 모양은 Chromatic(시각)이 본다. 클래스 이름과 prop 유니온이 어긋나는 것(유니온은 `'contained'`인데 scss엔 `.solid`만 있는 식)은 타입드 CSS 모듈(scss마다 정확한 `.d.ts`를 생성해 클래스 이름을 타입으로 검사하는 설정)로 잡을 수 있다 — 단 **현재 컴포넌트 스타일엔 미설정**(typography만 적용)이라, 도입 전까진 이 어긋남을 잡는 정적 그물이 없다.

## 임의 prop / data-\* 가 전달된다

```tsx
it('data-* 속성이 전달된다', () => {
  render(<Badge data-testid="x">신규</Badge>);
  expect(screen.getByText('신규')).toHaveAttribute('data-testid', 'x');
});
```

우리 컴포넌트는 `Pick`으로 받을 prop을 좁혀두므로 임의 속성은 애초에 공개 계약 밖이고, 전달 자체는 React의 `{...rest}` 몫이다.

→ **대신**: 소비자가 넘긴 **`className`이 병합되는지**는 우리가 `clsx`로 직접 처리하고 빠지면 조용히 깨지므로 컴포넌트당 하나 테스트한다.

```tsx
it('className을 넘기면 엘리먼트에 병합된다', () => {
  render(<Button className="custom">확인</Button>);
  expect(screen.getByRole('button')).toHaveClass('custom');
});
```

## 라이브러리 동작을 다시 검증한다

```tsx
it('Radio를 선택하면 aria-checked가 true다', () => {
  /* radix RadioGroup이 보장하는 동작 */
});
```

radix가 보장하는 동작(`aria-checked`, 키보드 네비게이션, 포커스 트랩 등)은 radix 자체 테스트가 지킨다.

→ **대신**: 우리가 radix 위에 얹은 것만 테스트한다 — 우리 prop을 radix prop으로 매핑, 차단·조건부 로직, 기본값 주입, compound 컴포넌트 연결. 판별: "이 테스트를 통과시키는 코드가 우리 레포에 있나, radix에 있나?"

## 특정 자식 엘리먼트가 있다 (구조 셀렉터)

```tsx
it('아이콘 슬롯이 렌더된다', () => {
  const {container} = render(<Chip>태그</Chip>);
  expect(container.querySelector('svg')).toBeInTheDocument();
});
```

`querySelector('svg')`·`[class*="trailing"]` 같은 구조 셀렉터는 구현 모양에 결합되고, 아이콘이 "있는지"는 대개 시각 문제다.

→ **대신**: 시각은 Chromatic. 조건부 렌더는 사용자가 인지·조작하는 것(role/text로 표현되는 접근성·동작 계약, 예: `open=false`면 dialog가 없음)일 때만 테스트한다.

## 기본 prop 값

시각 기본값(`size=medium`처럼 모양만 정하는 것)은 유닛으로 단언하지 않는다 — Chromatic이 본다. 기본값이 **동작**을 바꾸면(예: `<button type="button">` — 네이티브 기본 `submit`을 우리가 덮어 폼 오submit을 막음) 조용히 깨지므로 이때만 테스트한다.

```tsx
it('type을 안 주면 button이다', () => {
  render(<Button>확인</Button>);
  expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
});
```

## prop 조합을 전부 테스트한다

`variant × color × size`처럼 시각 prop의 모든 조합(48가지 등)을 유닛으로 도는 것은 의미가 없다. 서로 독립인 축은 한 축이 동작하면 조합도 동작한다.

→ **대신**: 모양 조합은 Chromatic 매트릭스 스토리 한 장으로 본다([PropMatrix.md](../storybook/PropMatrix.md)). 조합이 **동작**을 바꿀 때(축 간 상호작용)만 그 케이스를 유닛으로 테스트한다.
