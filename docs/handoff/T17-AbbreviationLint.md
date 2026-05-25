# T17. 식별자 약어 금지 린트 가능성 조사

## 개요

import alias/변수명에 약어 사용을 lint로 차단할 수 있는지 조사.

## 배경

- 사례: `Dialog.tsx`에서 `import {Dialog as Rd} from 'radix-ui'` — `Rd` 2글자 약어
- 사용자 review에서 `RadixDialog` 풀네임으로 정정 (직접 commit 차단 못함, hook 통과)
- 현재 `baseRules`의 `id-length`는 min 2. `Rd` 통과.

## 검토할 옵션

1. **`@typescript-eslint/naming-convention` + import selector + custom regex**
   ```js
   {selector: 'import', format: null, custom: {regex: '^.{4,}$', match: true}}
   ```
   - 길이 4글자 이상 강제. `Rd` 차단. `Card`/`Form` 같은 4글자 단어는 통과 (단어 vs 약어 구분 X)
   - 부분적 차단

2. **`unicorn/prevent-abbreviations`**
   - abbreviation dictionary 기반 정밀 차단 + 자동 제안 (`btn` → `button`, `dlg` → `dialog`)
   - 의존성 추가: `eslint-plugin-unicorn`
   - false positive 가능 (`db`, `src`, `id` 등 일반 약어 — `replacements` config 필요)

3. **에러 메시지 커스터마이즈 어려움**
   - `typescript-eslint/naming-convention`은 정형 메시지("must match regex...")만
   - "약어 사용 금지" 같은 커스텀 메시지는 자체 룰 작성 필요

## 작업 단계

1. `typescript-eslint/naming-convention` + import selector 적용 시도
2. 기존 코드 위반 사례 수정 (현재 사례 없음 — `Rd` 이미 `RadixDialog`로 정정)
3. 추가로 `unicorn/prevent-abbreviations` 검토 (false positive 수용 가능 시)
4. `CLAUDE.md`/`convention.md`에 "import alias는 풀네임 사용, 약어 금지" 명시 (룰 + 가이드 병행)

## 관련 파일

- `eslint.config.base.mts`
- `packages/design-system/eslint.config.js`
- `packages/recruitment/eslint.config.js`
- `apps/examples/eslint.config.mjs`

## 미정 항목

- 길이 차단만으로 충분한지 (4글자 단어 통과 수용 여부)
- `unicorn/prevent-abbreviations` 도입 여부 (의존성 + false positive 트레이드오프)
- 자체 ESLint custom rule 작성 가치 (사례가 적으면 비용 대비 효과 낮음)
