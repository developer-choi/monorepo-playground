# 무한스크롤 — staleTime: Infinity

무한스크롤 쿼리에는 `staleTime: Infinity`가 필수.

TanStack Query v5의 infinite query는 refetch 시 로드된 모든 페이지를 동시에 refetch한다 (v5에서 `refetchPage` 옵션이 제거됨 — Suspense 여부와 무관한 infinite query 공통 동작). 예: 10페이지까지 로드한 상태에서 탭 포커스 → 10개 API 호출 동시 발생.

`staleTime: Infinity`로 자동 refetch를 차단하고, `gcTime`으로 캐시 수명만 제어한다.

[CRITICAL] useInfiniteScroll 훅 구현은 `apps/examples/src/rendering/infinite-scroll/hooks/useInfiniteScroll.ts`를 반드시 Read한다.

## 쿼리 옵션

infiniteQueryOptions에 `staleTime: Infinity` + `gcTime`을 반드시 설정한다. 쿼리 팩토리 패턴은 [QueryOptionsFactory](../query/QueryOptionsFactory.md) 참고.

```tsx
const productQueries = {
  list: {
    key: () => ['products'] as const,
    options: () =>
      infiniteQueryOptions({
        queryKey: [...productQueries.list.key()],
        queryFn: ({pageParam}) => productApi.getProducts(pageParam),
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => (lastPage.hasNext ? allPages.length + 1 : undefined),
        staleTime: Infinity,
        gcTime: 1000 * 60 * 10,
      }),
  },
};
```

## 사용 예시

```tsx
function ProductListPage() {
  const {data, fetchNextPage, hasNextPage, isFetchingNextPage, isError} = useSuspenseInfiniteQuery(
    productQueries.list.options(),
  );

  const {sentinelRef} = useInfiniteScroll({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,
  });

  const products = data.pages.flatMap((page) => page.items);

  return (
    <div>
      <ProductGrid products={products} />
      {isFetchingNextPage && <ProductListSkeleton />}
      {/* sentinel div: 0x0 크기, 리스트 끝에 배치.
       * IntersectionObserver가 이 요소의 뷰포트 진입을 감지한다. */}
      <div ref={sentinelRef} />
    </div>
  );
}
```
