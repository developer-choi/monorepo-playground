'use client';

import { useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { boardQueries } from '../queries';
import BoardCard from './BoardCard';
import BoardCardSkeleton from './BoardCardSkeleton';
import ErrorPageTemplate from '@/shared/components/ErrorPageTemplate';
import styles from './BoardListPage.module.scss';
import { Button } from '@radix-ui/themes';

export default function BoardListPage() {
  return (
    <ErrorBoundary
      fallbackRender={({ resetErrorBoundary }) => (
        <ErrorPageTemplate
          message="게시글 목록을 불러오지 못했습니다."
          action={<Button onClick={resetErrorBoundary}>다시 시도</Button>}
        />
      )}
    >
      <BoardList />
    </ErrorBoundary>
  );
}

function BoardList() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isError } =
    useSuspenseInfiniteQuery(boardQueries.list.options());
  const boards = data.pages.flatMap((page) => page.list);

  const rowCount = Math.ceil(boards.length / COLUMN_COUNT);

  const virtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => ESTIMATED_ROW_HEIGHT,
    overscan: 5,
  });

  const virtualRows = virtualizer.getVirtualItems();

  useInfiniteScrollTrigger({
    virtualRows,
    rowCount,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,
  });

  return (
    <section className={styles.container} style={columnCountStyle}>
        {boards.length === 0 ? (
          <p className={styles.message}>게시글이 없습니다.</p>
        ) : (
          <>
            <div
              className={styles.virtualContainer}
              style={{ height: virtualizer.getTotalSize() }}
            >
              {virtualRows.map((virtualRow) => {
                const startIndex = virtualRow.index * COLUMN_COUNT;
                const rowBoards = boards.slice(
                  startIndex,
                  startIndex + COLUMN_COUNT,
                );

                return (
                  <div
                    key={virtualRow.key}
                    data-index={virtualRow.index}
                    ref={virtualizer.measureElement}
                    className={styles.virtualRow}
                    style={{
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    {rowBoards.map((board) => (
                      <BoardCard key={board.id} board={board} />
                    ))}
                  </div>
                );
              })}

              {isFetchingNextPage && (
                <div
                  className={styles.virtualRow}
                  style={{
                    transform: `translateY(${virtualizer.getTotalSize()}px)`,
                  }}
                >
                  {Array.from({ length: SKELETON_COUNT }, (_, index) => (
                    <BoardCardSkeleton key={index} />
                  ))}
                </div>
              )}
            </div>
            {isError && (
              <p className={styles.message}>
                게시글을 더 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
              </p>
            )}
          </>
        )}
      </section>
  );
}

export function BoardListSkeleton() {
  return (
    <section className={styles.container} style={columnCountStyle}>
      <div className={styles.grid}>
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <BoardCardSkeleton key={index} />
        ))}
      </div>
    </section>
  );
}

const COLUMN_COUNT = 4;
const SKELETON_COUNT = 24;
const ESTIMATED_ROW_HEIGHT = 400;
const columnCountStyle = {
  '--column-count': COLUMN_COUNT,
} as React.CSSProperties;

function useInfiniteScrollTrigger({
  virtualRows,
  rowCount,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isError,
}: {
  virtualRows: { index: number }[];
  rowCount: number;
  fetchNextPage: () => Promise<unknown>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isError: boolean;
}) {
  useEffect(() => {
    const lastItem = virtualRows[virtualRows.length - 1];

    if (!lastItem) {
      return;
    }

    if (
      lastItem.index >= rowCount - 1 &&
      hasNextPage &&
      !isFetchingNextPage &&
      !isError
    ) {
      void fetchNextPage();
    }
  }, [hasNextPage, fetchNextPage, rowCount, isFetchingNextPage, isError, virtualRows]);
}
