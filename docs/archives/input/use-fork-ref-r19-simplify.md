# useForkRef React 19 단순화

MUI `useForkRef`([upstream](https://github.com/mui/material-ui/blob/master/packages/mui-utils/src/useForkRef/useForkRef.ts))를 React 19 기준으로 간소화한 기록. 58줄 → 22줄.

`useForkRef`가 **왜 필요한지**(합성 컴포넌트에서 내부 ref + 외부 ref 병합 배경)는 이 문서의 범위가 아니다. 이미 존재하는 병합 훅을 **어떻게 줄였는지**에만 집중한다.

## 배경

원본 MUI `useForkRef`는 **React 18까지 ref callback이 cleanup return을 지원하지 않았기 때문**에 cleanup 추적을 라이브러리 측에서 직접 시뮬레이션해야 했다.

React 18 시절 ref callback의 detach 신호 방식:

- 콜백이 `null`을 인자로 한 번 더 호출됨
- cleanup return이 없으므로, "이전 setup의 정리"를 하려면 함수 본문에서 `if (node) ... else ...` 분기로 직접 처리

`useForkRef`는 여러 ref를 하나로 합치는 wrapper라 자식 ref들의 cleanup을 모아서 detach 시점에 일괄 호출해야 했고, 그래서 다음 트래킹 코드가 필요했다:

- `cleanupRef`로 직전 setup의 cleanup 함수들을 보관
- 외곽 `useMemo` 함수에서 `value === null`이면 직접 cleanup 호출
- 자식 ref가 callback인데 cleanup을 안 주면 `() => refCallback(null)` fallback을 만들어서 React 18 스타일 callback도 detach를 받도록 보장

React 19부터는 ref callback이 cleanup function을 정식 지원한다.
즉 우리가 직접 cleanup을 보관·호출할 필요 없이, **wrapper ref callback 자체가 cleanup을 return하면 React가 detach 시점에 알아서 호출**해준다.

React 공식 문서 원문 ([ref callback](https://react.dev/reference/react-dom/components/common#ref-callback)):

> "React 19 added cleanup functions for `ref` callbacks. To support backwards compatibility, if a cleanup function is not returned from the `ref` callback, `node` will be called with `null` when the `ref` is detached. This behavior will be removed in a future version."

React 19 환경을 전제하면 R18 호환 트래킹 코드를 모두 제거할 수 있다.

### 한 줄 요약

기존 코드는 **우리가** cleanup 상태를 들고 있었다 (`cleanupRef`).
이후 코드는 **React가** 들고 있다.
Step 1·2는 그 소유권 이전, Step 3은 자식 ref에도 같은 규약 전파.

### wrapper return이 React까지 흐르는 경로

외곽 `useMemo`를 제거하고 `refEffect`를 그대로 return한다는 말은, `refEffect`가 곧 `<input ref={여기}>`로 전달되는 callback이 된다는 뜻이다. 그 callback의 시그니처가 R19 규약과 정확히 일치한다:

```
(instance) => {          ← React가 mount 시점에 호출
  ...setup...
  return () => { ... };  → React가 detach 시점에 호출
}
```

즉 wrapper 자체가 R19 규약의 ref callback이 되므로, 외곽에서 cleanup을 별도로 잡아둘 이유가 없다.

## Step 1: 외곽 `useMemo` 함수 제거 → `refEffect`를 직접 return

기존 코드의 마지막 블록:

```ts
return useMemo(() => {
  if (refs.every((ref) => ref == null)) return null;
  return (value: T | null) => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = undefined;
    }
    if (value != null) {
      cleanupRef.current = refEffect(value);
    }
  };
}, refs);
```

이 외곽 함수가 하는 일은 두 가지:

- `value === null`일 때 `cleanupRef.current()`를 직접 호출
- `value !== null`일 때 `refEffect(value)`를 호출하고 그 cleanup을 `cleanupRef`에 보관

**둘 다 React 19가 대신 한다.** ref callback에 instance를 넣어 호출하고, 콜백이 return한 cleanup을 detach 시점에 호출하는 일은 React의 책임.

따라서 외곽 함수 전체를 제거하고 `refEffect`를 직접 return.

## Step 2: `cleanupRef` 제거

`cleanupRef`는 외곽 함수에서 "이전 cleanup 보관 → 다음 호출 때 직접 실행"하기 위해서만 썼다.
Step 1에서 외곽 함수를 제거했으므로 참조하는 곳이 한 군데도 없다.

다음 두 줄을 삭제:

- `import` 문에서 `useRef` 제거
- `const cleanupRef = useRef<(() => void) | undefined>(undefined);`

## Step 3: 자식 ref callback의 fallback 제거

기존:

```ts
const refCleanup: void | (() => void) = refCallback(instance);
return typeof refCleanup === 'function'
  ? refCleanup
  : () => {
      refCallback(null);
    };
```

이 fallback은 **자식 ref가 React 18 스타일 callback**(cleanup return 없이 `null` 재호출 기대)일 때 detach를 받게 해주는 보호 장치였다.
자식이 cleanup을 return하면 그걸 그대로 cleanup으로 등록하고, 안 주면 우리가 `() => refCallback(null)`을 합성해서 호출해주는 방식.

React 19 레포 전제하에 자식 ref callback도 React 19 스타일(cleanup return)이라고 가정하면, fallback 합성 없이 자식의 cleanup return을 그대로 받아 등록하면 된다.

```ts
if (typeof ref === 'function') {
  return ref(instance) ?? undefined;
}
```

자식이 cleanup을 return하지 않으면 그 자식의 detach 처리는 자식 자신의 책임이다.

> 주의: 이 wrapper 안에서 자식 callback을 호출하는 것은 우리이지 React가 아니므로, 자식 callback에 대한 React의 자동 cleanup 호출은 일어나지 않는다.
> 자식 cleanup return이 없으면 detach 시점에 자식 본문이 다시 호출되지 않는다.
>
> 구체적으로:
>
> - 자식 ref가 R19 스타일(`(node) => cleanup`)이면 cleanup return을 그대로 등록 → detach에서 호출됨 ✅
> - 자식 ref가 R18 스타일(`(node) => { /* no return */ }`)이면 `ref(instance)` 한 번 호출로 끝. 자식은 **detach 신호를 받지 못함** ❌
>
> 내부 소비자가 모두 R19 스타일로만 작성되면 문제없다. `useForkRef`를 외부 API로 공개할 경우 — 외부 소비자가 R18 스타일 callback을 넘기면 detach를 놓친다는 점을 README나 JSDoc에 명시하거나, fallback 합성(`() => refCallback(null)`)을 복원해 방어할지 판단 필요.

## Step 4: 시그니처 변화 — `RefCallback<T> | null` → `RefCallback<T>`

Step 1로 외곽 `useMemo`를 제거하면서 `if (refs.every((ref) => ref == null)) return null;` 분기도 함께 사라졌다.
이는 "모든 ref가 null이면 React에 `null`을 넘긴다"는 미세 최적화였는데, 빈 cleanups 배열이 도는 비용이 무시할 수준이라 제거해도 무방하다.

대신 시그니처가 `RefCallback<T> | null` → `RefCallback<T>`로 바뀐다.
소비자 중 결과를 `null` 비교(`if (forkedRef === null) ...`)하는 코드가 없다면 영향 없음.

## Before / After

기존 (58줄):

```ts
'use client';
import {useCallback, useMemo, useRef} from 'react';
import type {Ref, RefCallback} from 'react';

export function useForkRef<T>(...refs: Array<Ref<T> | undefined>): RefCallback<T> | null {
  const cleanupRef = useRef<(() => void) | undefined>(undefined);

  const refEffect = useCallback((instance: T) => {
    const cleanups = refs.map((ref) => {
      if (ref == null) return null;

      if (typeof ref === 'function') {
        const refCallback = ref;
        const refCleanup: void | (() => void) = refCallback(instance);
        return typeof refCleanup === 'function'
          ? refCleanup
          : () => {
              refCallback(null);
            };
      }

      (ref as {current: T | null}).current = instance;
      return () => {
        (ref as {current: T | null}).current = null;
      };
    });

    return () => {
      cleanups.forEach((refCleanup) => refCleanup?.());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, refs);

  return useMemo(() => {
    if (refs.every((ref) => ref == null)) return null;
    return (value: T | null) => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = undefined;
      }
      if (value != null) {
        cleanupRef.current = refEffect(value);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, refs);
}
```

수정 후:

```ts
'use client';
import {useCallback} from 'react';
import type {Ref, RefCallback} from 'react';

export function useForkRef<T>(...refs: Array<Ref<T>>): RefCallback<T> {
  return useCallback((instance: T) => {
    const cleanups = refs.map((ref) => {
      if (ref == null) return undefined;

      if (typeof ref === 'function') {
        return ref(instance) ?? undefined;
      }

      (ref as {current: T | null}).current = instance;
      return () => {
        (ref as {current: T | null}).current = null;
      };
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup?.());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, refs);
}
```

기존 시그니처에서 `Ref<T> | undefined` → `Ref<T>`로 좁혔다.
`Ref<T>` 자체가 `RefObject<T> | RefCallback<T> | null`이라 null은 여전히 허용하지만, 호출자가 `useForkRef(ref1, undefined, ref3)`처럼 명시적 undefined를 섞어 넘기는 케이스는 막는다.

## 왜 `eslint-disable-next-line react-hooks/exhaustive-deps`를 유지하는가

After 코드에 남아있는 한 줄:

```ts
// eslint-disable-next-line react-hooks/exhaustive-deps
return useCallback((instance: T) => { ... }, refs);
```

### 룰의 한계

`react-hooks/exhaustive-deps`는 deps array를 **정적 분석**해서 콜백 본문에서 사용된 외부 변수와 일치하는지 검사한다.
이 분석이 가능한 형태는 **array literal**(`[a, b, c]`)뿐이다.

| 형태            | 룰 동작                                                                  |
| --------------- | ------------------------------------------------------------------------ |
| `}, [a, b, c])` | array literal → 원소 추출해서 검사                                       |
| `}, refs)`      | 변수 → "이 변수에 어떤 원소가 들었는지 정적으로 모름" → 검사 포기 + 경고 |

우리는 deps 자리에 변수 `refs`를 그대로 넘겼기 때문에 룰이 다음 두 경고를 동시에 낸다:

- `was passed a dependency list that is not an array literal` (변수라 분석 불가)
- `has a missing dependency: 'refs'` (분석 불가하니 deps 비어있는 셈인데 본문에서 refs를 쓴다)

### 왜 변수를 deps로 넘겼나

useCallback의 deps array는 **각 원소를 `Object.is`로 개별 비교**한다.
즉 `}, refs)`는 사실상 "deps = refs[0], refs[1], refs[2], ..."로 동작한다.

호출자가 다음처럼 쓰면:

```ts
const ref1 = useRef(null);
const ref2 = useRef(null);
const merged = useForkRef(ref1, ref2);
```

매 렌더마다 `refs` 배열 자체는 새 배열(rest parameter라 매 호출마다 새로 만들어짐)이지만, 그 안의 원소(`ref1`, `ref2`)는 useRef 결과라 **참조가 안정적**이다.
deps 비교가 원소 단위로 이뤄지니 변경 없음으로 판단 → useCallback이 콜백을 메모이즈.

가변 길이라 array literal로 풀어쓸 수 없어서 변수로 넘기는데, 그 결과 룰이 정적 분석을 못 한다.
deps 자리에 변수를 넘긴 그 패턴 자체가 원인이다.

### 대안과 trade-off

| 대안                                          | 장점                                       | 단점                                                                                                                                                   |
| --------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **현 상태**: `}, refs)` + disable             | 호출자 부담 0, 메모이제이션 동작           | disable 한 줄                                                                                                                                          |
| `}, [refs])` + 호출자가 useMemo로 배열 안정화 | 룰 통과, disable 제거                      | 호출자가 매번 `useMemo(() => [ref1, ref2], [ref1, ref2])` 작성 부담                                                                                    |
| useCallback 통째 제거                         | disable·useCallback 모두 사라짐, 코드 최소 | 매 렌더마다 새 함수 → 자식 ref가 매번 detach+attach → 자식이 ref callback에서 부수효과(addEventListener, ResizeObserver 등) setup하면 그게 매번 재실행 |

라이브러리는 자식이 어떻게 쓸지 모르므로 보수적으로 **현 상태(useCallback 유지 + disable 한 줄)가 표준 선택**이다.
MUI 원본 `useForkRef`도 같은 패턴에 같은 disable을 쓴다.

### "R19라서 useCallback이 자동으로 안 붙나?"

붙지 않는다. R19와 자동 메모이제이션은 별개 패키지다.

- `react@19.x` ← 라이브러리. 단순히 npm install
- `babel-plugin-react-compiler` ← 빌드 타임에 useCallback/useMemo/React.memo를 자동 삽입해주는 별도 빌드 플러그인. 따로 설치하고 빌드 설정에 등록해야 함

React Compiler 미도입 환경이라면 useCallback을 자동으로 붙여주는 도구가 없으므로, 메모이제이션을 원하면 사람이 직접 `useCallback`을 써야 하고 → 가변 길이 deps 패턴에 disable이 필요하게 된다.

### 미래 정리 시나리오

React Compiler를 도입하면(`babel-plugin-react-compiler` 추가 + 빌드 설정), useCallback 자체를 컴파일러가 자동으로 끼워주므로 manual `useCallback`을 제거할 수 있다.
그러면 disable도 자동으로 사라진다.
이건 별도 마이그레이션 작업.

## 참고

- React 공식 문서 — ref callback function: https://react.dev/reference/react-dom/components/common#ref-callback
- MUI useForkRef 원본: https://github.com/mui/material-ui/blob/master/packages/mui-utils/src/useForkRef/useForkRef.ts
- React Compiler: https://react.dev/learn/react-compiler
