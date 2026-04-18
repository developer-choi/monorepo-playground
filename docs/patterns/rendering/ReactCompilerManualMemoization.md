# React Compiler — 수동 메모이제이션 금지

React Compiler가 활성화된 프로젝트에서는 `useCallback`·`useMemo`·`React.memo`를 수동으로 사용하지 않는다. 컴파일러가 렌더링마다 참조 동일성을 자동으로 보장한다.

## 적용 범위

- `useCallback` — 컴파일러가 함수 참조를 자동 보존
- `useMemo` — 컴파일러가 파생 값 계산을 자동 메모이제이션
- `React.memo` — 컴파일러가 Props 비교 후 렌더 스킵을 자동 처리

공식 문서 기준: "you can safely remove `React.memo` from your components when using React Compiler" — [react.dev/reference/react/memo](https://react.dev/reference/react/memo).

## 활성화 확인

React 19에서도 React Compiler는 기본 활성화가 아니다. 작업 전 프로젝트 설정을 확인한다.

- Next.js: `next.config.js`의 `experimental.reactCompiler: true` (또는 `reactCompiler: true`)
- Vite: `vite.config.ts`에 `babel-plugin-react-compiler` 플러그인 등록
- Babel 직접 사용: `babel-plugin-react-compiler`

활성화 여부가 불확실하면 `useCallback`/`useMemo`/`React.memo`를 제거하기 전에 빌드 설정을 먼저 확인한다.

## 예외

다음 경우에는 `React.memo`·`useCallback`·`useMemo`를 여전히 사용할 수 있다.

- **컴파일러가 적용되지 않은 서드파티 컴포넌트**를 래핑하여 리렌더를 막고 싶을 때 `React.memo`로 감싸는 경우
- **커스텀 비교 함수**(`React.memo`의 두 번째 인자)가 필요한 경우 — 컴파일러는 shallow 비교만 자동 처리
- **의존성 배열 세밀 제어가 필요한 극소수 케이스**

```tsx
// ✅ 서드파티 컴포넌트 래핑 + 커스텀 비교 함수
function LegacyThirdPartyComponent({label}: {label: string}) {
  return <span>{label}</span>;
}

const MemoizedLegacy = memo(LegacyThirdPartyComponent, (prev, next) => prev.label === next.label);
```

## Before / After

```tsx
// ❌ Before — 수동 메모이제이션
import {memo, useCallback, useMemo} from 'react';

const ExpensiveList = memo(function ExpensiveList({items, onSelect}: Props) {
  const sorted = useMemo(() => items.sort((a, b) => a.name.localeCompare(b.name)), [items]);
  return (
    <ul>
      {sorted.map((item) => (
        <li key={item.id} onClick={() => onSelect(item.id)}>
          {item.name}
        </li>
      ))}
    </ul>
  );
});

function Parent({items}: {items: Item[]}) {
  const handleSelect = useCallback((id: number) => {
    console.log(id);
  }, []);
  return <ExpensiveList items={items} onSelect={handleSelect} />;
}

// ✅ After — 컴파일러가 자동 처리
function ExpensiveList({items, onSelect}: Props) {
  const sorted = items.sort((a, b) => a.name.localeCompare(b.name));
  return (
    <ul>
      {sorted.map((item) => (
        <li key={item.id} onClick={() => onSelect(item.id)}>
          {item.name}
        </li>
      ))}
    </ul>
  );
}

function Parent({items}: {items: Item[]}) {
  const handleSelect = (id: number) => {
    console.log(id);
  };
  return <ExpensiveList items={items} onSelect={handleSelect} />;
}
```
