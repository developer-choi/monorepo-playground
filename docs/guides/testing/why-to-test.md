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

유닛테스트에서 E2E로 갈수록 확신은 커집니다. 하지만 E2E는 실행 시간이 길고 유지 비용이 높아서, 모든 케이스를 E2E로 쓸 수는 없습니다. 이 트레이드오프가 테스트 종류별 비율을 결정하는 기준이 됩니다.

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

### 비용이 다릅니다
QA는 사람이 직접 확인합니다. 테스트 코드는 한 번 작성하면 기계가 자동으로 돌려줍니다.

### 사람이 놓치기 쉬운 버그를 테스트 코드가 잡습니다
QA는 시나리오를 따라가며 확인합니다. 특정 조건에서만 발견되는 버그는 그 경로를 우연히 밟지 않으면 놓칩니다.

```ts
getDiscount(999, 'NORMAL')   // 0%  ✓
getDiscount(1000, 'SILVER')  // 0%  ✗  5%여야 함
getDiscount(5000, 'GOLD')    // 10% ✓
```

### 고친 건 A, 깨지는 건 B

QA는 방금 고친 부분 근처만 확인합니다. A를 고쳤는데 B가 함께 깨지는 경우를 놓칠 수 있습니다.

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

|  | QA | 테스트 코드 |
|---|---|---|
| 잡는 것 | UX·사용성·예상 못한 흐름 | 로직 오류·회귀 |
| 반복 비용 | 매번 사람이 | 한 번 작성하면 자동 |
| 발견 시점 | 개발 후 | 커밋·PR 시점 |
| 검사 범위 | 고친 근처 위주 | 전체 자동 검사 |

그럼 이 확신을 어떻게 코드로 옮기나요? → [How to test?](./how-to-test.md)