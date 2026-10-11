모듈 문법, import 경계, 파일·폴더 이름과 위치를 정하는 규칙입니다. 따로 적지 않은 규칙은 `eslint.config.base.mts`의 `baseRules`에 있습니다. 제목 끝에 `— examples`가 붙은 규칙은 `apps/examples` config에만 있습니다.

## CJS 금지 (`@typescript-eslint/no-require-imports` + `no-restricted-syntax`)

프로젝트는 전부 ESM이므로 CJS 문법을 차단합니다. `require()`는 전용 룰 `@typescript-eslint/no-require-imports`로(호출식과 `import x = require()` TS 문법 모두 잡음), `module.exports`·`exports.X`는 `no-restricted-syntax` 셀렉터로 금지합니다. 룰은 워크스페이스 소스(`apps/`·`packages/`)만 검사하므로, 불가피하게 CJS가 필요한 설정 파일은 `.cjs` 확장자로 분리하면 lint 대상에서 빠져 걸리지 않습니다.

```typescript
// ❌
const fs = require('node:fs');
module.exports = {foo};
exports.bar = bar;

// ✅
import fs from 'node:fs';
export {foo};
export const bar = bar;
```

## `no-restricted-imports` — 내부 barrel(`index`) import 금지

`**/index`, `**/index.ts`, `**/index.tsx`로 끝나는 import 경로를 패턴으로 차단합니다. 디렉토리별 `index.ts`(barrel)을 만들어 묶어서 re-export하는 패턴은 tree shaking 방해, 순환 의존, 빌드 성능 저하의 원인이 되므로 사용을 금지합니다.

```typescript
// ❌ 내부 barrel
import {Button} from './components/index';
import {Button} from '@/components';   // ./components/index.ts를 가리킴

// ✅ 직접 import
import {Button} from './components/Button';
import {Button} from '@/components/Button';

// ✅ 패키지 entry는 alias로 통과 — packages/design-system/src/index.ts는 패키지의 public API라 예외
import {Button} from '@developer-choi/design-system';
```

패키지 entry(예: `packages/design-system/src/index.ts`)는 외부 사용자가 `import {X} from '@scope/pkg'`로 접근하는 진입점이라 alias를 통해 통과합니다. 내부 디렉토리별 barrel만 금지합니다.

## `custom/filename-export-convention` (커스텀 룰)

`src/` 하위에서 **컴포넌트(PascalCase)·훅(`use*`) export가 정확히 하나인 파일**은 파일명(첫 `.` 이전)에 **kebab-case(하이픈)·snake_case(언더스코어)를 쓸 수 없습니다** — PascalCase(컴포넌트) 또는 camelCase(훅)여야 합니다. 컴포넌트·훅이 0개거나 2개 이상(여러 컴포넌트를 묶은 모듈)이면 검사하지 않습니다.

파일명과 심볼명의 **정확한 일치는 요구하지 않습니다** — 검사하는 건 casing뿐입니다. 따라서 컨텍스트 기반 단일 단어 파일명(`client.tsx`에 훅 하나 등)은 허용됩니다. casing만 보는 `check-file`로는 "컴포넌트/훅이 몇 개인지"를 판정할 수 없어 `eslint.config.base.mts`에 AST 룰로 구현하고 3개 워크스페이스에 공통 적용합니다.

제외 대상:

- `src/` 밖 파일 (루트 `*.config.*`, `.storybook/` 등 도구 설정 파일)
- Next.js App Router 규약 파일 (`page`, `layout`, `error`, `not-found` 등 — 프레임워크가 파일명을 고정)
- `*.test.*`, `*.spec.*`, `*.stories.*`, `*.d.ts`

```tsx
// ❌ 단일 컴포넌트인데 kebab 파일명
// some-component.tsx
export function SomeComponent() { ... }

// ❌ 단일 훅인데 kebab 파일명
// use-some-hook.ts
export function useSomeHook() { ... }

// ✅ 단일 컴포넌트는 PascalCase, 단일 훅은 camelCase
// SomeComponent.tsx → export function SomeComponent
// useSomeHook.ts    → export function useSomeHook

// ✅ 여러 컴포넌트를 묶으면 kebab 파일명 + named export (컴포넌트 2개 이상 → 무검사)
// buttons.tsx
export function PrimaryButton() { ... }
export function SecondaryButton() { ... }
```

## `check-file/folder-naming-convention` — 워크스페이스별

`eslint-plugin-check-file` 도입. 폴더 네이밍을 워크스페이스 성격에 맞게 강제합니다.

| 워크스페이스        | 패턴                                         | 의도                                                            |
| ------------------ | -------------------------------------------- | --------------------------------------------------------------- |
| `apps/examples`    | `src/**/*` → `NEXT_JS_APP_ROUTER_CASE`       | Next.js 동적 라우트(`[id]`, `[...slug]`) 자동 인정 + 그 외 kebab-case |
| `design-system`    | `src/**/*` → `KEBAB_CASE`                    | 모든 폴더 kebab. 카테고리 폴더(`data-display` 등)도 묶음 서브폴더(`feedback/modal`)도 전부 kebab — PascalCase 폴더는 어느 깊이에서든 막힌다. |

`src/**/*` 한 패턴으로 깊이 제한 없이 재귀 검사하므로 카테고리(depth 1)뿐 아니라 묶음 서브폴더(`feedback/modal`, depth 2 이하)까지 kebab을 강제합니다. 컴포넌트는 카테고리 폴더 안에 플랫 파일로 두고, 폴더는 관련 컴포넌트를 둘 이상 묶을 때만 만들며 그 묶음 폴더도 kebab으로 둡니다([convention.md](../../convention.md)의 폴더 구조 참고).

## `custom/app-route-file-whitelist` (커스텀 룰) — examples

`src/app/` 라우트 폴더에는 Next.js 라우트 파일(page·layout·route·error 등)만 허용합니다. ARCHITECTURE.md의 **app↔src 1:1 매칭** 규칙을 강제해, 데모 컴포넌트·훅을 라우트 폴더에 병치하는 실수를 차단합니다 (실제로 form 카테고리 데모들이 병치돼 있다가 수동 발견·이동된 사례에서 도입).

`src/app/api/` (Route Handler 구역)는 `dto.ts` 같은 보조 모듈이 필요해 예외입니다.

```
// ❌  src/app/form/auto-focus/AutoFocusDemo.tsx   (라우트 폴더에 데모 병치)
// ✅  src/form/auto-focus/components/AutoFocusDemo.tsx  + app에는 page.tsx만
```

## `import/no-restricted-paths` — shared 도메인 경계

설정 위치: `templates/recruitment/eslint/eslint.config.base.mjs` (채용과제 템플릿 전용). MP는 모노레포라 `src/shared` 규약이 없어 이 경계가 성립하지 않으므로 MP 원본에는 없습니다.

`src/shared`는 도메인 무관이라는 불변식을 강제합니다. shared 파일이 `src` 내부에서 shared 외(도메인·app)를 import하면 에러입니다.

```js
zones: [{target: './src/shared', from: './src', except: ['./shared']}]
```

`except`가 `from` 기준 상대경로라 도메인 폴더가 늘어도 설정은 그대로입니다. 도입 계기는 채용과제(2026-07-14)에서 공용 컴포넌트 `src/shared/components/StatusBadge.tsx`가 `import type {UiStatus} from '@/reservation/schema'`로 도메인 타입을 끌어쓰고 예약 전용 라벨까지 하드코딩했는데 tsc·eslint가 전부 통과하고 리뷰어가 수동 발견한 사고입니다.

`settings`의 `import/resolver`(eslint-import-resolver-typescript)는 필수입니다. 이 룰은 import 문자열이 아니라 **해석된 실경로**로 판정하므로, resolver가 없으면 `.tsx`를 못 찾아 alias(`@/...`)뿐 아니라 상대경로까지 전부 미해석으로 빠지고 룰이 조용히 0건이 됩니다(2026-07-20 실측: settings 제거 시 위반 2건이 exit 0).
