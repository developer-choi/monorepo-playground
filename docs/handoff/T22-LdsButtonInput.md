# T22. AC 백로그: LDS Button/Input을 MP design-system에 반영

## 개요

LDS(블로그 디자인 시스템, 사용자가 직접 작성)에서 만든 Button/Input 컴포넌트를 MP `packages/design-system`에 도입.

## 배경

- LDS는 사용자가 직접 개발한 컴포넌트 라이브러리 (`~/WebstormProjects/my-else/forworkchoe/packages/core`)
- 현재 MP design-system에 Button 있음 (LDS Button 참고로 신규 작성, `isSubmit` 제외)
- LDS의 `ButtonLink`/`ImageButton`/`ImageLink`는 MP에 없음
- LDS Input은 MP에 없음

## 작업 단계

1. **LDS Button 코드 확인 + spec 비교**
   - `~/WebstormProjects/my-else/forworkchoe/packages/core/src/components/element/Button/index.tsx`
   - 현재 MP Button과 비교 (variant/size/color/loading)
   - `ButtonLink`/`ImageButton`/`ImageLink` 도입 여부 검토

2. **LDS Input 코드 확인 + MP에 도입**
   - 위치: `~/WebstormProjects/my-else/forworkchoe/packages/core/src/components/element/` 하위
   - Input은 신규 추가

3. **convention 적용**
   - `convention.md`: 마크업/시각 분리 (`.X` / `.X.styled`)
   - `FolderStructure.md`: 플랫 PascalCase 파일 (`Button.tsx` + `Button.module.scss`)
   - `ControlsPanel.md`: stories Controls 정합성 (variant/size/color는 Controls 토글, fixed 상태는 별도 story + argTypes hide)

4. **design-tokens.css에 필요한 토큰 추가/조정**
   - LDS의 color (primary/secondary/edit/delete) → MP color (primary/secondary/destructive) 매핑
   - `edit`, `delete`는 MP의 `secondary`/`destructive`로 통합 가능

## 관련 파일

- **MP (현재)**: `packages/design-system/src/components/Button.tsx`, `Button.module.scss`, `Button.stories.tsx`
- **LDS**: `~/WebstormProjects/my-else/forworkchoe/packages/core/src/components/element/Button/`
- **LDS Input 위치 확인 필요**: `~/WebstormProjects/my-else/forworkchoe/packages/core/src/components/element/`
- `packages/design-system/src/styles/design-tokens.css`

## 미정 항목

- MP Button과 LDS Button 통합 vs 갈아엎기 (현재 MP Button은 LDS 참고로 작성, `isSubmit` 제거 등 변경)
- `ButtonLink`/`ImageButton`/`ImageLink` 도입 여부
- design-system color 토큰(primary/secondary/destructive)과 LDS color 매핑 (LDS는 `edit`/`delete` 등 사용)
- Input 컴포넌트 spec — radix 사용 vs 직접 작성
- LDS의 SCSS mixin 패턴 (`cursorByState`, `buttonSize`, `colorSet` 등)을 MP에 적용 여부
