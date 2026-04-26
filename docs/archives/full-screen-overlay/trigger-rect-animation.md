# test playground 관련 커밋

- https://github.com/developer-choi/test-playground/commit/7c3fcb48645e11f54bd64bc3dadf26064e9287fd

# triggerRect 애니메이션 — 구현 히스토리 & 동작 설명

## 최종 결과물 동작

1. 유저가 그리드의 썸네일 이미지(예: 3×3 포토 그리드)를 탭한다.
2. 오버레이가 **그 썸네일의 위치와 크기** 그대로인 채로 나타나고, 0.3초 동안 전체화면으로 확장된다.
   - 썸네일이 왼쪽 하단에 있었다면, 왼쪽 하단의 작은 사각형에서 전체화면으로 펼쳐진다.
   - 썸네일의 모서리 둥글기(16px)도 확장 도중에 0으로 줄어든다.
   - 전체 opacity가 0→1로 동시에 올라온다.
3. 오버레이를 닫으면 그 역방향으로 — 전체화면에서 원래 썸네일 위치로 오므라들며 사라진다.

---

## 요구사항 등장 배경

원래 기본 모드는 `transformOrigin`(클릭 좌표)을 기준으로 scale 0→1 확장이었다. 즉, 버튼의 중심 **점**에서 확장이 시작됐다.

유저가 요청한 것: "트리거 요소의 **크기** 그대로에서 시작해서 펼쳐지는 느낌"

말로 설명하기 어려운 UX였는데, 핵심은 이것이다:

> "오버레이가 버튼처럼 보이는 상태에서 시작해서 전체화면으로 커진다."

---

## 1차 시도 — layoutId (실패)

framer-motion의 `layoutId` 공유 요소 트랜지션을 시도했다.

```tsx
// 트리거 버튼
<motion.div layoutId="overlay-trigger" />

// 오버레이 컨테이너
<motion.div layoutId="overlay-trigger" />
```

**문제**: `layoutId`는 두 요소를 하나의 연속된 요소로 취급하여 트리거 버튼 자체가 점점 커지는 morphing 효과가 발생했다. 유저 피드백: _"이미지가 커지는건 좀 그런데; 트리거가 커지는게아니라 트리거 크기에서 오버레이가 커지는 느낌이야"_

→ `layoutId`는 트리거를 건드리지 않아야 하는 요구사항에 맞지 않는다. **폐기.**

---

## 2차 시도 — clipPath inset() (채택)

### 핵심 아이디어

오버레이 DOM은 항상 `position: fixed; inset: 0` (전체화면)이다. 시각적으로만 트리거 버튼 크기로 **클리핑**해서 버튼처럼 보이게 하고, 클리핑 범위를 전체화면으로 확장하는 방식이다.

- **오버레이 DOM**: 변하지 않음 (항상 전체화면)
- **트리거 DOM**: 변하지 않음 (그냥 평범한 버튼)
- **시각 효과**: CSS `clip-path`로 오버레이를 오려내서 버튼 위치에 있는 것처럼 보이게 함

### triggerRect prop

소비자가 클릭 이벤트에서 `getBoundingClientRect()`를 호출해 `DOMRect`를 prop으로 전달한다.

```tsx
const handleOpen = (event: React.MouseEvent) => {
  setTriggerRect(event.currentTarget.getBoundingClientRect());
  setOpen(true);
};

<FullScreenOverlayRoot triggerRect={triggerRect} ... />
```

### toInset 헬퍼

`DOMRect` → CSS `inset()` 문자열 변환. 뷰포트 크기와 rect를 이용해 사방의 inset 값을 계산한다.

```tsx
function toInset(rect: DOMRect): string {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const top = Math.round(rect.top);
  const right = Math.round(vw - rect.right);
  const bottom = Math.round(vh - rect.bottom);
  const left = Math.round(rect.left);
  return `inset(${top}px ${right}px ${bottom}px ${left}px round 16px)`;
}
```

예: 뷰포트 390×844, 버튼이 (left:8, top:300, width:120, height:120)이면
→ `inset(300px 262px 424px 8px round 16px)`

### 애니메이션 코드

```tsx
{triggerRect
  ? {
      initial: { clipPath: toInset(triggerRect), opacity: 0 },
      animate: {
        clipPath: 'inset(0px 0px 0px 0px round 0px)',
        opacity: 1,
        transition: { type: 'tween', duration: 0.3, ease: 'easeOut' },
      },
      exit: {
        clipPath: toInset(triggerRect),
        opacity: 0,
        transition: { type: 'tween', duration: 0.3, ease: 'easeOut' },
      },
    }
  : {
      // 기본 scale 모드 (triggerRect 없을 때)
      initial: { scale: 0 },
      animate: { scale: 1, transition: { ... } },
      exit: { scale: 0, transition: { ... } },
    }}
```

---

## 왜 scale이 아닌 clipPath인가

| 방식                        | 동작                           | 문제                                    |
| --------------------------- | ------------------------------ | --------------------------------------- |
| `scale` + `transformOrigin` | 요소 자체가 중심점에서 커짐    | 점(point)에서 시작, 버튼 크기 재현 불가 |
| `layoutId`                  | 두 요소를 공유 요소로 morphing | 트리거 버튼 자체가 변형됨               |
| `clipPath inset()`          | DOM은 전체화면, 시각만 클리핑  | 없음 — 채택                             |

`clipPath`는 레이아웃이나 다른 요소에 전혀 영향을 주지 않는다. 오버레이 내부 컨텐츠도 처음부터 전체화면 크기로 렌더링되어 있고, 단지 클리핑 마스크에 의해 잘려 보이지 않을 뿐이다.

---

## borderRadius 처리

`clipPath: inset(... round 16px)`의 `round` 파라미터로 클리핑 영역의 모서리를 둥글게 한다. 트리거 썸네일이 `border-radius: 16px`이므로, 초기 inset의 round 값도 16px로 맞췄다. 전체화면으로 확장되면서 `round 0px`으로 줄어든다.

---

## opacity 추가 이유

clipPath만으로는 클리핑이 오버레이 **밖**에 있는 요소를 가리지 못한다. 버튼 위에 다른 UI가 겹쳐있을 경우 오버레이의 내부 컨텐츠가 비어있는 것처럼 보이는 순간이 생긴다. opacity 0→1을 동시에 넣어 시작 프레임에서 컨텐츠가 불완전하게 노출되는 것을 방지한다. 닫힐 때도 동일하게 1→0.

---

## 제약사항 & 주의점

**triggerRect 캡처 타이밍**: `getBoundingClientRect()`를 클릭 시점에 호출해야 한다. `open=true` 이후에 호출하면 오버레이가 이미 렌더링된 뒤라 rect가 오염될 수 있다.

**exit 시 rect 고정**: 닫기 애니메이션은 열릴 때 캡처한 `triggerRect`를 그대로 사용한다. 닫는 시점에 버튼의 위치가 바뀌었더라도 원래 위치로 오므라든다 (의도된 동작).

**드래그와의 관계**: 드래그 dismiss(아래로 드래그 후 놓기) 시에는 clipPath exit가 아닌 drag scale+dim 애니메이션으로 닫힌다. `triggerRect` 모드에서도 드래그 dismiss는 scale 방식으로 동작한다.

**기본 모드와 공존**: `triggerRect` prop이 없으면 기존 scale 모드로 폴백한다. 두 모드는 동일 컴포넌트 내에 조건부로 공존한다.
