# 인수인계: feature/virtual-list

## 배경

무한 스크롤로 게시글을 계속 로드하면 DOM 노드가 비례 증가하여 스크롤 성능이 저하된다. 이를 해결하기 위해 `@tanstack/react-virtual`로 뷰포트 근처의 행만 DOM에 유지하는 virtual list를 적용한다.

이전에 PR #10으로 구현했으나 `react-hooks/refs` 린트 에러가 있었다 (렌더 중 ref.current 접근). master에서 해당 커밋 2개를 revert한 뒤 이 브랜치에서 재구현 중이다.

## 현재 브랜치 커밋 (master 대비)

| 커밋 | 내용 | 상태 |
|------|------|------|
| `4de22ec5` | `@tanstack/react-virtual` 설치 + `useWindowVirtualizer` 기반 virtual list 구현 | 커밋 완료 |
| (미커밋) | 코드리뷰 반영 수정 | **커밋 필요** |

## 완료된 작업

### 구현

- `useInfiniteScroll` 훅 (IntersectionObserver 기반) 삭제
- `useWindowVirtualizer` + `useEffect` 마지막 아이템 감지 패턴으로 교체 (공식 예제 패턴)
- `estimateSize`에 고정값 사용 → 렌더 중 ref 접근 제거 → 린트 에러 해결
- `measureElement`로 실제 DOM 높이 측정

### 코드리뷰 수정 (미커밋 변경분)

| # | 이슈 | 조치 |
|---|------|------|
| 2 | 정적 인라인 스타일 반복 | `.virtualRow` SCSS 클래스 분리, 동적 `transform`만 인라인 유지 |
| 3 | COLUMN_COUNT 이중관리 (SCSS ↔ TSX) | CSS 변수 `--column-count`를 TSX에서 주입, 단일 소스 |
| 4 | `.virtualContainer`의 불필요한 `width: 100%` | 제거 (block 요소이므로 불필요) |
| 6 | 가상화 트리거 로직 컴포넌트에 직접 노출 | `useInfiniteScrollTrigger` 커스텀 훅 추출 |
| 8 | `if (!lastItem) return;` 중괄호 누락 | 중괄호 추가 |
| - | `fetchNextPage` 타입 `() => void` → lint 에러 | `() => Promise<unknown>`으로 수정 |

## 남은 작업

### 1. ErrorBoundary 위치 (Critical)

`useSuspenseInfiniteQuery`를 호출하는 컴포넌트 **내부**에 `<ErrorBoundary>`가 있어서, 초기 fetch 에러 시 자기 자신의 에러를 잡지 못한다. 부모로 올리거나 컴포넌트를 분리해야 한다.

- 이번 PR 범위에 포함할지, 별도 PR로 할지 결정 필요
- 이 이슈는 이전 코드에서 이미 존재하던 구조적 문제

### 2. TODO: `no-floating-promises` 린트 규칙 검토

- `void fetchNextPage()` 같이 `void` 키워드를 강제하는 것이 불편
- `@typescript-eslint/no-floating-promises` 규칙 비활성화 또는 조정 검토
- `checksConditionals`는 유지하되 전체 비활성화 시 `if (promise)` 실수를 못 잡는 트레이드오프 있음

## 참고 자료

- 이전 PR: https://github.com/developer-choi/monorepo-playground/pull/10
- 공식 API 문서: https://tanstack.com/virtual/latest/docs/api/virtualizer
- 공식 infinite scroll 예제: https://tanstack.com/virtual/latest/docs/framework/react/examples/infinite-scroll
- 예제 소스코드: https://github.com/TanStack/virtual/blob/main/examples/react/infinite-scroll/src/main.tsx
