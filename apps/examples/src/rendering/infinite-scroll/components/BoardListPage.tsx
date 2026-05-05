'use client';

import {useSuspenseInfiniteQuery} from '@tanstack/react-query';
import {boardQueries} from '../queries';
import {useInfiniteScroll} from '../hooks/useInfiniteScroll';
import BoardCard from './BoardCard';
import BoardCardSkeleton from './BoardCardSkeleton';
import HandledErrorBoundary from '@/shared/error/handler/HandledErrorBoundary';
import styles from './BoardListPage.module.scss';

export default function BoardListPage() {
  const {data, fetchNextPage, hasNextPage, isFetchingNextPage, isError} = useSuspenseInfiniteQuery(
    boardQueries.list.options(),
  );
  const boards = data.pages.flatMap((page) => page.list);

  const {sentinelRef} = useInfiniteScroll({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,
  });

  return (
    <HandledErrorBoundary>
      <section className={styles.container}>
        {boards.length === 0 ? (
          <p className={styles.message}>게시글이 없습니다.</p>
        ) : (
          <>
            <div className={styles.grid}>
              {boards.map((board) => (
                <BoardCard key={board.id} board={board} />
              ))}
              {isFetchingNextPage &&
                Array.from({length: SKELETON_COUNT}, (_unused, index) => <BoardCardSkeleton key={index} />)}
            </div>
            <div ref={sentinelRef} />
            {isError && <p className={styles.message}>게시글을 더 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p>}
          </>
        )}
      </section>
    </HandledErrorBoundary>
  );
}

export function BoardListSkeleton() {
  return (
    <section className={styles.container}>
      <div className={styles.grid}>
        {Array.from({length: SKELETON_COUNT}, (_unused, index) => (
          <BoardCardSkeleton key={index} />
        ))}
      </div>
    </section>
  );
}

const SKELETON_COUNT = 24;
