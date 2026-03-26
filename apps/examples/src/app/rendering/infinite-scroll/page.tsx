import { Suspense } from 'react';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import BoardListPage, {
  BoardListSkeleton,
} from '@/rendering/infinite-scroll/components/BoardListPage';
import { boardQueries } from '@/rendering/infinite-scroll/queries';

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <Suspense fallback={<BoardListSkeleton />}>
      <PrefetchedBoardList />
    </Suspense>
  );
}

async function PrefetchedBoardList() {
  const queryClient = new QueryClient();
  await queryClient.prefetchInfiniteQuery(boardQueries.list.options());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BoardListPage />
    </HydrationBoundary>
  );
}
