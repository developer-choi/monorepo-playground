---
keywords: [컴포넌트 설계, atomic, 프레젠테이션 컴포넌트, 접근성, 시맨틱 마크업, a, Link, form, 오버레이, overlay-kit, 모달, 다이얼로그, 스토리북, Storybook, Controls 패널, 매트릭스 스토리, 디자인 시스템, 디자인 토큰]
---

# Best Practices — 컴포넌트 · UI

## 컴포넌트 설계

### 프레젠테이션 컴포넌트 atomic 분리

- 상황: 아이콘·상태 표시처럼 한 prop 값에 따라 여러 모양을 그려야 하는 프레젠테이션 컴포넌트를 만들 때
- 코드: docs/patterns/component/AtomicPresentationComponent.md

## 접근성 / 시맨틱

### 시맨틱 마크업 — a/Link, form 요소 선택

- 기술스택: Next.js(Link) + 기본 HTML
- 상황: 페이지 이동 UI에 `<a>`/`<Link>` + `href`를 사용(버튼·div + onClick 금지). 입력 영역은 `<form>`/`<fieldset>`/`<legend>`/`<input>`/`<label>`로 구성하여 키보드·스크린 리더·브라우저 기본 동작과 호환되게 한다
- 코드: apps/examples/docs/patterns/accessibility/SemanticElements.md

## 오버레이

### overlay-kit 기반 모달 / 다이얼로그

- 기술스택: overlay-kit
- 상황: 모달·다이얼로그·Alert를 `useState` boolean 대신 `overlay.open`/`overlay.openAsync`로 명령형 호출. 결과값이 필요하면 `openAsync`로 Promise를 await. OverlayProvider는 ProviderComposition에서 세팅
- 코드: apps/examples/docs/patterns/overlay/OverlayKitModal.md

## 스토리북

### Controls 패널 — render 반영 원칙

- 기술스택: Storybook
- 상황: 스토리 작성 시 Controls 패널에 노출된 prop을 render가 사용하지 않으면 토글해도 화면이 안 바뀐다. args / argTypes / render 사이의 정합성 처리
- 코드: docs/patterns/storybook/ControlsPanel.md

### prop 조합 시각 검증 — 매트릭스 스토리

- 기술스택: Storybook + Chromatic
- 상황: variant×color×size처럼 시각 prop 조합이 많은 컴포넌트의 시각 회귀를 스토리로 다룰 때. 개별 스토리 분리 vs 한 스토리 격자 렌더 선택
- 코드: docs/patterns/storybook/PropMatrix.md

## 디자인 시스템

### 디자인 토큰 출처·운영

- 기술스택: CSS
- 상황: packages/design-system 내부에서 색·여백·폰트·radius·shadow 값을 토큰화할 때. fg/bg 명명 정책으로 통일, 회색조 톤은 blog 레퍼런스에서 출발
- 코드: packages/design-system/docs/patterns/DesignTokens.md
