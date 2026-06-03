# Best Practices Map

> 이 파일을 수정하기 전에 AC `deploy/contexts/placement.md`(글로벌 분업 정책)를 본다. 추가하려는 내용이 KA·AC로 가야 할 콘텐츠인지 먼저 판단한다.

## 작성 규칙

각 항목은 `### 제목` 헤딩 + 다음 라인들로 구성한다.

- `- 기술스택: ...` (선택, 기술 의존이 있을 때)
- `- 상황: ...` (필수)
- `- 코드: ...` (필수, 상세 패턴 파일 경로)

**상황 작성**: 이 패턴이 필요한 문제 맥락·페이지·작업 단계 위주로 적는다. 본문에서 다루는 **결정 기준·분기 조건·정답**(독자가 본문을 읽기 전에 결론이 노출되는 정보)은 적지 않는다.

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

## 스키마 설계

### 원본 스키마 → CRUD·필터·목록 타입 파생

- 기술스택: zod
- 상황: 하나의 도메인에서 생성·수정·목록·상세·필터 타입이 파생될 때, 제약(min/max)을 중복 선언하지 않고 .pick/.extend로 동기화
- 코드: apps/examples/docs/patterns/validation/ZodSchemaDesign.md

### enum 값·라벨 단일 원천 관리

- 기술스택: zod
- 상황: enum 값을 Select/Radio 순회, 테이블 라벨 조회, z.enum() 전달에 공유할 때. createLabelMap으로 {value, label}[] 하나에서 세 형태를 파생
- 코드: apps/examples/docs/patterns/validation/ZodSchemaDesign.md

### z.infer로 스키마에서 타입 추론

- 기술스택: zod
- 상황: API 요청/응답 타입을 별도 interface 없이 스키마에서 파생. 스키마 변경 시 타입이 자동 동기화
- 코드: apps/examples/docs/patterns/validation/ZodSchemaDesign.md

### nullable()로 API 계약 명시

- 기술스택: zod
- 상황: 백엔드가 undefined가 아닌 명시적 null을 요구할 때. optional()과 nullable()의 차이를 코드로 명시
- 코드: apps/examples/docs/patterns/validation/ZodSchemaDesign.md

## 폼 핸들링

### use[...]Form 커스텀 훅

- 기술스택: react-hook-form + tanstack query
- 상황: 폼이 있는 페이지에서 폼 로직을 컴포넌트에서 분리할 때
- 코드: apps/examples/docs/patterns/form/SomeForm.md

### 폼 제출 검증

- 기술스택: zod + react-hook-form + @hookform/resolvers
- 상황: zodResolver로 폼 제출 시 스키마 검증. 상수(LIMITS)를 스키마 검증·에러메시지·UI(maxLength)에 공유
- 코드: apps/examples/docs/patterns/validation/ZodFormFilter.md

### 필터 "전체" 처리

- 기술스택: zod + react-hook-form
- 상황: 목록 필터에서 "전체" 옵션 처리. Checkbox는 배열로 판단(별도 값 불필요), Select는 'all' 프론트 전용 값 필요 → 필터 폼 타입을 스키마 타입과 분리
- 코드: apps/examples/docs/patterns/validation/ZodFormFilter.md

### 단일/배열 union transform — 필터 스키마

- 기술스택: zod
- 상황: URL 쿼리스트링에서 같은 키가 값 1개면 string, 여러 개면 string[]로 파싱될 때. z.union + transform으로 항상 배열로 통일
- 코드: apps/examples/docs/patterns/validation/ZodFormFilter.md

### 폼 중심 페이지 자동 포커스

- 기술스택: HTML autoFocus
- 상황: `<input>`/`<textarea>`를 만들어야 하는데 autoFocus를 쓸지 판단해야 하는 경우
- 코드: apps/examples/docs/patterns/form/AutoFocus.md

## 입력 검증

### URL 동적 세그먼트 ID 검증

- 기술스택: zod + Next.js App Router
- 상황: [id] params를 string → number 변환 + 검증. 실패 시 NOT_FOUND 페이지로 리다이렉트
- 코드: apps/examples/docs/patterns/validation/ZodInputParsing.md

### 쿼리스트링 필드별 개별 검증

- 기술스택: zod + Next.js App Router
- 상황: searchParams를 스키마로 검증하되, 필드 하나가 실패해도 나머지는 유지(safeParsePartial). string|string[] 정규화 포함
- 코드: apps/examples/docs/patterns/validation/ZodInputParsing.md

### z.coerce로 URL 파라미터 강제 변환

- 기술스택: zod + Next.js App Router
- 상황: URL searchParams(항상 string)를 숫자 등 실제 타입으로 변환할 때. z.coerce.number() + .default()로 변환과 기본값을 같은 선언에서 처리
- 코드: apps/examples/docs/patterns/validation/ZodInputParsing.md

## 페이지 통합

### 서버 컴포넌트에서 searchParams → safeParsePartial → API 호출

- 기술스택: zod + Next.js App Router
- 상황: 목록 페이지에서 URL 쿼리스트링을 필터/페이지네이션으로 파싱하여 API에 전달. 유효한 필드만 적용
- 코드: apps/examples/docs/patterns/validation/ZodPageIntegration.md

### [id] 페이지 진입 시 ID 검증 + 에러 처리

- 기술스택: zod + Next.js App Router
- 상황: 동적 라우트 [id] 페이지에서 params.id 검증 실패 시 handleServerSideError → NOT_FOUND 처리
- 코드: apps/examples/docs/patterns/validation/ZodPageIntegration.md

### 생성/수정 페이지에서 같은 폼 컴포넌트 재사용

- 기술스택: zod + react-hook-form + Next.js App Router
- 상황: board prop이 undefined면 생성, 있으면 수정으로 분기. 같은 BoardForm 컴포넌트를 create/edit 페이지에서 공유
- 코드: apps/examples/docs/patterns/validation/ZodPageIntegration.md

## 렌더링

### SSR Prefetch + Streaming

- 기술스택: Next.js App Router + TanStack Query v5
- 상황: Server Component에서 prefetch → HydrationBoundary → Client Component에서 useSuspenseQuery. loading.tsx 대신 Suspense 직접 사용
- 코드: apps/examples/docs/patterns/rendering/SsrPrefetchStreaming.md

### CSR + useSuspenseQuery + ErrorBoundary + Suspense

- 기술스택: React (Vite 등) + TanStack Query v5 + react-error-boundary
- 상황: CSR 앱에서 선언적 데이터 로딩. loading/error 분기 없이 Suspense + ErrorBoundary가 처리
- 코드: apps/examples/docs/patterns/rendering/CsrSuspenseErrorBoundary.md

### 에러 처리 이원화 — SSR/CSR

- 기술스택: Next.js App Router + overlay-kit
- 상황: SSR은 handleServerSideError (4xx → 에러 페이지, 5xx → error.tsx), CSR은 useHandleClientSideError (overlay/toast)
- 코드: apps/examples/docs/patterns/rendering/ErrorHandling.md

### React Compiler — 수동 메모이제이션 금지

- 기술스택: React Compiler (Next.js `reactCompiler: true` / Vite·Babel `babel-plugin-react-compiler`)
- 상황: 컴파일러 활성 프로젝트에서 `useCallback`·`useMemo`·`React.memo`를 수동으로 쓰지 않는다. 예외는 컴파일러 미적용 서드파티 컴포넌트 래핑, 커스텀 비교 함수 필요 시
- 코드: apps/examples/docs/patterns/rendering/ReactCompilerManualMemoization.md

## 스켈레톤

### 실제 클래스 재사용

- 기술스택: CSS Modules + clsx (또는 react-loading-skeleton)
- 상황: 스켈레톤과 실제 컴포넌트의 레이아웃·타이포그래피 동기화. CLS 방지. 컨테이너 클래스 재사용 + 타이포그래피 클래스와 bone 합치기(`&nbsp;`로 line-height 높이 자동 확보)
- 코드: apps/examples/docs/patterns/skeleton/SkeletonReuse.md

## 무한스크롤

### useInfiniteScroll + staleTime: Infinity

- 기술스택: TanStack Query v5 + IntersectionObserver
- 상황: 무한 스크롤 목록. staleTime: Infinity로 n페이지 동시 refetch 방지, gcTime으로 캐시 수명 제어
- 코드: apps/examples/docs/patterns/infinite-scroll/UseInfiniteScroll.md

## 낙관적 업데이트

### 로컬 state 낙관적 업데이트

- 기술스택: React useState + TanStack Query v5
- 상황: 좋아요 토글처럼 단일 boolean 상태. useState로 즉시 반영, 실패 시 롤백
- 코드: apps/examples/docs/patterns/optimistic-update/OptimisticUpdate.md

## API 통신

### ApiClient + ApiResponseError — 수동 매핑

- 기술스택: ApiClient (자체 추상화) + ApiResponseError + query-string
- 상황: HTTP 라이브러리(fetch, ky, axios)에 의존하지 않는 API 호출 계층. ApiClient로 라이브러리 교체를 호출부와 분리하고, 4xx/5xx·네트워크 에러를 ApiResponseError/ApiRequestError로 정규화. API 함수/타입 네이밍 컨벤션, Response.data 반환 원칙, query-string 기반 쿼리스트링 처리 포함
- 코드: apps/examples/docs/patterns/api/FetchApiClientUsage.md

### ApiClient + ApiResponseError — es-toolkit + zod 검증

- 기술스택: ApiClient (자체 추상화) + ApiResponseError + es-toolkit + zod
- 상황: 위 패턴에 snake_case/camelCase 자동 변환(es-toolkit)과 zod 런타임 응답 검증을 추가. 수동 매핑 함수 대신 스키마 기반으로 변환·검증
- 코드: apps/examples/docs/patterns/api/FetchApiClientZodValidation.md

## 테스팅

### 테스트 대상·레벨 판단

- 상황: 테스트 대상·레벨 선정. Yes 디폴트, 면제 화이트리스트, 구현 세부사항 금지, Integration 우선
- 코드: docs/patterns/testing/WhatToTest.md

### 테스트 코드 작성 패턴

- 기술스택: Vitest + React Testing Library
- 상황: 테스트 구조(describe/it 네이밍, describe.each), 쿼리(getByRole 우선, 접두사 용도), 데이터 처리(매직 스트링 → 변수, 반복 assertion → 반복문), 네이밍(사용자 관점 it 워딩), 검증 범위(mock 인덱스 접근 금지, 라이브러리 기본 동작 재검증 금지)
- 코드: docs/patterns/testing/TestWriting.md

## 쿼리

### queryOptions / infiniteQueryOptions 팩토리

- 기술스택: TanStack Query v5
- 상황: queryKey + queryFn을 팩토리 객체로 중앙화. useSuspenseQuery, prefetchQuery, invalidateQueries에서 동일 옵션 재사용
- 코드: apps/examples/docs/patterns/query/QueryOptionsFactory.md

### 변경 API 호출 — useMutation vs 직접 호출

- 기술스택: TanStack Query v5
- 상황: 변경(POST/PATCH/DELETE) API 호출 시 useMutation으로 감쌀지 직접 호출할지 선택
- 코드: apps/examples/docs/patterns/query/MutationCallApproach.md

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

## 디자인 시스템

### 디자인 토큰 출처·운영

- 기술스택: CSS
- 상황: packages/design-system 내부에서 색·여백·폰트·radius·shadow 값을 토큰화할 때. fg/bg 명명 정책으로 통일, 회색조 톤은 blog 레퍼런스에서 출발
- 코드: packages/design-system/docs/patterns/DesignTokens.md
