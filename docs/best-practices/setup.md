---
keywords: [폴더 구조, DDD, 셋업, 프로젝트 초기 세팅, commitlint, prettier, typescript-eslint, stylelint, husky, lint-staged, reset.css, Provider Composition, react-query, overlay-kit, sonner, 컴포넌트 단위테스트, Vitest, React Testing Library, jsdom, Next.js Root Layout, Google Fonts]
---

# Best Practices — 셋업

## 폴더 구조

### DDD 기반 폴더 구조

- 상황: 채용과제·사이드 프로젝트에서 일관된 폴더 구조와 파일 네이밍 적용
- 코드: docs/patterns/folder-structure/FolderStructure.md

## 셋업

### 프로젝트 초기 세팅

- 기술스택: commitlint + prettier + typescript-eslint + stylelint + husky + lint-staged
- 상황: 채용과제·사이드 프로젝트 초기 세팅
- 코드: docs/patterns/setup/ProjectSetup.md

### reset.css

- 상황: 채용과제 프로젝트에 reset.css 추가. 브라우저 기본 스타일 제거 + 폼 요소·input 타입별 초기화·box-sizing 등 커스텀 리셋 포함
- 코드: docs/patterns/setup/ResetCss.md

### Provider Composition

- 기술스택: @tanstack/react-query + overlay-kit + sonner (UI는 radix-ui primitives — ThemeProvider 없음)
- 상황: React 앱에서 여러 라이브러리 Provider 조합 시 순서와 구성. QueryClient 기본 옵션 포함. reset.css import 포함
- 코드: docs/patterns/setup/ProviderComposition.md

### 컴포넌트 단위테스트 환경

- 기술스택: Vitest + React Testing Library + jsdom + vite-tsconfig-paths
- 상황: 컴포넌트 단위테스트 환경 구축. 패키지 선택, 설정 파일, 컨벤션(명시적 import, 파일 위치)
- 코드: docs/patterns/setup/TestSetup.md

### Next.js Root Layout — Google Fonts

- 기술스택: Next.js App Router + next/font/google
- 상황: 디자인 시안에 별도 폰트 지정이 없을 때, Noto Sans KR을 기본 폰트로 적용
- 코드: docs/patterns/setup/NextRootLayout.md
