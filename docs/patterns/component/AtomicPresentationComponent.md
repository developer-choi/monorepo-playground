# 프레젠테이션 컴포넌트 atomic 분리

아이콘·상태 표시처럼 그릴 수 있는 모양이 여러 가지인 프레젠테이션 단위는 **변종마다 atomic 컴포넌트로 분리**한다. 한 컴포넌트가 `status` 같은 prop으로 여러 변종의 마크업(svg path 등)을 내부 분기로 내장하면, 개별 변종을 다른 곳에서 재사용할 수 없고 단일 책임이 깨진다.

## 원칙

- **변종 하나 = 컴포넌트 하나.** 그릴 수 있는 모양이 N가지면 atomic 컴포넌트 N개로 나눈다. 하나의 컴포넌트 안에 prop 값으로 svg path·요소 구조를 분기해 넣지 않는다.
- **무엇을 그릴지의 분기는 호출처가 보유.** atomic 컴포넌트는 "지금 어떤 상태인지" 모른다. 어떤 변종을 렌더할지는 도메인을 아는 호출처가 결정한다.
- **색·크기는 부모가 주입.** atomic 컴포넌트 자체에 색을 박지 않는다. `currentColor`로 두고 색·크기는 부모가 className(CSS)으로 주입한다.

## 적용 신호

- prop 이름이 `type`·`status`·`variant`이고 그 값에 따라 **마크업 자체**(svg path, 요소 구조)가 갈린다 → 분리 신호.
- 같은 마크업에서 **클래스·텍스트만** 달라지는 경우는 분리 대상이 아니다. 그건 prop 하나로 충분하다.

## Before / After

```tsx
// ❌ Before — 한 컴포넌트가 status로 svg path와 색을 분기 내장
type Status = 'ok' | 'error' | 'warn' | 'unavailable';

function StatusIcon({status}: {status: Status}) {
  switch (status) {
    case 'ok':
      return (
        <svg fill="none" stroke="green" viewBox="0 0 24 24">
          <path d="M5 13l4 4L19 7" />
        </svg>
      );
    case 'error':
      return (
        <svg fill="none" stroke="red" viewBox="0 0 24 24">
          <path d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    // warn, unavailable — 분기 계속 누적
  }
}

// 호출처는 status만 넘긴다 — CheckIcon만 따로 재사용할 방법이 없다.
<StatusIcon status={status} />
```

```tsx
// ✅ After — atomic 아이콘 N개 + 호출처가 분기 + 색은 부모 주입
import type {ComponentProps, ReactNode} from 'react';

function CheckIcon(props: ComponentProps<'svg'>) {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ExclamationIcon(props: ComponentProps<'svg'>) {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

// WarningIcon, DashedCircleIcon — 동일 형태로 각각 분리

// 호출처가 "무엇을 그릴지" 분기를 보유. 색은 className으로 주입한다.
const STATUS_ICON: Record<Status, ReactNode> = {
  ok: <CheckIcon className={styles.ok} />,
  error: <ExclamationIcon className={styles.error} />,
  warn: <WarningIcon className={styles.warn} />,
  unavailable: <DashedCircleIcon className={styles.unavailable} />,
};

function StatusBadge({status}: {status: Status}) {
  return <span className={styles.badge}>{STATUS_ICON[status]}</span>;
}
```

`CheckIcon`은 이제 status 맥락과 무관하게 어디서나 단독으로 쓸 수 있고, 색은 쓰는 쪽이 정한다. status → 아이콘 매핑은 도메인을 아는 호출처에만 존재한다.
