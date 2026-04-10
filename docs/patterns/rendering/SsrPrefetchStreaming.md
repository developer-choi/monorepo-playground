# SSR Prefetch + Streaming

1. Server Component에서 prefetch → dehydrate → HydrationBoundary로 전달
2. Client Component에서 useSuspenseQuery/useSuspenseInfiniteQuery로 hydrated 데이터 사용
3. loading.tsx 대신 page.tsx에서 직접 Suspense로 감싸기
   - loading.tsx는 페이지 전체를 대상으로 하지만, Suspense를 직접 쓰면 감싸는 단위를 세밀하게 제어 가능

## Server Component (page.tsx)

page.tsx에서 Suspense로 감싸 Streaming 활성화. loading.tsx 파일을 만들지 않는다 (Suspense의 fallback prop으로 로딩 UI가 명시되고, 렌더링 코드와 로딩 코드가 가까이 위치하여 흐름을 파악하기 쉽다).

```tsx
export default function Page() {
  return (
    <Layout>
      <Suspense fallback={<ProductListSkeleton />}>
        <PrefetchedProductList />
      </Suspense>
    </Layout>
  );
}
```

Server Component에서 QueryClient를 생성하고 fetch한다. 요청 간 데이터 격리를 위해 QueryClient는 매번 새로 생성한다 (모듈 스코프 싱글턴 금지).

- `prefetchQuery`/`prefetchInfiniteQuery`는 에러를 삼키므로 try-catch가 동작하지 않는다.
- 에러 분기가 필요하면 `fetchQuery`/`fetchInfiniteQuery`를 사용한다.
- 성공 시 dehydrate → HydrationBoundary로 클라이언트에 전달.

```tsx
async function PrefetchedProductList() {
  const queryClient = new QueryClient();

  // fetchInfiniteQuery는 에러를 throw한다. prefetchInfiniteQuery는 에러를 삼킨다.
  try {
    await queryClient.fetchInfiniteQuery(productQueries.list.options());
  } catch (error) {
    return handleServerSideError(error);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductListPage />
    </HydrationBoundary>
  );
}
```

## Client Component

'use client' 컴포넌트지만 서버에서 prefetch된 데이터를 HydrationBoundary로 주입받아 SSR 이점 유지.

useSuspenseQuery/useSuspenseInfiniteQuery는 로딩·에러 분기가 필요 없다. Suspense가 로딩을, ErrorBoundary가 에러를 처리한다. 에러 처리 전략은 [에러 처리 이원화](./ErrorHandling.md) 참고.

```tsx
'use client';

function ProductListPage() {
  const {data, fetchNextPage, hasNextPage, isFetchingNextPage} = useSuspenseInfiniteQuery(
    productQueries.list.options(),
  );

  const products = data.pages.flatMap((page) => page.items);

  return (
    <div>
      <ProductGrid products={products} />
      {isFetchingNextPage && <ProductListSkeleton />}
    </div>
  );
}
```

## 복수 Suspense 경계 (병렬 스트리밍)

한 페이지에 독립적인 데이터 영역이 여러 개면 각각을 별도 Suspense로 감싸 병렬로 스트리밍한다.

```tsx
function DetailPage() {
  return (
    <div>
      <Suspense fallback={<HeaderSkeleton />}>
        <PrefetchedHeader />
      </Suspense>
      <Suspense fallback={<ContentSkeleton />}>
        <PrefetchedContent />
      </Suspense>
    </div>
  );
}
```
