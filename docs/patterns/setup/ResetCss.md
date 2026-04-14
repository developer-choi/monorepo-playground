# reset.css

## 상황

채용과제 프로젝트에서 브라우저 기본 스타일을 제거한다. 채용과제에서 reset.css를 제공하지 않거나, 제공하더라도 커스텀 리셋(폼 요소, input 타입별 초기화, box-sizing 등)이 빠져 있으므로 직접 추가한다.

## 파일 위치

`src/shared/styles/reset.css`에 배치하고, AppProvider에서 import한다.

```tsx
// AppProvider.tsx
import '@/shared/styles/reset.css';
```

import 순서와 전체 Provider 구성은 `docs/patterns/setup/ProviderComposition.md` 참조.

## 코드

[CRITICAL] `packages/design-system/src/styles/reset.css` — 이 파일을 그대로 복사한다.
