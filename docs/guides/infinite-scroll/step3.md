# Step 3. 무한 스크롤 구현 및 리렌더링 최적화

## 목차
1. [렌더링 전략 최종 선택: Streaming](./step1.md)
2. [이미지 최적화: srcset + CDN 리사이징으로 이미지 용량 97% 감소](./step2.md)
3. **무한 스크롤 구현 및 리렌더링 최적화** ← 현재 문서
4. [에러 방어: 무한 재요청 방지, 빈 목록 처리](./step4.md)

---

## 이 단계의 목표

사용자가 게시글 목록을 끝까지 스크롤하면 다음 페이지가 자동으로 로드되는 무한 스크롤을 구현합니다.

단순히 동작하게 만드는 것을 넘어, 스크롤 감지 방식 선택 / 데이터 캐싱 전략 / 리렌더링 최적화까지 세 가지 성능 문제를 발견하고 해결한 과정을 다룹니다.

이 단계의 구현 코드는 [GitHub](https://github.com/developer-choi/monorepo-playground/pull/8)에서 확인할 수 있습니다.

## 구현 환경

- **데이터 페칭**: `useSuspenseInfiniteQuery` + SSR prefetch 유지
- **캐싱 전략**: `staleTime: Infinity` + `gcTime: 30_000`으로 리페칭 대량 발생 방지
- **리렌더링 최적화**: `React.memo`로 기존 카드 리렌더링 방지

## 1. 스크롤 끝 감지 — scroll 이벤트 vs IntersectionObserver

### 콜백 호출 횟수 비교

| scroll 이벤트 | IntersectionObserver |
|---|---|
| <img width="225" height="229" alt="scroll" src="https://github.com/user-attachments/assets/f80dae9e-d42a-4a76-a357-5659e17095ee" /> | <img width="224" height="227" alt="intersection-observer" src="https://github.com/user-attachments/assets/618dab4c-f0c9-45da-a231-a619ba155a78" /> |

동일한 스크롤 동작에서:
- **scroll 이벤트**: 콜백 32회 이상 호출 (throttle 200ms 적용 후에도)
- **IntersectionObserver**: 콜백 **1회** 호출

scroll 이벤트는 스크롤할 때마다 콜백이 발생하므로, 임계점 도달 여부와 무관하게 반복 호출됩니다. IntersectionObserver는 리스트 하단이 뷰포트에 진입하는 시점에만 콜백이 발생하므로, 이러한 문제가 원천적으로 없습니다.

### 의사결정 과정

콜백 호출 횟수 차이를 비교하기 위해 [scroll 이벤트 기반으로 먼저 구현](https://github.com/developer-choi/monorepo-playground/commit/39f093fe)했습니다. scroll 이벤트에 throttle을 적용하더라도 구조적인 한계가 있습니다.

임계점 직전에 콜백이 호출되고, 임계점을 지나는 시점에는 throttle 대기 중이라 콜백이 호출되지 않습니다. 대기가 끝난 후에야 다시 호출되므로, 정작 중요한 임계점 도달 시점을 놓치게 됩니다.

이를 해결하려면 throttle 시간을 줄여야 하는데, 그러면 콜백 호출 횟수가 늘어나 throttle을 거는 의미가 퇴색됩니다. **throttle 시간 ↔ 정확도** 사이의 트레이드오프가 구조적으로 존재합니다.

[IntersectionObserver로 전환](https://github.com/developer-choi/monorepo-playground/commit/8f5767db)하여 해결했습니다. 리스트 하단이 화면에 진입하는 시점에 정확히 한 번 콜백이 발생하므로, throttle 자체가 필요 없고 이러한 트레이드오프가 없습니다.

## 2. 캐싱 전략 — staleTime과 리페칭 대량 발생

### 문제 정의

TanStack Query는 `staleTime`이 지난 데이터를 stale로 판단하고, 컴포넌트가 마운트될 때 자동으로 리페칭합니다. 일반 쿼리에서는 요청이 1건이므로 문제가 없지만, `useInfiniteQuery`는 누적된 **모든 페이지를 각각 리페칭**합니다.

5페이지를 쌓은 상태에서 상세 페이지로 이동한 뒤, staleTime이 지나고 돌아오면 짧은 시간 내에 5건의 API 요청이 동시 발생합니다. 페이지가 많을수록 서버 부하가 비례하여 증가합니다.

같은 문제가 window focus에서도 발생합니다. 10페이지를 쌓아놓고 다른 탭을 보다가 돌아오면, `refetchOnWindowFocus`에 의해 10건의 API 요청이 동시에 발생합니다. staleTime 기반으로 캐싱을 관리하려면 window focus 리페칭까지 별도로 꺼야 하는 번거로움이 있습니다.

이를 확인하기 위해 [staleTime을 30초로 설정](https://github.com/developer-choi/monorepo-playground/commit/fdb0d376)하여 재현했습니다.

<img width="303" height="623" alt="image" src="https://github.com/user-attachments/assets/ac783506-1e71-43e5-ad75-476f54e5a3e7" />

### 결정: staleTime: Infinity + gcTime: 30_000

| 설정 | 역할 |
|---|---|
| `staleTime: Infinity` | 데이터를 항상 fresh로 유지하여 자동 리페칭 방지 |
| `gcTime: 30_000` | 컴포넌트 언마운트 30초 후 캐시를 GC하여 오래된 데이터 정리 |

`staleTime: Infinity`만으로는 데이터가 영원히 캐시에 남아 오래된 게시글 정보가 표시될 수 있습니다. [`gcTime: 30_000`을 함께 설정](https://github.com/developer-choi/monorepo-playground/commit/dc4c6783)하여, 사용자가 목록을 떠난 뒤 30초가 지나면 캐시가 정리되고 다시 방문 시 1페이지부터 새로 로드합니다.

- 상세 페이지 갔다가 바로 돌아오면: 캐시에서 즉시 렌더링 + 스크롤 위치 복원
- 오랜 시간 후 돌아오면: 캐시가 GC되어 1페이지부터 새로 로드

게시글 목록은 실시간 동기화가 필요하지 않으므로 합리적인 트레이드오프입니다.

## 3. 리렌더링 최적화 — React.memo

새 페이지가 로드되면 `pages` 배열이 변경되어 BoardListPage가 리렌더링되고, 자식인 모든 BoardCard도 함께 리렌더링됩니다.

### Before: memo 없음

| 2페이지 로드 시 전체 리렌더링 | DevTools 확인 |
|---|---|
| <img width="1902" height="1191" alt="image" src="https://github.com/user-attachments/assets/2dfbcc8e-38c0-4ac5-98e9-5618f7b438e5" /> | <img width="1548" height="1176" alt="image" src="https://github.com/user-attachments/assets/89669a95-13c4-4ec3-a43d-c5047c34ab3e" /> |

2페이지 로드 시 기존 1페이지 카드가 모두 리렌더링됩니다.

2페이지 로드 시점의 렌더링 횟수 **96회**는 다음과 같이 발생합니다:

| 시점 | 렌더링 대상 | 횟수 | 누적 |
|---|---|---|---|
| 1페이지 최초 렌더링 | 카드 24개 | 24 | 24 |
| `isFetchingNextPage`: false → true | 기존 카드 24개 리렌더링 | 24 | 48 |
| `isFetchingNextPage`: true → false + 새 데이터 도착 | 기존 24개 리렌더링 + 새 카드 24개 | 48 | 96 |

5페이지 기준 `BoardCard render` 카운트가 **600회**까지 증가했습니다.

### After: React.memo 적용

[`React.memo`로 감싸면](https://github.com/developer-choi/monorepo-playground/commit/e39d0798) props가 동일한 기존 카드의 리렌더링을 스킵합니다.

<img width="1969" height="1329" alt="image" src="https://github.com/user-attachments/assets/f8072481-821b-4dc4-b7e6-fa4a131c7a00" />

5페이지 기준 렌더링 횟수: **600회 → 120회 (80% 감소)**

## 결과 요약

| 지표 | Before | After |
|---|---|---|
| 스크롤 감지 콜백 횟수 | 32회 이상 (throttle 적용 후에도) | **1회** |
| 페이지 복귀 시 리페칭 | 쌓인 페이지 수만큼 동시 발생 | 캐시에서 즉시 렌더링 (리페칭 없음) |
| 컴포넌트 렌더링 횟수 (5페이지 기준) | **600회** | **120회** (80% 감소) |
