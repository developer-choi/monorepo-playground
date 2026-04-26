> **이 문서는**: `trigger-rect-animation.md`를 읽기 전에 봐야 할 사전 학습 가이드다. clipPath, getBoundingClientRect, framer-motion initial/animate/exit, layoutId 등 구현에 등장하는 개념들을 순서대로 설명한다.

# trigger-rect-animation.md 이해를 위한 학습 로드맵

이 문서의 구현을 완전히 이해하려면 아래 개념들을 순서대로 익혀야 한다.

---

## Step 1. `position: fixed` + `inset: 0` — 풀스크린 레이어의 기본

**왜 필요한가**: 오버레이 DOM이 "항상 전체화면"이라고 표현한 이유가 이것이다.

```css
.overlay {
  position: fixed; /* 뷰포트 기준으로 고정 */
  inset: 0; /* top: 0; right: 0; bottom: 0; left: 0 의 단축어 */
}
```

`position: fixed; inset: 0`이면 스크롤과 무관하게 화면 전체를 덮는 레이어가 된다. 모달, 드로어, 오버레이가 모두 이 방식을 쓴다.

**확인 포인트**: `inset`이 `top/right/bottom/left`의 단축어임을 안다면 충분.

---

## Step 2. `clip-path: inset()` — CSS 클리핑

**왜 필요한가**: 구현의 핵심 트릭이 여기에 있다. DOM은 전체화면이지만 _시각적으로_ 잘라내서 버튼처럼 보이게 하는 것.

### clip-path란

요소의 보이는 영역을 정의한다. 영역 밖은 렌더링되지 않는다. 레이아웃(다른 요소의 위치)에는 영향을 주지 않는다.

```css
/* 기본형 */
clip-path: inset(top right bottom left);

/* 예: 상하좌우 각각 100px 안쪽만 보임 */
clip-path: inset(100px 100px 100px 100px);

/* round로 모서리 둥글게 */
clip-path: inset(100px 100px 100px 100px round 16px);

/* 전체 보임 (클리핑 없음) */
clip-path: inset(0px 0px 0px 0px round 0px);
```

### inset() 값의 의미

`inset(top right bottom left)`는 각 방향에서 *안쪽으로 얼마나 잘라내는가*이다.

```
뷰포트: 390×844
inset(300px 200px 400px 50px)
→ 위에서 300px, 오른쪽에서 200px, 아래에서 400px, 왼쪽에서 50px 잘라냄
→ 결과적으로 보이는 영역: left=50, top=300, right=190, bottom=444
```

**실습**: 브라우저 DevTools에서 임의의 div에 `clip-path: inset(50px 50px 50px 50px round 16px)`를 적용해보면 바로 이해된다.

---

## Step 3. `getBoundingClientRect()` — 요소의 뷰포트 내 좌표

**왜 필요한가**: `toInset()` 함수가 이 값을 받아서 clip-path 문자열을 만든다.

```js
const rect = element.getBoundingClientRect();
// rect.top    — 요소 상단이 뷰포트 상단에서 얼마나 떨어져 있는가
// rect.right  — 요소 우단이 뷰포트 좌단에서 얼마나 떨어져 있는가
// rect.bottom — 요소 하단이 뷰포트 상단에서 얼마나 떨어져 있는가
// rect.left   — 요소 좌단이 뷰포트 좌단에서 얼마나 떨어져 있는가
// rect.width, rect.height
```

### toInset() 함수가 하는 일

버튼의 DOMRect를 clip-path inset() 값으로 변환한다.

```
뷰포트: vw=390, vh=844
버튼 rect: top=300, right=170, bottom=420, left=50

inset의 각 값 =
  top    = rect.top            = 300   (위에서 300px 잘라냄 → 버튼 상단에서 시작)
  right  = vw - rect.right     = 220   (오른쪽에서 220px 잘라냄 → 버튼 우단에서 끝)
  bottom = vh - rect.bottom    = 424   (아래에서 424px 잘라냄 → 버튼 하단에서 끝)
  left   = rect.left           = 50    (왼쪽에서 50px 잘라냄 → 버튼 좌단에서 시작)

결과: inset(300px 220px 424px 50px round 16px)
→ 전체화면 오버레이가 시각적으로 정확히 버튼 영역만 보임
```

---

## Step 4. framer-motion — `initial / animate / exit`

**왜 필요한가**: 문서의 애니메이션 코드가 전부 이 세 prop 기반이다.

### 기본 개념

```tsx
<motion.div
  initial={{opacity: 0}} // 마운트 직후 초기 상태
  animate={{opacity: 1}} // 목표 상태 (마운트 시 initial → animate로 트랜지션)
  exit={{opacity: 0}} // 언마운트 시 이 상태로 트랜지션 후 DOM에서 제거
/>
```

### AnimatePresence와 exit

`exit`는 `AnimatePresence` 안에 있어야 동작한다. 없으면 그냥 즉시 언마운트.

```tsx
<AnimatePresence>
  {isVisible && (
    <motion.div
      initial={{scale: 0}}
      animate={{scale: 1}}
      exit={{scale: 0}} // AnimatePresence가 이 애니메이션이 끝날 때까지 DOM 유지
    />
  )}
</AnimatePresence>
```

### transition 커스텀

```tsx
animate={{
  opacity: 1,
  transition: { type: 'tween', duration: 0.3, ease: 'easeOut' }
}}
```

**clip-path도 animate 가능하다**: framer-motion은 clip-path 값 사이를 보간할 수 있다. `inset(300px 220px 424px 50px round 16px)` → `inset(0px 0px 0px 0px round 0px)` 사이를 자동으로 부드럽게 보간.

---

## Step 5. 전체 흐름 조합

위 개념을 이해했다면 구현의 흐름이 이렇게 읽힌다:

```
유저가 버튼 클릭
  → getBoundingClientRect()로 버튼 위치/크기 캡처
  → triggerRect state에 저장

open = true → AnimatePresence가 오버레이 마운트
  → 오버레이 DOM: position:fixed; inset:0 (항상 전체화면)
  → initial: { clipPath: inset(버튼위치), opacity: 0 }
     → 전체화면 DOM이 버튼 크기로 클리핑되어 보임 + 투명
  → animate: { clipPath: inset(0 0 0 0), opacity: 1 }
     → 클리핑이 서서히 사라지며 전체화면으로 확장 + 불투명해짐

닫기 버튼 클릭
  → open = false → AnimatePresence가 exit 트리거
  → exit: { clipPath: inset(버튼위치), opacity: 0 }
     → 전체화면에서 버튼 크기로 다시 클리핑되며 사라짐
  → 애니메이션 완료 후 DOM 제거
```

---

## 참고 — 학습 우선순위

| 개념                               | 중요도 | 이유                    |
| ---------------------------------- | ------ | ----------------------- |
| `clip-path: inset()`               | ★★★    | 구현의 핵심 트릭        |
| `getBoundingClientRect()`          | ★★★    | toInset() 함수의 입력값 |
| framer-motion initial/animate/exit | ★★★    | 애니메이션 코드 전체    |
| `position: fixed; inset: 0`        | ★★     | 오버레이 DOM 구조       |
| AnimatePresence                    | ★★     | exit 동작 이해          |
