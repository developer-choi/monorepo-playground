# Best Practices Map

## 로드 규칙

패턴 문서는 코드를 직접 포함하거나, 소스 파일 링크로 참조한다.
코드를 직접 포함하면 중복이 생기므로 링크로 분리하는 경우가 있는데, 이때 [CRITICAL]로 표기된 링크는 패턴의 실체이므로 반드시 Read한다.
그 외 링크(설계 히스토리 등)는 선택 참조.

## 셋업

### 프로젝트 초기 세팅

- 기술스택: commitlint + prettier + typescript-eslint + stylelint + husky + lint-staged
- 상황: 채용과제·사이드 프로젝트 초기 세팅
- 코드: docs/patterns/setup/ProjectSetup.md

### Provider Composition

- 기술스택: @tanstack/react-query + @radix-ui/themes + overlay-kit + sonner
- 상황: React 앱에서 여러 라이브러리 Provider 조합 시 순서와 구성. QueryClient 기본 옵션 포함
- 코드: docs/patterns/setup/ProviderComposition.md

### Next.js Root Layout — Google Fonts

- 기술스택: Next.js App Router + next/font/google
- 상황: 디자인 시안에 별도 폰트 지정이 없을 때, Noto Sans KR을 기본 폰트로 적용
- 코드: docs/patterns/setup/NextRootLayout.md

## 폼 핸들링

### use[...]Form 커스텀 훅

- 기술스택: react-hook-form + tanstack query
- 상황: 폼이 있는 페이지에서 폼 로직을 컴포넌트에서 분리할 때
- 코드: docs/patterns/form/SomeForm.md

### zod 활용 패턴

- 기술스택: zod + react-hook-form + @hookform/resolvers
- 상황: 스키마 파생(.pick/.extend), 상수 공유, createLabelMap, 필터 "전체" 처리, zodResolver 연동
- 코드: apps/examples/src/validation/integration/README.md

## 렌더링

### SSR Prefetch + Streaming

- 기술스택: Next.js App Router + TanStack Query v5
- 상황: Server Component에서 prefetch → HydrationBoundary → Client Component에서 useSuspenseQuery. loading.tsx 대신 Suspense 직접 사용
- 코드: docs/patterns/rendering/SsrPrefetchStreaming.md

### CSR + useSuspenseQuery + ErrorBoundary + Suspense

- 기술스택: React (Vite 등) + TanStack Query v5 + react-error-boundary
- 상황: CSR 앱에서 선언적 데이터 로딩. loading/error 분기 없이 Suspense + ErrorBoundary가 처리
- 코드: docs/patterns/rendering/CsrSuspenseErrorBoundary.md

### 에러 처리 이원화 — SSR/CSR

- 기술스택: Next.js App Router + overlay-kit
- 상황: SSR은 handleServerSideError (4xx → 에러 페이지, 5xx → error.tsx), CSR은 useHandleClientSideError (overlay/toast)
- 코드: docs/patterns/rendering/ErrorHandling.md

## 스켈레톤

### 실제 클래스 재사용

- 기술스택: CSS Modules + classNames (또는 react-loading-skeleton)
- 상황: 스켈레톤과 실제 컴포넌트의 레이아웃·타이포그래피 동기화. CLS 방지. 컨테이너 클래스 재사용 + 타이포그래피 클래스와 bone 합치기(`&nbsp;`로 line-height 높이 자동 확보)
- 코드: docs/patterns/skeleton/SkeletonReuse.md

## 무한스크롤

### useInfiniteScroll + staleTime: Infinity

- 기술스택: TanStack Query v5 + IntersectionObserver
- 상황: 무한 스크롤 목록. staleTime: Infinity로 n페이지 동시 refetch 방지, gcTime으로 캐시 수명 제어
- 코드: docs/patterns/infinite-scroll/UseInfiniteScroll.md

## 낙관적 업데이트

### 로컬 state 낙관적 업데이트

- 기술스택: React useState + TanStack Query v5
- 상황: 좋아요 토글처럼 단일 boolean 상태. useState로 즉시 반영, 실패 시 롤백
- 코드: docs/patterns/optimistic-update/OptimisticUpdate.md

## 쿼리

### queryOptions / infiniteQueryOptions 팩토리

- 기술스택: TanStack Query v5
- 상황: queryKey + queryFn을 팩토리 객체로 중앙화. useSuspenseQuery, prefetchQuery, invalidateQueries에서 동일 옵션 재사용
- 코드: docs/patterns/query/QueryOptionsFactory.md
