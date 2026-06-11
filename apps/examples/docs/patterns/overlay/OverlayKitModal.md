# overlay-kit 기반 모달 / 다이얼로그

모달·다이얼로그·Alert·Confirm은 컴포넌트 내부의 `useState` boolean으로 제어하지 않고, [overlay-kit](https://overlay-kit.slash.page/)의 `overlay.open`/`overlay.openAsync`를 명령형으로 호출한다.

## 원칙

- **❌ Bad** — `useState` boolean으로 표시 여부를 관리
  - 부모 컴포넌트에 모달 상태·핸들러 로직이 누적되어 관심사가 섞인다
  - 모달이 여러 개가 되면 boolean이 기하급수적으로 늘어난다
  - 결과값(확인/취소)을 콜백 props로 전달해야 하므로 핸들러가 파편화된다
- **✅ Good** — `overlay.open` / `overlay.openAsync`를 핸들러 내부에서 호출
  - 모달 렌더링 로직이 부모 트리에서 분리된다
  - `openAsync`는 Promise를 반환하므로 결과값(확인/취소)을 `await`로 받아 선형 흐름을 유지할 수 있다

## 사전 조건

OverlayProvider는 루트에 이미 세팅되어 있다. 상세는 `docs/patterns/setup/ProviderComposition.md` 참조.

## Bad / Good

```tsx
// ❌ Bad — useState boolean으로 확인 모달 제어
function BadConfirmDeleteButton({onConfirm}: {onConfirm: () => void}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>삭제</button>
      {open && (
        <Confirm
          onConfirm={() => {
            setOpen(false);
            onConfirm();
          }}
          onCancel={() => setOpen(false)}
        />
      )}
    </>
  );
}

// ✅ Good — overlay.openAsync로 결과값을 await
function GoodConfirmDeleteButton({onConfirm}: {onConfirm: () => void}) {
  const handleClick = async () => {
    const confirmed = await overlay.openAsync<boolean>(({isOpen, close}) => (
      <Confirm isOpen={isOpen} onConfirm={() => close(true)} onCancel={() => close(false)} />
    ));
    if (confirmed) onConfirm();
  };
  return <button onClick={handleClick}>삭제</button>;
}
```

## overlay.open vs overlay.openAsync

- `overlay.open` — 결과값이 필요 없는 경우 (Alert, Toast성 모달)
- `overlay.openAsync<T>()` — 결과값(확인/취소, 입력값)을 Promise로 받아야 할 때

```tsx
// ✅ overlay.open — 결과값 없이 Alert 표시
function GoodAlertButton() {
  const handleClick = () => {
    overlay.open(({isOpen, close}) => (
      <div role="alertdialog" aria-modal="true" hidden={!isOpen}>
        <p>저장되었습니다.</p>
        <button onClick={() => close()}>확인</button>
      </div>
    ));
  };
  return <button onClick={handleClick}>저장</button>;
}
```
