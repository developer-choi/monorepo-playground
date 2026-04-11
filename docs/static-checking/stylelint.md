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

## 미도입 규칙과 사유

| 규칙                                 | 미도입 사유                                                              |
| ------------------------------------ | ------------------------------------------------------------------------ |
| `declaration-no-important`           | `!important`가 필요한 정당한 케이스 존재 (예: `-webkit-line-clamp` 트릭) |
| `stylelint-declaration-strict-value` | 색상/font-size 하드코딩 금지. 디자인 토큰 체계 정비 후 도입 예정         |
