# 인수인계: feature/virtual-list

## 배경

무한 스크롤로 게시글을 계속 로드하면 DOM 노드가 비례 증가하여 스크롤 성능이 저하된다. `@tanstack/react-virtual`로 뷰포트 근처의 행만 DOM에 유지하는 virtual list를 적용했다.

관련 기술 문서: https://github.com/developer-choi/developer-choi/blob/main/docs/infinite-scroll/step1.md

## 현재 브랜치 커밋 (master 대비)

| 커밋 | 내용 |
|------|------|
| `0a600469` | ErrorBoundary를 부모 컴포넌트로 분리 |
| `56321110` | `@tanstack/react-virtual`로 virtual list 재구현 (코드리뷰 반영 + 인수인계 문서 포함) |

## 완료된 작업

- `useInfiniteScroll` 훅 (IntersectionObserver 기반) 삭제 → `useWindowVirtualizer` + `useEffect` 마지막 아이템 감지 패턴으로 교체
- `estimateSize`에 고정값 사용 → 렌더 중 ref 접근 제거 → 린트 에러 해결
- `measureElement`로 실제 DOM 높이 측정
- 코드리뷰 반영: 인라인 스타일 SCSS 분리, `COLUMN_COUNT` CSS 변수 단일 소스화, `useInfiniteScrollTrigger` 훅 추출
- ErrorBoundary를 부모 컴포넌트로 분리 (초기 fetch 에러를 잡지 못하는 구조 문제 해결)

## 남은 작업

### 1. 코드 이해 (PR 공개 전 필수)

코드는 동작하지만, virtual list의 렌더링 메커니즘을 완전히 이해하지 못한 상태. 채용 담당자에게 PR을 공개하기 전에 아래 항목을 이해해야 한다.

**이미 학습한 API** (KA `react-virtual.md`):
- `useVirtualizer` vs `useWindowVirtualizer`, `count`, `estimateSize`, `overscan`, `useFlushSync`

**추가 학습 필요한 API** (공식 문서: https://tanstack.com/virtual/latest/docs/api/virtualizer):
- `getVirtualItems()` — 현재 화면에 보여야 할 VirtualItem 배열 반환
- `getTotalSize()` — 전체 가상 영역의 높이(px). 컨테이너에 이 높이를 줘서 스크롤바가 정상 동작하게 함
- `measureElement` — ref callback. 실제 DOM에 붙여서 아이템의 실측 높이를 virtualizer에 알려줌

**개념 이해 필요** (API 지식이 아닌 패턴 이해):
- 렌더링 패턴: `position: relative` 컨테이너 + `position: absolute` 아이템 + `translateY`로 배치하는 원리
- row 단위 가상화: 그리드 레이아웃에서 왜 개별 카드가 아니라 행(row)을 가상화 단위로 쓰는지

### 2. 훅 추출 여부 — 미결정

`useWindowVirtualizer` 관련 코드를 커스텀 훅으로 추출할지 검토 중. 아래 논점이 있었으나 결론은 내리지 않았다.

**추출 찬성:**
- 기존 `useInfiniteScroll`처럼 훅 하나 호출로 끝나는 구조가 깔끔
- 가상화는 수단이고 목적은 무한 스크롤이니까 구현 상세를 숨기는 게 자연스러움

**추출 반대:**
- virtual list는 렌더링 구조 자체를 바꾸므로 (absolute + translateY) 훅으로 완전히 숨기기 어려움
- 현재 `BoardList` 컴포넌트의 응집도가 이미 높음 — 추출해도 응집도가 올라가는 게 아니라 위치만 옮기는 것
- 재사용 가능성이 낮은 1회성 조합 (4열 그리드 + 무한 스크롤 + window virtualizer)
- 코드를 먼저 이해한 뒤에 추출 여부를 판단하는 게 순서

### 3. `no-floating-promises` 린트 규칙 검토

- `void fetchNextPage()` 같이 `void` 키워드를 강제하는 것이 불편
- `@typescript-eslint/no-floating-promises` 규칙 비활성화 또는 조정 검토

## 참고 자료

- PR: https://github.com/developer-choi/monorepo-playground/pull/10
- 공식 API 문서: https://tanstack.com/virtual/latest/docs/api/virtualizer
- 공식 infinite scroll 예제: https://tanstack.com/virtual/latest/docs/framework/react/examples/infinite-scroll
