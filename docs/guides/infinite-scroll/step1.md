# Step 1. 무한 스크롤을 위한 렌더링 전략 결정: Streaming

## 목차
1. **무한 스크롤을 위한 렌더링 전략 결정: Streaming** ← 현재 문서
2. [이미지 최적화: srcset + CDN 리사이징으로 이미지 용량 97% 감소](./step2.md)
3. [무한 스크롤 구현 및 리렌더링 최적화](./step3.md)
4. [에러 방어: 무한 재요청 방지, 빈 목록 처리](./step4.md)

---

## 이 단계의 목표

게시글 목록은 무한 스크롤이 필요해 Client Component로 구현해야 합니다. 그런데 화면을 처음 열 때 첫 페이지 데이터를 **어떤 방식으로 가져오느냐**에 따라, 사용자가 콘텐츠를 보기까지의 대기 시간이 크게 달라집니다.

이 단계에서는 무한 스크롤 목록의 **초기 데이터 로딩을 어떤 렌더링 전략으로 처리할지**를 결정합니다. 결론은 **SSR Prefetch + Streaming**이며, 여기서는 무한 스크롤이라는 제약 위에서 그 결론에 도달한 과정만 정리합니다. CSR·SSR·Streaming의 정량 비교(Network Waterfall·TTFB·번들 사이즈)와 캐싱·PPR 등 렌더링 전략 자체의 심화 논의는 별도 가이드 **[App Router Streaming으로 TTFB 개선](../streaming-ttfb/index.md)** 에서 다룹니다.

이 단계의 구현 코드는 [GitHub](https://github.com/developer-choi/monorepo-playground/pull/6)에서 확인할 수 있습니다.

## 구현 환경

- **Mock API**: `GET /api/board`, page/limit 페이지네이션, 600개 게시글
- **API 연동**: SSR prefetch + Streaming(`Suspense`) + `useSuspenseQuery` + ErrorBoundary

## 무한 스크롤이 렌더링 전략에 거는 제약

무한 스크롤 목록은 스크롤 이벤트로 다음 페이지를 이어 붙여야 하므로 Client Component여야 합니다. 하지만 데이터까지 클라이언트에서만 fetch하면 HTML → JS 다운로드 → `board` API 호출의 3단계 Network Waterfall이 생겨 첫 화면이 늦어집니다.

이를 피하기 위해 **첫 페이지 데이터는 서버에서 prefetch**해 HTML에 포함시키고, 이후 페이지만 클라이언트에서 이어받는 방식을 택했습니다. 서버 부하가 늘어나는 단점이 있지만, 사용자 디바이스 성능은 통제할 수 없는 반면 서버 스펙은 스케일링으로 대응할 수 있어 합리적인 트레이드오프라고 판단했습니다.

다만 SSR prefetch만으로는, API 응답이 느릴 때 서버가 HTML 전체를 블로킹해 빈 화면이 노출되는 문제가 남습니다. 그래서 `Suspense` 기반 **Streaming**을 더해, 서버가 헤더·스켈레톤을 즉시 내려보내고 데이터가 준비되면 목록을 이어서 스트리밍하도록 했습니다.

> Pages Router 시절에는 Streaming이 없어, API가 느리면 빈 화면을 피하려 SSR 대신 CSR로 돌려 로딩 UI라도 먼저 보여주는 절충이 일반적이었습니다. App Router의 Suspense Streaming은 SSR의 이점을 유지하면서 블로킹 없이 셸을 즉시 내려보내므로 이 절충이 더 이상 필요하지 않습니다.

## 선택 결과

따라서 이 시리즈의 목록 페이지는 **SSR Prefetch + Streaming(`Suspense`) + `useSuspenseQuery` + ErrorBoundary** 구성으로 구현합니다.

- [SSR prefetch 커밋](https://github.com/developer-choi/monorepo-playground/pull/6/changes/e7417882501978fa6365cf3342798eb92aface2f)
- [Streaming 커밋](https://github.com/developer-choi/monorepo-playground/pull/6/changes/2c1339017a484449337b26a3073090906d60b124)

각 전략의 정량 비교(Waterfall·Timing·TTFB·번들)는 **[App Router Streaming으로 TTFB 개선](../streaming-ttfb/index.md)** 을 참고하세요.
