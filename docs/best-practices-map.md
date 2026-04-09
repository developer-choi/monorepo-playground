# Best Practices Map

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
