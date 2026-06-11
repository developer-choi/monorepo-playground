## 배경

ESLint가 TypeScript 코드를 검사하듯, Stylelint는 SCSS 파일의 문법 오류와 안티패턴을 검사합니다. AI가 SCSS를 작성할 때 잘못된 hex 코드, 중복 셀렉터, deprecated된 전역 함수 사용 등을 커밋 시점에 자동으로 차단합니다.

## 설정 구조

`stylelint-config-standard-scss`를 extends하여 표준 SCSS 규칙 세트를 적용합니다. CSS Modules 환경과 충돌하는 네이밍 패턴 규칙들은 오버라이드로 비활성화합니다.

## 경고도 차단

Stylelint는 `--max-warnings 0` 옵션으로 실행합니다 (루트 `stylelint`/`stylelint:fix` 스크립트, lint-staged 모두). severity가 `warning`인 규칙도 실패로 간주됩니다. `test-all`(pre-push)에 `npm run stylelint`가 포함되어 있어, lint-staged 범위를 벗어난 SCSS 변경도 푸시 시점에 전체 검사됩니다.

## 검사 대상 제외

`.stylelintignore`에 `docs`를 두어 문서 폴더를 검사 대상에서 제외합니다. `docs/`는 사람이 직접 작성하는 문서 영역이며 ESLint/tsc 대상도 아니므로, Stylelint도 적용하지 않습니다. 같은 이유로 `scripts/check-file-level-disable.sh`도 `docs/**`를 pathspec에서 제외합니다.

## 오버라이드 규칙

| 규칙                                  | 설정           | 사유                                                                     |
| ------------------------------------- | -------------- | ------------------------------------------------------------------------ |
| `at-rule-disallowed-list: ["import"]` | 추가           | `@import` 사용 금지. Dart Sass가 deprecated한 `@import` 대신 `@use` 강제 |
| `selector-class-pattern`              | `^[a-z][a-zA-Z0-9]*$` | CSS Modules 클래스명 camelCase 강제. `:global()` 안의 외부 라이브러리 클래스는 `stylelint-disable-next-line` + 사유 주석으로 예외 처리 |
| `selector-pseudo-class-no-unknown`    | `:global` 허용 | CSS Modules의 `:global` pseudo-class 허용                                |
| `scss/at-mixin-pattern`               | `^_?[a-z][a-zA-Z0-9]*$` | mixin 이름 camelCase 강제 (예: `flexCenter`). `_` prefix는 SCSS private 관례로 허용 (예: `_apply`) |
| `scss/dollar-variable-pattern`        | `^_?[a-z][a-zA-Z0-9]*$` | 변수 이름 camelCase 강제 (예: `$colorPrimary`). `_` prefix는 SCSS private 관례로 허용 |
| `scss/at-function-pattern`            | `^_?[a-z][a-zA-Z0-9]*$` | function 이름 camelCase 강제 (예: `safeMapGet`). `_` prefix는 SCSS private 관례로 허용 |
| `scss/at-use-no-unnamespaced`         | `true`         | `@use 'foo' as *;` 금지. namespace prefix 강제(`color.$X` 형태)로 변수 출처를 명시 |
| `scss/at-use-no-redundant-alias`      | `true`         | alias가 default namespace와 같으면 차단 (`@use 'typography' as typography`). 의미 없는 alias 방지 |
| `monorepo-playground/at-use-no-short-alias` | `true`   | 4글자 미만 alias 차단 (`as t`, `as typ`). custom plugin(`stylelint-plugins/at-use-no-short-alias.mjs`). default namespace 사용 또는 의미 있는 이름 강제 |
| `value-keyword-case`                  | `null`         | SCSS map 키를 CSS 키워드로 오인하는 false positive 방지                  |

## declaration-strict-value

하드코딩된 색상·수치를 변수 사용으로 강제하는 플러그인입니다. 색상·여백뿐 아니라 사이징 속성(`width`, `height`, `min-width`, `min-height`, `max-width`, `max-height`), 간격 속성(`gap`, `row-gap`, `column-gap`), 레이어 속성(`z-index`)도 대상에 포함하여, `max-width: 480px`이나 `z-index: 1300` 같은 매직넘버를 차단합니다. 토큰화된 z-index map(예: `$zIndexes`)이나 CSS 변수만 통과합니다.

### 주요 설정 포인트

| 옵션                                  | 값      | 이유                                                                |
| ------------------------------------- | ------- | ------------------------------------------------------------------- |
| `ignoreFunctions`                     | `false` | 기본값 `true`면 `rgb()`, `rgba()` 등 색상 함수 전부 통과            |
| `ignoreValues`에 `/^var\(/`           | regex   | `ignoreFunctions: false`가 `var()`도 차단하므로 regex로 별도 허용   |
| `expandShorthand` + `recurseLonghand` | `true`  | `border: 1px solid #111`에서 색상(`#111`)만 잡고 width/style은 무시 |
| 속성 목록에 border 계열 미포함        | —       | `/color$/`가 분해된 `border-color`를 잡으므로 중복 검사 방지        |
| `ignoreValues`에 `100%`               | 문자열  | 구조적 레이아웃 값(`width: 100%`)은 디자인 토큰이 아니므로 허용     |
| `ignoreValues`에 `/^calc\(/`          | regex   | `calc()` 표현식은 의도적 계산이므로 허용                            |

### 도입 히스토리

처음에는 `stylelint-declaration-strict-value`의 두 가지 한계 때문에 커스텀 Stylelint 플러그인(JS)을 직접 작성했습니다.

- **`ignoreFunctions` all-or-nothing** — `false`로 설정하면 `rgb()`뿐 아니라 `calc()`, `clamp()`, `min()`, `max()`까지 모두 차단됩니다. 색상 함수만 선별 차단할 수 없습니다
- **longhand 없는 shorthand 미분해** — `box-shadow`, `text-shadow`는 대응하는 longhand가 없어서 `expandShorthand`가 작동하지 않습니다. 첫 토큰만 검사하고 나머지(rgba, named color 등)는 통과합니다

커스텀 플러그인은 `postcss-value-parser`로 모든 토큰을 개별 순회하여 이 문제를 해결했으나, JS 파일 직접 관리 부담이 발생했습니다. npm 정식 플러그인으로 전환하고 shadow 속성의 한계는 수용하기로 결정했습니다.

### 수용하는 한계

`box-shadow`, `text-shadow`에서 하드코딩된 색상을 감지하지 못합니다.

```scss
// 미감지 — 첫 토큰(0)이 ignoreValues에 해당하여 전체 통과
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

// 미감지 — 첫 토큰(1px)만 에러, 뒤의 red는 검사하지 않음
text-shadow: 1px 1px 2px red;
```

shadow 속성은 속성 목록에 포함하되, 잡을 수 있는 케이스(단일 값, 변수 없이 하드코딩)만 기대합니다.

## declaration-property-value-disallowed-list — SCSS 변수 raw 값 금지

`declaration-strict-value`는 **CSS 속성 값**만 검사하므로, `$gap: 12px; margin: $gap`처럼 **SCSS 변수에 raw 값을 담아 우회**하면 잡지 못합니다 (값 자리에 `$gap`이라는 변수 참조가 와서 통과). 이 세탁을 막기 위해, SCSS 변수(`$`) 선언의 값에 raw px·색(`px`, `#`, `rgb`, `hsl`)이 들어가면 차단합니다.

```json
"declaration-property-value-disallowed-list": [
  {"/^\\$/": ["/px/", "/^#/", "/rgb/", "/hsl/"]},
  {"message": "..."}
]
```

- **토큰이 있는 값** → `var(--...)`을 직접 쓴다 (`$gap: 12px` → `gap: var(--spacing-grid-gap)`).
- **컴포넌트 전용 일회성 값** (Dialog `$dialogMaxWidth`·`$paperShadow`, 타이포 스케일 `$typography` 맵 등 [DesignTokens.md](../../packages/design-system/docs/patterns/DesignTokens.md)의 "공통화 불가 → 로컬 SCSS 변수" 정책에 해당) → `stylelint-disable + 사유`로 명시적으로 예외 처리한다. 이 disable이 "의도된 일회성"임을 드러내는 표식이 되어, 토큰이어야 할 값을 변수로 세탁하는 것과 구분된다.

> 이 룰은 "토큰 값과 정확히 일치하는 것만 막기"(brittle한 토큰값 나열)가 아니라 "raw 값은 전부 막고 일회성은 disable로 증명"하는 방식이다. lint가 의도(토큰화 대상 vs 일회성)를 자동 판별할 수 없어, 후자를 택했다.

## 미도입 규칙과 사유

| 규칙                       | 미도입 사유                                                              |
| -------------------------- | ------------------------------------------------------------------------ |
| `declaration-no-important` | `!important`가 필요한 정당한 케이스 존재 (예: `-webkit-line-clamp` 트릭) |
