---
keywords: [렌더링, SSR, Prefetch, Streaming, HydrationBoundary, CSR, useSuspenseQuery, ErrorBoundary, Suspense, 에러 처리, React Compiler, 메모이제이션, useCallback, useMemo, 스켈레톤, CLS, 무한스크롤, IntersectionObserver, staleTime, 낙관적 업데이트, optimistic update]
---

# Best Practices — 렌더링

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
