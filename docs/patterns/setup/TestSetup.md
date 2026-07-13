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
    restoreMocks: true,
  },
});
```

**`vite-tsconfig-paths`를 쓰는 이유:** tsconfig.json의 `paths`와 vitest의 `resolve.alias`를 각각 관리하면, 한쪽만 바꿨을 때 "빌드는 되는데 테스트는 깨지는" 상황이 온다. 플러그인으로 단일 원천 유지.

**`globals: true`를 쓰지 않는 이유:** `describe`, `it`, `expect`를 명시적으로 import한다. 자동완성도 되고, 어디서 온 함수인지 명확하다.

**`restoreMocks: true`를 쓰는 이유:** `vi.spyOn`/`vi.mock`으로 건 목이 매 테스트 후 자동 복원되어 테스트 간에 새지 않는다. 이게 없으면 개별 테스트마다 `afterEach(() => vi.restoreAllMocks())`를 수동으로 넣어야 하고, 빠뜨리면 목이 leak되어 "혼자선 통과, 같이 돌리면 실패"하는 헷갈리는 실패가 난다. Vitest 공식 [Writing Tests with AI](https://vitest.dev/guide/learn/writing-tests-with-ai.html)의 *Common Pitfalls*가 AI 생성 테스트의 단골 함정으로 지목하며 이 옵션을 권장한다. (MSW 핸들러 리셋 `server.resetHandlers()`는 목이 아니라 별개 메커니즘이라 restoreMocks가 커버하지 않는다 — 그건 [MswSetup](./MswSetup.md)에서 setup 파일에 따로 건다.)

### vitest.setup.ts

```ts
import '@testing-library/jest-dom/vitest';
import {afterEach} from 'vitest';
import {cleanup} from '@testing-library/react';

afterEach(() => {
  cleanup();
});
```

`import '@testing-library/jest-dom/vitest'`로 jest-dom 매처를 Vitest에 등록한다. 이게 없으면 `toBeInTheDocument()` 등 DOM 매처를 쓸 수 없다.

**`afterEach(() => cleanup())`가 필요한 이유:** RTL은 `globals: true`일 때만 매 테스트 후 마운트한 DOM을 자동으로 정리한다. 우리는 `globals: false`(명시적 import)라 자동 정리가 안 걸리므로, 이 `afterEach(cleanup)`을 setup에 직접 깔아야 한다. 없으면 이전 테스트가 렌더한 DOM이 다음 테스트까지 남아 `getByRole` 등이 중복 매칭되거나 엉뚱한 요소를 잡는다.

### package.json scripts

```json
{
  "test": "vitest"
}
```

`vitest`만 실행하면 watch 모드, `vitest run`이면 단발 실행. 에이전트·CI 환경에선 프로세스가 안 끝나지 않게 항상 `--run`을 명시한다. 우리 가드는 pre-commit의 lint-staged가 `vitest related --run`으로 변경 파일 관련 테스트만 돌리고, pre-push(`test-all`)가 `turbo run test -- --run`으로 전체를 1회 돌린다.

## 컨벤션

### 명시적 import

```ts
import {describe, it, expect, vi} from 'vitest';
```

모든 테스트 파일에서 vitest API를 명시적으로 import한다.
