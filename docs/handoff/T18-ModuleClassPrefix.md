# T18. 컴포넌트 module.scss 클래스명에 컴포넌트명 접두사 금지

## 개요

컴포넌트의 `.module.scss` 안에서 클래스명에 컴포넌트명 접두사를 붙이지 않는 컨벤션 + 린트 도입.

## 배경

- 이전 design-system Dialog에서 `.dialogContainer`, `.dialogHeader` 같이 컴포넌트명 접두사 사용한 적 있음
- 중복: `Dialog.module.scss` 파일 자체가 Dialog 도메인 명시 → 클래스명에 `dialog` 또 붙이면 redundant
- `styles.container`, `styles.header`만으로 충분 (호출 측에서 `styles.container`가 어떤 컴포넌트인지 import 경로로 명확)
- 현재 design-system에서 이미 접두사 제거됨 (Dialog, Button 등 `.container`, `.body` 등)

## 검토할 옵션

1. **`convention.md`에 룰 추가 (사람 review)**
   - 단순. 신규 컴포넌트 작성 시 PR review 단계에서 확인

2. **stylelint custom rule — 파일명과 클래스명 비교**
   - 파일명 `ComponentName.module.scss` → 클래스명에 `componentname` 또는 `componentName` prefix 차단
   - 자동 검출

3. **stylelint 표준 룰 활용**
   - `selector-class-pattern` regex로 부분 제한 가능. 단 파일명 의존 X — 완벽 X

## 작업 단계

1. `convention.md` 추가 — "컴포넌트명 접두사 금지" 룰 명시 + 예시 (anti-pattern + good pattern)
2. stylelint custom rule 작성 (자동 검출 필요 시):
   - 파일명 추출 → 클래스명 검사
   - 룰 위반 시 에러 메시지 명시
3. 기존 위반 사례 없음 (이미 정비) — 신규 컴포넌트 작성 시 적용

## 관련 파일

- `docs/convention.md`
- `.stylelintrc.json`
- `packages/design-system/src/components/*.module.scss`

## 미정 항목

- stylelint custom rule 작성 vs 사람 review만
- 기존 stylelint plugin 중 활용 가능한 rule 있는지 조사 (`stylelint-selector-bem-pattern` 등)
- BEM 패턴과의 관계 (이번 컨벤션은 BEM의 element 부분과 다름 — 파일명 자체가 block 역할)
