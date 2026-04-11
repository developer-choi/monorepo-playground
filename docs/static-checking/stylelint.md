## 배경

ESLint가 TypeScript 코드를 검사하듯, Stylelint는 SCSS 파일의 문법 오류와 안티패턴을 검사합니다. AI가 SCSS를 작성할 때 잘못된 hex 코드, 중복 셀렉터, deprecated된 전역 함수 사용 등을 커밋 시점에 자동으로 차단합니다.

## 설정 구조

`stylelint-config-standard-scss`를 extends하여 표준 SCSS 규칙 세트를 적용합니다. CSS Modules 환경과 충돌하는 네이밍 패턴 규칙들은 오버라이드로 비활성화합니다.

## 오버라이드 규칙

| 규칙                                  | 설정           | 사유                                                                     |
| ------------------------------------- | -------------- | ------------------------------------------------------------------------ |
| `at-rule-disallowed-list: ["import"]` | 추가           | `@import` 사용 금지. Dart Sass가 deprecated한 `@import` 대신 `@use` 강제 |
| `selector-class-pattern`              | `null`         | CSS Modules에서 camelCase 클래스명 사용                                  |
| `selector-pseudo-class-no-unknown`    | `:global` 허용 | CSS Modules의 `:global` pseudo-class 허용                                |
| `scss/at-mixin-pattern`               | `null`         | camelCase mixin 이름 허용                                                |
| `scss/dollar-variable-pattern`        | `null`         | camelCase 변수 이름 허용                                                 |
| `scss/at-function-pattern`            | `null`         | camelCase 함수 이름 허용                                                 |
| `value-keyword-case`                  | `null`         | SCSS map 키를 CSS 키워드로 오인하는 false positive 방지                  |

## declaration-strict-value

하드코딩된 색상·수치를 변수 사용으로 강제하는 플러그인입니다.

### 주요 설정 포인트

| 옵션                                  | 값      | 이유                                                                |
| ------------------------------------- | ------- | ------------------------------------------------------------------- |
| `ignoreFunctions`                     | `false` | 기본값 `true`면 `rgb()`, `rgba()` 등 색상 함수 전부 통과            |
| `ignoreValues`에 `/^var\(/`           | regex   | `ignoreFunctions: false`가 `var()`도 차단하므로 regex로 별도 허용   |
| `expandShorthand` + `recurseLonghand` | `true`  | `border: 1px solid #111`에서 색상(`#111`)만 잡고 width/style은 무시 |
| 속성 목록에 border 계열 미포함        | —       | `/color$/`가 분해된 `border-color`를 잡으므로 중복 검사 방지        |

### 도입 히스토리

처음에는 `stylelint-declaration-strict-value`의 두 가지 한계 때문에 커스텀 Stylelint 플러그인(JS)을 직접 작성했습니다.

1. **`ignoreFunctions` all-or-nothing** — `false`로 설정하면 `rgb()`뿐 아니라 `calc()`, `clamp()`, `min()`, `max()`까지 모두 차단됩니다. 색상 함수만 선별 차단할 수 없습니다
2. **longhand 없는 shorthand 미분해** — `box-shadow`, `text-shadow`는 대응하는 longhand가 없어서 `expandShorthand`가 작동하지 않습니다. 첫 토큰만 검사하고 나머지(rgba, named color 등)는 통과합니다

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

## 미도입 규칙과 사유

| 규칙                       | 미도입 사유                                                              |
| -------------------------- | ------------------------------------------------------------------------ |
| `declaration-no-important` | `!important`가 필요한 정당한 케이스 존재 (예: `-webkit-line-clamp` 트릭) |
