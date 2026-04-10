## 배경

ESLint가 TypeScript 코드를 검사하듯, Stylelint는 SCSS 파일의 문법 오류와 안티패턴을 검사합니다. AI가 SCSS를 작성할 때 잘못된 hex 코드, 중복 셀렉터, deprecated된 전역 함수 사용 등을 커밋 시점에 자동으로 차단합니다.

## 설정 구조

`.stylelintrc.json`에 모든 규칙을 정의합니다. `stylelint-config-standard-scss`를 extends하지 않고, `postcss-scss`로 SCSS 파싱만 활성화한 뒤 필요한 규칙만 개별 등록합니다. 이유: standard config의 기본 규칙(kebab-case 강제, hex 축약 강제 등)이 현재 코드베이스와 충돌하므로, 합의된 규칙만 명시적으로 넣습니다.

## 규칙 목록

| 규칙                                        | 목적                                                                                                  |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `at-rule-disallowed-list: ["import"]`       | `@import` 사용 금지. Dart Sass가 deprecated한 `@import` 대신 `@use`를 강제                            |
| `color-no-invalid-hex`                      | `#fff00z` 같은 잘못된 hex 코드 차단                                                                   |
| `declaration-block-no-duplicate-properties` | 같은 선언 블록 내 속성 중복 방지                                                                      |
| `no-duplicate-selectors`                    | 같은 셀렉터가 파일 내에서 중복 정의되는 것을 방지                                                     |
| `property-no-unknown`                       | `colr: red` 같은 CSS 속성 오타 차단                                                                   |
| `scss/no-global-function-names`             | `lighten()`, `nth()` 등 전역 함수 금지. `color.adjust()`, `list.nth()` 등 모듈 네임스페이스 사용 강제 |

## 미도입 규칙과 사유

| 규칙                                 | 미도입 사유                                                              |
| ------------------------------------ | ------------------------------------------------------------------------ |
| `declaration-no-important`           | `!important`가 필요한 정당한 케이스 존재 (예: `-webkit-line-clamp` 트릭) |
| `stylelint-declaration-strict-value` | 색상/font-size 하드코딩 금지. 디자인 토큰 체계 정비 후 도입 예정         |
| `no-descending-specificity`          | CSS Modules 환경에서 클래스 해시로 충돌 가능성이 낮아 실효성 부족        |
