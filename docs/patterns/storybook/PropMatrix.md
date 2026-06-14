# Storybook 시각 매트릭스 — prop 조합 1스토리 렌더

`variant`·`color`·`size`처럼 시각에만 영향을 주는 prop의 조합은 **개별 스토리로 쪼개지 않고 한 스토리 안에 격자(매트릭스)로 모두 렌더**한다. Chromatic이 그 화면 전체를 스냅샷 1장으로 캡처하므로, 시각 커버리지는 넓게 가져가면서 비용은 스냅샷 1개로 묶인다.

## 왜 1스토리인가 — Chromatic 과금 단위

Chromatic은 **스냅샷 단위로 과금**하고, **스토리 1개가 스냅샷 1개**다(단 viewport·브라우저·a11y 테스트마다 곱해진다). 따라서:

- 조합을 개별 스토리로 쪼개면: `variant(2) × color(3) × size(4)` = **48 스토리 = 48 스냅샷**
- 한 스토리에 매트릭스로 몰면: **1 스토리 = 1 스냅샷**

같은 시각 정보를 보면서 스냅샷이 48배 차이 난다. 근거: [Chromatic billing](https://www.chromatic.com/docs/billing/).

## 매트릭스로 모은다

시각 prop의 전 조합을 한 `render`에서 격자로 그린다.

```tsx
const VARIANTS = ['contained', 'outlined'] as const;
const COLORS = ['primary', 'secondary', 'destructive'] as const;
const SIZES = ['small', 'medium', 'large', 'xLarge'] as const;

export const Matrix: Story = {
  // 매트릭스 스토리는 args를 쓰지 않으므로 Controls 행을 숨긴다(ControlsPanel.md).
  argTypes: {
    variant: {table: {disable: true}},
    color: {table: {disable: true}},
    size: {table: {disable: true}},
  },
  render: () => (
    <div className={styles.matrix}>
      {VARIANTS.flatMap((variant) =>
        COLORS.map((color) => (
          <div key={`${variant}-${color}`} className={styles.row}>
            {SIZES.map((size) => (
              <Button key={size} variant={variant} color={color} size={size}>
                {variant}/{color}/{size}
              </Button>
            ))}
          </div>
        )),
      )}
    </div>
  ),
};
```

축 상수(`VARIANTS`·`COLORS`·`SIZES`)는 컴포넌트의 prop 유니온과 같은 원천에서 끌어와 매트릭스가 prop 추가에 자동으로 따라가게 한다.

## 무엇을 매트릭스에 넣나 — 시각 prop만

매트릭스는 **순수 시각 prop**(모양·색·크기)만 담는다. **동작이 걸린 prop**(`loading`·`disabled`·`onClick` 등)은 매트릭스가 아니라 별도 동작 데모 스토리(또는 유닛테스트)로 다룬다. 매트릭스의 목적은 "조합별로 어떻게 보이는가"를 한눈에 모아 시각 회귀를 잡는 것이지 동작 검증이 아니다.

## 독립 축은 전 조합이 필수는 아니다

`variant`·`color`·`size`는 코드상 서로 독립적으로 클래스를 붙이는 축이라(조합별 특수 분기가 없다면), 엄밀히는 전 조합(cross-product)을 다 그리지 않고 축별 대표만 그려도 시각 회귀는 드러난다. 다만 1스토리 = 1스냅샷이므로 비용 때문에 줄일 이유는 없다 — 전 조합 격자도 무방하다. 축끼리 **상호작용**(예: `size=small`일 때만 `outlined` 테두리 계산이 달라짐)이 있으면 그 조합은 반드시 격자에 포함한다.
