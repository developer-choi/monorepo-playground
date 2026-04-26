# FullScreenBottomSheet 키보드 오픈 시 Content 스크롤 버그 디버깅

## 증상

키보드가 열린 상태에서 Content 영역의 p 태그를 드래그해도 스크롤이 되지 않는다.
DisableDragArea로 감싼 영역은 스크롤 된다.

## 테스트 환경

- 위치: `test-playground/src/app/fsbs/`
- 로컬 컴포넌트 복사본: `test-playground/src/components/FullScreenBottomSheet/`

---

## 했더니 됐던 것

| 시도                                           | 결과              |
| ---------------------------------------------- | ----------------- |
| `Dialog.Content` + `Dialog.Overlay` 둘 다 제거 | 전체 스크롤 됨    |
| `Dialog.Root modal={false}`                    | 전체 스크롤 됨    |
| p 태그를 DisableDragArea로 감싸기              | 그 안만 스크롤 됨 |

---

## 했는데 안 됐던 것

| 시도                                                        | 결과              |
| ----------------------------------------------------------- | ----------------- |
| framer-motion `drag` prop 제거                              | 여전히 안 됨      |
| CSS `.container { touch-action: none }` 제거                | 여전히 안 됨      |
| `.dragArea { overflow: hidden }` 제거                       | 여전히 안 됨      |
| `Dialog.Content` 제거 (Overlay는 있음)                      | 전체 스크롤 안 됨 |
| `Dialog.Overlay asChild` 제거                               | 여전히 안 됨      |
| Content에 `touch-action: pan-y` CSS                         | 여전히 안 됨      |
| Content에 `touch-action: auto` inline                       | 여전히 안 됨      |
| Content에 `onPointerDown` stopPropagation                   | 여전히 안 됨      |
| Content에 `onPointerDown` + `onPointerMove` stopPropagation | 여전히 안 됨      |
| Content에 `maxHeight` (visualViewport 기반)                 | UI 깨짐           |

---

## 근본 원인

### 범인: `react-remove-scroll` v2.7.2

Radix Dialog의 `modal={true}` (기본값)이 활성화하는 `react-remove-scroll` 패키지가 스크롤을 차단한다.

**react-remove-scroll이란:**

모달이 열렸을 때 모달 뒤의 페이지 스크롤을 차단하는 라이브러리다. document 전체에 touchmove 리스너를 걸어서, 허용된 영역 외의 스크롤을 `preventDefault()`로 막는다.

Radix Dialog는 `modal={true}`(기본값)일 때 `Dialog.Overlay` 안에서 이 라이브러리를 활성화한다. ([dialog.tsx:206](https://github.com/radix-ui/primitives/blob/main/packages/react/dialog/src/dialog.tsx#L206))

**실행 흐름 (소스 직접 확인):**

**① document에 touchmove 리스너 등록**

[`SideEffect.tsx:187-188`](https://github.com/theKashey/react-remove-scroll/blob/v2.7.2/src/SideEffect.tsx#L187-L188)

```ts
document.addEventListener('touchmove', shouldPrevent, nonPassive);
// nonPassive = { passive: false }
```

`passive: false`가 핵심이다. [MDN addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#using_passive_listeners)에 따르면:

> 이벤트에 기본 동작이 있으면(예: 스크롤), 브라우저는 이벤트 리스너가 끝날 때까지 기본 동작을 시작할 수 없다. 리스너가 `preventDefault()`를 호출하여 기본 동작을 취소할지 미리 알 수 없기 때문이다.

touchmove의 기본 동작은 스크롤이다. `passive: false`를 선언하면 브라우저가 리스너 실행이 끝날 때까지 스크롤을 보류한다. 리스너 안에서 `preventDefault()`가 호출되면 → 스크롤 취소. 호출 안 되면 → 스크롤 실행.

최신 브라우저는 touchmove의 기본 passive 값이 `true`(성능 최적화)다. 명시적으로 `false`를 넘기지 않으면 `preventDefault()`가 무시된다.

**② shouldPrevent — 차단 여부 판정 + 실행**

사용자가 화면 어디를 터치해서 드래그하든, document에 등록된 `shouldPrevent`가 실행된다.

[`SideEffect.tsx:139-153`](https://github.com/theKashey/react-remove-scroll/blob/v2.7.2/src/SideEffect.tsx#L139-L153)

```ts
if (!sourceEvent) {
  // RemoveScroll 자식 트리 바깥에서 온 이벤트
  const shardNodes = (lastProps.current.shards || [])
    .map(extractRef)
    .filter(Boolean)
    .filter((node) => node.contains(event.target));

  const shouldStop =
    shardNodes.length > 0
      ? shouldCancelEvent(event, shardNodes[0]) // shard 안이면 → 판정
      : !lastProps.current.noIsolation; // shard도 아니면 → 무조건 차단

  if (shouldStop) {
    if (event.cancelable) {
      event.preventDefault(); // ← 스크롤 차단
    }
  }
}
```

Radix Dialog는 Content를 `shards`에 등록한다([dialog.tsx:206](https://github.com/radix-ui/primitives/blob/main/packages/react/dialog/src/dialog.tsx#L206): `shards={[context.contentRef]}`). 그래서 Content 안의 이벤트는 `shouldCancelEvent`로 판정된다.

**③ shouldCancelEvent → locationCouldBeScrolled — 높이 비교**

[`SideEffect.tsx:85-89`](https://github.com/theKashey/react-remove-scroll/blob/v2.7.2/src/SideEffect.tsx#L85-L89)

```ts
let canBeScrolledInMainDirection = locationCouldBeScrolled(moveDirection, target);

if (!canBeScrolledInMainDirection) {
  return true; // "차단해야 함"
}
```

`locationCouldBeScrolled`는 event.target부터 DOM을 위로 탐색하며 스크롤 가능한 요소를 찾는다:

[`handleScroll.ts:25-49`](https://github.com/theKashey/react-remove-scroll/blob/v2.7.2/src/handleScroll.ts#L25-L49)

```ts
do {
  const isScrollable = elementCouldBeScrolled(axis, current);
  if (isScrollable) {
    const [, scrollHeight, clientHeight] = getScrollVariables(axis, current);
    if (scrollHeight > clientHeight) {
      return true; // 스크롤 가능한 요소 찾음
    }
  }
  current = current.parentNode;
} while (current && current !== ownerDocument.body);

return false; // 못 찾음
```

`overflow: auto/scroll`이면서 `scrollHeight > clientHeight`인 요소를 찾으면 → `true`(스크롤 허용). 못 찾으면 → `false` → `shouldCancelEvent`가 `true`("차단") 리턴 → `preventDefault()` → 스크롤 안 됨.

**우리 케이스에서의 실행 흐름:**

```
사용자가 Content 안의 p태그를 드래그
→ touchmove 발생
→ shouldPrevent 실행
  → Content는 shard → shouldCancelEvent 호출
    → locationCouldBeScrolled('v', p태그) 호출
      → p태그: overflow visible → 패스
      → Content div: overflow-y auto → 후보!
        → scrollHeight(500) === clientHeight(500) → 넘치지 않음 → 패스
      → body까지 올라감 → 스크롤 가능한 요소 없음
      → return false
    → canBeScrolledInMainDirection = false
    → return true ("차단해야 함")
  → shouldStop = true
  → event.preventDefault()
→ 브라우저가 스크롤을 실행하지 않음
```

Content에 `overflow-y: auto`가 있지만 키보드가 올라와도 Content div의 CSS 높이는 줄어들지 않는다. `scrollHeight === clientHeight`이므로 react-remove-scroll은 "스크롤할 게 없다"고 판단하고 차단한다.

---

### stopPropagation이 효과 없는 이유

React의 `onPointerMove`에서 `stopPropagation`을 호출해도 효과가 없는 이유는 두 가지다:

- `touchmove`와 `pointermove`는 **별개의 이벤트 스트림**이다. `pointermove`의 stopPropagation은 `touchmove` 리스너에 영향을 주지 않는다.
- `shouldPrevent`는 `document`에 직접 등록된 네이티브 리스너다. React의 synthetic event `stopPropagation`은 React 이벤트 시스템 내부의 전파만 막을 뿐, document에 직접 등록된 네이티브 리스너를 막지 못한다.

### DisableDragArea가 작동하는 이유

DisableDragArea는 `touch-action: auto` inline style을 가진다. 브라우저는 이 터치를 네이티브 스크롤 제스처로 인식하고 `touchmove`를 `cancelable: false`로 발행한다. `react-remove-scroll`이 `event.cancelable` 체크 후 `preventDefault()`를 호출하지만 무시된다.

```tsx
// FullScreenBottomSheetDisableDragArea.tsx
style={{ touchAction: 'auto', ...style }}
```

브라우저는 DisableDragArea의 조상 중 실제로 스크롤 가능한 Content div를 찾아 스크롤한다. **DisableDragArea 자체가 스크롤되는 게 아니라 Content가 스크롤된다.**

### Content 직속 p태그가 안 되는 이유

Content는 `overflow-y: auto`를 가진 scroll container다. `scrollHeight === clientHeight`이면 (키보드가 열려도 container 높이가 layout viewport 기준이라 안 줄어듦) 브라우저는 이 scroll container를 "스크롤 불가"로 판단하고 `touchmove`를 `cancelable: true`로 발행한다. `react-remove-scroll`의 `preventDefault()` 성공 → 차단.

```scss
// FullScreenBottomSheet.module.scss
.body {
  overflow-y: auto; // scroll container이지만 콘텐츠가 짧으면 scrollHeight === clientHeight
}
```

---

## 해결책

### `modal={false}` + body overflow 수동 처리

```tsx
// FullScreenBottomSheet.tsx
useEffect(() => {
  if (!open) return;
  document.body.style.overflow = 'hidden';
  return () => {
    document.body.style.overflow = '';
  };
}, [open]);

// Dialog.Root
<Dialog.Root modal={false} ...>

// container에 aria-modal 수동 추가
<motion.div aria-modal="true" ...>
```

**왜 동작하는가:**

- `modal={false}` → `react-remove-scroll` 비활성화 → touchmove capture 리스너 없음
- `body overflow: hidden` → CSS만으로 배경 스크롤 차단
- Content의 `overflow-y: auto` → 자연스럽게 내부 스크롤 동작

**기존 `touch-action: auto` 방식 대비 장점:**

|                 | touch-action: auto 방식 | modal={false} 방식 |
| --------------- | ----------------------- | ------------------ |
| Content 스크롤  | 됨                      | 됨                 |
| pull-to-refresh | 발생                    | 없음               |
| 코드 복잡도     | 높음                    | 낮음               |

**`modal={false}` 손실 항목:**

- focus trap 비활성화 → 키보드 Tab으로 배경 접근 가능
- `aria-modal` 자동 설정 안 됨 → `aria-modal="true"` 수동 추가로 보완
- 배경 pointer events 차단 안 됨 → Backdrop이 전체화면을 덮으므로 실질적 문제 없음

---

# 3차 버그: iOS에서 `useKeyboardIsOpen`이 항상 false

## 증상

아이폰에서 키보드를 열어도 `keyboardIsOpen`이 `false`로 유지된다.
결과적으로 `drag='y'`가 해제되지 않아 Content 스크롤 시 시트가 닫혀버린다.

## 확인 방법

`test-playground/src/app/fsbs/page.tsx`에 디버그 뱃지를 추가해 `visualViewport.height`(vvp)와 `window.innerHeight`(win) 수치를 실시간으로 화면에 표시.

- Android: 키보드 열면 `vvp`만 줄고 `win`은 유지됨 → 비율 차이 발생 → `keyboardIsOpen=true`
- iOS: 키보드 열면 `vvp`와 `win` 둘 다 같이 줄어듦 → 비율 ~1.0 유지 → `keyboardIsOpen=false`

## 근본 원인

`src/components/FullScreenBottomSheet/useKeyboardIsOpen.ts:14`

```ts
setIsOpen(visualViewport.height < window.innerHeight * 0.8);
//                                  ^^^^^^^^^^^^^^^^^^
//                                  동적으로 계속 바뀌는 값
```

iOS Safari는 `window.innerHeight`가 visual viewport를 그대로 반영한다. 키보드가 열리면 `window.innerHeight`도 함께 줄어들기 때문에, 두 값의 비율이 항상 ~1.0으로 유지된다. Visual Viewport API 자체는 iOS에서 정상 동작하지만, **비교 기준값도 같이 움직이기 때문에 차이가 감지되지 않는다.**

Android Chrome은 `window.innerHeight`가 layout viewport로 고정되어 키보드가 열려도 변하지 않는다.

## 해결책

`useEffect` 진입 시점(키보드가 열리기 전)에 `window.innerHeight`를 한 번만 캡처해 고정 기준값으로 사용한다.

```ts
// src/components/FullScreenBottomSheet/useKeyboardIsOpen.ts
useEffect(() => {
  const visualViewport = window.visualViewport;
  if (!visualViewport) return;

  const initialHeight = window.innerHeight; // mount 시점에 캡처 — 이후 키보드 열려도 변하지 않음

  const handleResize = debounce(() => {
    setIsOpen(visualViewport.height < initialHeight * 0.8);
  }, 100);

  visualViewport.addEventListener('resize', handleResize);
  return () => visualViewport.removeEventListener('resize', handleResize);
}, []);
```

---

# 4차 버그: iOS에서 키보드 열린 상태로 아래 드래그 시 pull-to-refresh 발생

## 증상

안 넘치는 컨텐츠 케이스에서, 키보드를 열고 Content 영역을 위→아래로 드래그하면 iOS에서만 pull-to-refresh가 발생한다. Android는 정상.

## 근본 원인

iOS PTR은 `touch-action` CSS로 막을 수 없다. WKWebView 네이티브 레벨에서 동작하기 때문이다.

`touchmove` 이벤트의 `cancelable` 속성으로 제어 가능 여부를 판단할 수 있다.

- `cancelable=true`: 브라우저가 아직 제스처를 커밋하지 않은 상태. `preventDefault()` 호출 가능.
- `cancelable=false`: 브라우저가 이미 네이티브 제스처를 가져간 상태. `preventDefault()` 무효.

디바이스 로그로 확인한 실제 이벤트 흐름:

```
[doc/touchstart] cancelable=true target=div touch-action=auto
[doc/touchmove]  cancelable=true  ← 딱 하나. 이 시점에만 개입 가능
[content] onPointerCancel — browser took over
[doc/touchmove]  cancelable=false ← 이후 전부 false, PTR 발생
[doc/touchmove]  cancelable=false
...
```

첫 번째 `touchmove`가 `cancelable=true`인 동안 브라우저는 아직 커밋하지 않은 상태다. 이 시점에 `preventDefault()`를 호출하면 PTR을 막을 수 있다. 그러나 이미 `cancelable=false`가 된 이후에는 불가능하다.

`touch-action: none`, `touch-action: pan-y` 등 CSS 속성으로는 PTR을 막을 수 없음을 실제 테스트로 확인했다.

## 해결책

시트가 열릴 때 `html` 요소에 `overscroll-behavior: none`을 JS로 적용하고, 닫힐 때 복구한다.

`src/components/FullScreenBottomSheet/FullScreenBottomSheet.tsx` — `useBodyScrollLock` 훅

```tsx
function useBodyScrollLock(open: boolean) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overscrollBehavior = 'none'; // iOS PTR 차단
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overscrollBehavior = '';
    };
  }, [open]);
}
```

**왜 동작하는가:**

- `overscroll-behavior: none`은 브라우저가 overscroll 제스처(PTR, elastic bounce)를 처리하지 않도록 한다
- `html` 요소에 적용하면 페이지 전체 레벨에서 PTR이 차단된다
- 시트가 열린 동안만 적용하고 닫힐 때 복구하므로 전역 영향 없음
- Android는 `body.overflow: hidden` 상태에서 PTR이 발생하지 않으므로 이 설정이 불필요하지만, 적용해도 드래그 동작에 영향 없음 (Android는 overscroll-behavior를 다르게 처리함)

**검증 환경**: iOS Safari, test-playground/src/app/fsbs

---

# 5차 버그: Android에서 오버플로우 Content 스크롤 맨 위에서 아래 드래그 시 pull-to-refresh 발생

## 증상

오버플로우 컨텐츠가 있는 시트에서, Content를 맨 위까지 스크롤한 뒤 아래로 드래그하면 Android에서 pull-to-refresh가 발생한다. iOS는 4차 버그 해결책으로 이미 막혀 있다.

## 근본 원인

소비자 앱의 전역 CSS에 `html, body { height: 100% }` 제약이 없으면 `html`이 스크롤 루트가 된다. Content가 넘치는 상태에서 맨 위에서 overscroll이 발생하면, 브라우저가 상위 스크롤 컨테이너(`html`)로 스크롤을 전파하고 Android PTR을 트리거한다.

`html { height: 100% }`가 있는 소비자 앱(예: test-playground)은 `html`이 뷰포트에 고정되어 스크롤 불가 → overscroll 전파 없음 → PTR 안 발생.
`html { height: 100% }`가 없는 소비자 앱(예: langdy-student-v3)은 `html`이 스크롤 루트 → overscroll 전파 → PTR 발생.

## 해결책

4차 버그 해결책으로 이미 적용된 `document.documentElement.style.overscrollBehavior = 'none'`이 Android PTR도 함께 차단한다. 별도 수정 불필요.

```tsx
useEffect(() => {
  if (!open) return;
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overscrollBehavior = 'none'; // iOS + Android PTR 모두 차단
  return () => {
    document.body.style.overflow = '';
    document.documentElement.style.overscrollBehavior = '';
  };
}, [open]);
```

## 주의: 로컬 복사본 사용 시

LDS 컴포넌트를 직접 사용하면 fix가 자동으로 적용된다. 컴포넌트를 로컬에 복사해서 사용하는 경우 이 useEffect 코드가 누락될 수 있으며, 이 경우 소비자 앱의 전역 CSS 환경에 따라 Android PTR이 발생한다.

---

# 2차 버그: Content 영역 드래그 닫기 불가

## 증상

스크롤 버그 수정 후 새로 발생. 앱에서 AppBar는 아래로 드래그하면 정상 닫히는데, Content 영역은 드래그해도 닫히지 않음. 살짝 내려가다가 원위치로 돌아옴.

## 근본 원인

### `touch-action: pan-y` → `pointercancel` → 드래그 취소

Content에 `touch-action: pan-y`(또는 `auto`)가 설정되면, 브라우저가 해당 터치를 네이티브 스크롤 제스처로 인식한다. 브라우저가 제스처를 가져가는 순간 `pointercancel`이 발생하고, framer-motion이 드래그를 중단한다. 그 결과 motion.div가 스프링 스냅백으로 원위치로 돌아온다.

### `.dragArea { overflow: hidden }` 포맷팅 컨텍스트 격리

framer-motion은 `drag='y'` 시 컨테이너에 `touch-action: pan-x`를 설정한다. 그런데 `.dragArea { overflow: hidden }`이 새 포맷팅 컨텍스트 경계를 만들기 때문에, 컨테이너의 `touch-action`이 Content 내부 요소에 상속되지 않는다. Content에 명시적으로 `touch-action`을 지정해야 한다.

### `stopPropagation`이 효과 없는 이유

`touch-action`은 이벤트 핸들러가 아니라 CSS 속성이다. `onPointerDown/Move`에서 `stopPropagation`을 해도 브라우저가 이미 `touch-action` CSS를 보고 제스처 처리 방식을 결정한 이후라 무효다.

## 시도했던 것

| 시도                                         | 결과                                      |
| -------------------------------------------- | ----------------------------------------- |
| Content `onPointerDown/Move` stopPropagation | 여전히 `pointercancel` 발생               |
| `touch-action: auto` on Content              | 브라우저 제스처 가져감 → 닫기 불가        |
| `touch-action: pan-y` on Content             | 브라우저 제스처 가져감 → 닫기 불가        |
| `touch-action: none` on Content (고정)       | 드래그 닫기 됨, 키보드 열리면 스크롤 불가 |

## 해결책

`isContentOverflowing`은 Content div의 `scrollHeight > clientHeight`를 ResizeObserver로 감시해 계산한다.

```tsx
// FullScreenBottomSheetContent.tsx
const ref = useRef<HTMLDivElement>(null);
const [isContentOverflowing, setIsContentOverflowing] = useState(false);
const keyboardIsOpen = useKeyboardIsOpen();

useEffect(() => {
  const element = ref.current;
  if (!element) return;
  const check = () => setIsContentOverflowing(element.scrollHeight > element.clientHeight);
  check();
  const observer = new ResizeObserver(check);
  observer.observe(element);
  return () => observer.disconnect();
}, []);

// ...

<div
  ref={ref}
  style={{ touchAction: isContentOverflowing || keyboardIsOpen ? 'pan-y' : 'none' }}
  onPointerDown={isContentOverflowing ? (e) => e.stopPropagation() : undefined}
  onPointerMove={isContentOverflowing ? (e) => e.stopPropagation() : undefined}
>
```

| 조건                  | `touch-action` | 결과                                                         |
| --------------------- | -------------- | ------------------------------------------------------------ |
| 안 넘침 + 키보드 닫힘 | `none`         | framer-motion이 드래그 처리 → 닫기 동작                      |
| 넘침                  | `pan-y`        | 브라우저가 스크롤 처리, stopPropagation으로 시트 드래그 차단 |
| 키보드 열림           | `pan-y`        | 브라우저가 스크롤 처리 (drag={false}이므로 시트 드래그 없음) |

TP 검증 완료 (커밋: `b5c9355`, `test/scroll` 브랜치)

---

## 주의: `touch-action` 조건 제거 시 드래그 닫기 파괴

`touch-action: none`을 안 넘침 케이스에서 없애거나, `pan-y`/`auto`를 무조건 적용하면 **드래그 닫기가 동작하지 않는다.**

### 증상

안 넘치는 컨텐츠에서 아래로 드래그하면, 시트가 살짝 내려갔다가 원위치로 돌아온다. `onClose`가 호출되지 않는다.

### 원인

`touch-action: pan-y`(또는 `auto`)가 Content에 적용되면, 브라우저가 해당 터치를 네이티브 스크롤 제스처로 인식하고 가져간다. 브라우저가 제스처를 가져가는 순간 `pointercancel`이 발생하고, framer-motion이 드래그를 즉시 중단한다. `pointercancel` 이후 motion.div는 스프링 스냅백으로 원위치로 돌아온다.

`pointercancel`이 발생하면 드래그 오프셋/속도가 임계값에 도달하기 전에 드래그가 끝나버리므로, `isDragThresholdExceeded`가 항상 false가 되어 `onClose`가 호출되지 않는다.

### `touch-action: none`이 드래그를 가능하게 하는 이유

`touch-action: none`은 브라우저에게 "이 터치 제스처를 네이티브로 처리하지 말고 JS에 전부 넘겨라"라고 지시한다. 브라우저가 개입하지 않으므로 `pointercancel`이 발생하지 않고, framer-motion이 pointer event를 끝까지 수신하여 드래그를 완주한다.

### `.dragArea { overflow: hidden }`이 상속을 차단하는 이유

framer-motion은 `drag='y'` 시 컨테이너(`motion.div`)에 `touch-action: pan-x`를 설정한다. 그러나 `.dragArea { overflow: hidden }`이 새 포맷팅 컨텍스트 경계를 만들기 때문에, 컨테이너의 `touch-action`이 Content 내부 요소까지 상속되지 않는다. Content에 `touch-action: none`을 명시적으로 지정하지 않으면, Content 하위 요소는 브라우저 기본 touch-action을 따르게 되고 위에서 설명한 `pointercancel` 문제가 발생한다.

### `stopPropagation`만으로는 부족한 이유

`stopPropagation`은 JS 이벤트 버블링을 막는다. 반면 `touch-action`은 JS 이벤트 처리 이전에 브라우저가 제스처 처리 방식을 결정하는 CSS 속성이다. `touch-action: pan-y`가 설정된 상태에서 `pointercancel`이 발생하면, 그 시점에서 JS 이벤트 자체가 취소되므로 `stopPropagation`이 개입할 여지가 없다.
