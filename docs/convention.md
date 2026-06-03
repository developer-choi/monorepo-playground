# packages/design-system 컨벤션

> 이 컨벤션은 `packages/design-system` 내부 코드에만 적용된다. `apps/*` 등은 적용 대상이 아니다.

이 레포의 디자인 시스템은 **학습** + **"마크업은 공유, 시각 스타일은 채용과제별로 교체"** 패턴을 목표로 한다. 그래서 마크업과 시각을 명시적으로 분리한다.

## 마크업/시각 스타일 분리

### 중첩 클래스 패턴

같은 `*.module.scss` 안에서 마크업/시각 두 영역을 중첩 클래스로 나눈다.

- `.X` — 마크업 (동작에 필수: display, position, overflow, 크기 제약 등)
- `.X.styled` — 시각 (색, padding, font, radius, shadow 등)

엘리먼트에는 두 클래스를 함께 적용한다.

```scss
.paper {
  display: flex;
  max-width: $dialogMaxWidth;
  // ... 마크업
}

.paper.styled {
  background-color: var(--color-bg-primary);
  box-shadow: var(--shadow-dialog);
  // ... 시각
}
```

### 마크업 vs 시각 기준

"이 속성을 빼면 컴포넌트 동작이 깨지는가"로 판단한다.

- 다이얼로그의 `max-width: 600px` → **마크업** (없으면 뷰포트에 무한히 늘어남)
- 다이얼로그의 `background-color: var(--color-bg-primary)` → **시각** (없어도 동작 OK, 색만 사라짐)

### 시각 속성이 없는 클래스

`.X.styled`가 비면 만들지 않는다 (예: `.container` 같이 마크업만 필요한 경우).

## 다중 클래스 조합: clsx

`${a} ${b}` 템플릿 리터럴은 CSS Module 타입이 `string | undefined`라서 ESLint `restrict-template-expressions`에 막힌다. `clsx`를 쓴다.

```tsx
import clsx from 'clsx';

<div className={clsx(styles.paper, styles.styled)}>...</div>
```

## 디자인 토큰

토큰을 다룰 때는 [packages/design-system/docs/patterns/DesignTokens.md](../packages/design-system/docs/patterns/DesignTokens.md)를 따른다.
