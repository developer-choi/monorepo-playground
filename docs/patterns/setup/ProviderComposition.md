# Provider Composition

## 상황

React 앱에서 여러 라이브러리의 Provider를 조합할 때 순서와 구성.

## 기술스택

@tanstack/react-query + @radix-ui/themes + overlay-kit + react-toastify

## 순서 원칙

- 데이터 레이어(QueryClientProvider)가 가장 바깥 — 하위 모든 컴포넌트에서 쿼리 사용 가능
- UI 테마(Theme)가 그 안 — 디자인 토큰이 하위 컴포넌트에 적용
- 오버레이(OverlayProvider)가 그 안 — 모달/바텀시트가 테마를 상속
- ToastContainer는 children과 같은 레벨 — 오버레이 안에서 토스트 렌더링

## 코드

```tsx
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {Theme} from '@radix-ui/themes';
import {OverlayProvider} from 'overlay-kit';
import {ToastContainer} from 'react-toastify';
import '@radix-ui/themes/styles.css';
import '@/shared/styles/reset.css';
import '@/shared/styles/global.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
    },
  },
});

export default function AppProvider({children}: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <Theme>
        <OverlayProvider>
          {children}
          <ToastContainer />
        </OverlayProvider>
      </Theme>
    </QueryClientProvider>
  );
}
```

## 참고

- 선택하지 않은 패키지의 Provider는 제외한다 (overlay-kit 안 쓰면 OverlayProvider 빼기)
- `retry: 0` — 채용과제에서는 재시도보다 에러 상태를 명확히 보여주는 것이 유리
