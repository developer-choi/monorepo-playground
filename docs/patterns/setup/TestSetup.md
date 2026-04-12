# Test Setup

## 상황

컴포넌트 단위테스트 환경 구축. Vitest + React Testing Library + jsdom 조합.

## 패키지

패키지 매니저는 프로젝트의 lock 파일 또는 `packageManager` 필드를 확인하고 맞는 명령어를 사용한다.

```bash
npm install -D vitest jsdom @vitejs/plugin-react vite-tsconfig-paths @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event
```

## 설정 파일

### vitest.config.mts

```ts
import {defineConfig} from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  },
});
```

**`vite-tsconfig-paths`를 쓰는 이유:** tsconfig.json의 `paths`와 vitest의 `resolve.alias`를 각각 관리하면, 한쪽만 바꿨을 때 "빌드는 되는데 테스트는 깨지는" 상황이 온다. 플러그인으로 단일 원천 유지.

**`globals: true`를 쓰지 않는 이유:** `describe`, `it`, `expect`를 명시적으로 import한다. 자동완성도 되고, 어디서 온 함수인지 명확하다.

### vitest.setup.ts

```ts
import '@testing-library/jest-dom/vitest';
```

jest-dom 매처를 Vitest에 등록한다. 이게 없으면 `toBeInTheDocument()` 등 DOM 매처를 쓸 수 없다.

### package.json scripts

```json
{
  "test": "vitest"
}
```

`vitest`만 실행하면 watch 모드, `vitest run`이면 단발 실행. lint-staged에서는 `vitest related --run`으로 변경 파일 관련 테스트만 실행한다.

## 컨벤션

### 명시적 import

```ts
import {describe, it, expect, vi} from 'vitest';
```

모든 테스트 파일에서 vitest API를 명시적으로 import한다.
