# Provider Composition

## 상황

React 앱에서 여러 라이브러리의 Provider를 조합할 때 순서와 구성.

## 기술스택

@tanstack/react-query + overlay-kit + sonner

> UI는 radix-ui(primitives)를 쓴다. primitives는 unstyled standalone이라
> ThemeProvider가 없다 — Provider 조합에 UI 테마 레이어가 끼지 않는다.

## 순서 원칙

- 데이터 레이어(QueryClientProvider)가 가장 바깥 — 하위 모든 컴포넌트에서 쿼리 사용 가능
- 오버레이(OverlayProvider)가 그 안 — 모달/바텀시트 렌더링
- Toaster는 children과 같은 레벨 — 오버레이 안에서 토스트 렌더링

## 코드

```tsx
import {useState} from 'react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {OverlayProvider} from 'overlay-kit';
import {Toaster} from 'sonner';
import '@/shared/styles/reset.css';
import '@/shared/styles/global.css';

export default function AppProvider({children}: PropsWithChildren) {
  // [ai-only] https://tanstack.com/query/v5/docs/framework/react/guides/ssr#initial-setup
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 0,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <OverlayProvider>
        {children}
        <Toaster />
      </OverlayProvider>
    </QueryClientProvider>
  );
}
```

## 참고

- 선택하지 않은 패키지의 Provider는 제외한다 (overlay-kit 안 쓰면 OverlayProvider 빼기)
- UI는 radix-ui(primitives)라 ThemeProvider가 없다 — 디자인 토큰은 reset.css/global.css(또는 scss)로 직접 관리한다 (themes처럼 Provider로 주입하지 않음)
- `retry: 0` — 채용과제에서는 재시도보다 에러 상태를 명확히 보여주는 것이 유리
- TanStack Query를 도입하면 `@tanstack/eslint-plugin-query`도 함께 설치한다. ESLint 설정은 `docs/static-checking/eslint.md` 참고
