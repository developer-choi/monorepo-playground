# T16. CSS Modules 타입 엄격화 정석 조사

## 개요

design-system의 CSS Module 사용 시 `styles.xxx` 접근의 타입을 엄격화하는 정석 방법 조사. 현재는 wildcard module declaration(`declare module '*.module.scss' { ... }`)으로 모든 클래스명을 자유롭게 접근 가능 — typo 발생 시 컴파일 단계에서 검출 X.

## 배경

- 현재 design-system은 CSS Module(`.module.scss`) 패턴 사용
- 예: `Button.tsx`의 `import styles from './Button.module.scss'`
- `styles.button`, `styles.styled` 등 접근 시 타입 추론 X
- 사용자 입력 오타(`styles.buttom`) — 런타임에 undefined, 빌드 단계 검출 X

## 검토할 옵션

1. **typescript-plugin-css-modules**
   - VSCode/WebStorm/CLI에서 `.module.scss` 자동 파싱
   - `styles.X` 자동완성 + 타입 검사
   - 의존성: `typescript-plugin-css-modules` (devDependency)
   - `tsconfig.json`에 `plugins` 추가

2. **typed-css-modules CLI**
   - `.module.scss` → `.module.scss.d.ts` 자동 생성
   - 빌드 단계에 codegen 단계 추가
   - 생성된 `.d.ts`는 commit X (gitignore 또는 build step)

3. **자체 codegen 스크립트**
   - SCSS 파싱 + `.d.ts` 생성

## 작업 단계

1. 세 옵션의 통합 난이도 비교 (vite, storybook과 호환성)
2. design-system `tsconfig.json`에 plugin 추가
3. 기존 컴포넌트(Button, Spinner, Dialog 등)의 `styles` 접근 타입 검사
4. typo 발견 시 정정

## 관련 파일

- `packages/design-system/tsconfig.json`
- `packages/design-system/src/components/*.module.scss`
- `packages/design-system/src/components/*.tsx`

## 미정 항목

- plugin vs codegen 선택
- storybook과 호환성 검증 필요 (vite-plugin-react/storybook의 CSS Module 처리와 충돌 여부)
- 생성된 `.d.ts`를 gitignore vs commit (CI에서 codegen 강제)
