---
title: "왜 테스트 코드를 작성해야 할까요?"
description: "테스트의 목적은 확신 — 확신에 기여하지 않는 테스트는 쓰지 않는다"
category: "testing"
date: "[발행 시 확정]"
picked: 0
---

# 왜 테스트 코드를 작성해야 할까요?

**사용자가 이용할 때 문제없다**는 확신을 얻기 위해서입니다.

- 사용자가 아닌 대상을 위해 테스트 코드를 열심히 작성하는 것은 코드만 늘어나고 이득이 없습니다.
- 이미 라이브러리가 보장하는 테스트를 또 작성하는 것도 이득이 없습니다.

결국 테스트는 사용자를 위해, 확신을 위해 작성해야 합니다.

## 그럼 어떤 테스트 코드가 확신을 주나요?

### 실제 사용을 닮은 정도에 비례합니다.

같은 로그인을 두 방식으로 테스트하면:

```ts
// ① 유닛
it('이메일에 특수문자가 있으면 실패해야 한다.', () => {
  expect(isValidEmail('user!#$@test.com')).toBe(false)
})

// ③ E2E
test('이메일, 비밀번호가 올바르면 로그인을 성공해야 한다.', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[name=email]', 'user@test.com')
  await page.fill('[name=password]', 'pw')
  await page.click('[type=submit]')
  await expect(page).toHaveURL('/dashboard')
})
```

**로그인**이 잘된다는 확신을 얻는 가장 좋은 방법은, **로그인**을 실제로 해보는 겁니다. (E2E)

### 사용자가 보지 않는 것은 가치가 없습니다.

```tsx
it('클릭 시 isOpen이 true가 된다', () => {
  const wrapper = mount(<Dropdown />)
  wrapper.find('button').simulate('click')
  expect(wrapper.state('isOpen')).toBe(true)
})
```

이 테스트는 isOpen이 true가 되는지만 확인합니다. 정작 사용자가 보는 건 "클릭하면 목록이 열리는가"인데, 그건 검증하지 않습니다.

사용자가 겪는 동작과 무관한 확신이라 가치가 없습니다.

## QA가 있는데 왜 테스트 코드를 작성해야 하나요?

테스트의 가치는 임팩트(깨지면 큰 사고냐)가 아니라 **들킬 수 있느냐**로 갈립니다. 깨졌을 때를 두 축으로 봅니다.

- **은폐 가능성**: 그럴듯해 보이는 틀린 값으로 조용히 넘어가나, 에러·빈 화면으로 드러나나.
- **국소성**: 특정 분기에서만 깨지나, 모든 사용처에서 깨지나.

드러나게 + 모든 사용처에서 깨지면 QA가 이미 잡습니다. 전용 테스트를 더 깔아도 **추가로 잡아주는 게 없습니다**.

반대로 **조용히 + 특정 분기에서만** 깨지는 것이 테스트가 가치 있는 경우입니다.

```tsx
// children이 렌더되는지 단언
it('children을 넘기면 화면에 보인다', () => {
  render(<Badge>신규</Badge>)
  expect(screen.getByText('신규')).toBeInTheDocument()
})
```

`getByText`는 "DOM 트리에 글자가 있다"까지만 보지 "사용자 눈에 보인다"는 검증하지 못합니다. `display:none`·투명·0px·가림이면 그대로 통과합니다.

라벨이 실제로 보이는지는 Chromatic(시각 회귀)이 봅니다.

컴포넌트가 children을 안 그리면 큰 사고지만, 모든 사용처에서 즉시 빈 칸으로 드러나 발견하기 쉽습니다.

"안 깨질 것 같다"(느낌)가 아니라 "깨지면 숨을 수 있나"(구조)로 판단합니다.

### 고친 건 A, 깨지는 건 B

QA는 "고친 근처만" 돌아봅니다. 그래서 A를 고쳤다고 B를 검사하는 것을 놓칠 수 있습니다.

```ts
// 공통 함수 A: 금액을 "1,000원" 형태로 포맷
export const formatPrice = (n: number) => `${n.toLocaleString()}원`
```

예를 들어 누군가 A의 출력을 `₩1,000` 형태로 바꾸면, A를 직접 import하지 않는 B의 테스트가 이 변경을 잡아냅니다.

```tsx
// B(장바구니 합계): formatPrice를 직접 부르지 않습니다
it('총 금액을 표시한다', () => {
  render(<CartSummary items={[{ price: 1000 }]} />)
  expect(screen.getByText('1,000원')).toBeInTheDocument() // ₩1,000으로 바뀌면 여기서 실패
})
```

CartSummary가 내부적으로 formatPrice를 쓰므로, B의 테스트를 열어보지 않아도 A의 변경이 자동으로 드러납니다.

### QA와의 역할 차이 정리

| | QA | 테스트 코드 |
|---|---|---|
| 잡는 것 | UX·사용성·예상 못한 흐름 | 로직 오류·회귀 |
| 반복 비용 | 매번 사람이 | 한 번 작성하면 자동 |

그럼 이 확신을 어떻게 코드로 옮기나요? → [How to test?](./how-to-test.md)