'use client';

import { useRef } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { boardQueries } from '../queries';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import BoardCard from './BoardCard';
import BoardCardSkeleton from './BoardCardSkeleton';
import ErrorPageTemplate from '@/shared/components/ErrorPageTemplate';
import styles from './BoardListPage.module.scss';
import { Button } from '@radix-ui/themes';

export default function BoardListPage() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isError } =
    useSuspenseInfiniteQuery(boardQueries.list.options());
  const boards = data.pages.flatMap((page) => page.list);

  const {
    containerRef,
    virtualRows,
    measureElement,
    totalHeight,
    virtualizedHeight,
  } = useVirtualGrid(boards.length, isFetchingNextPage);

  const { sentinelRef } = useInfiniteScroll({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,
  });

  return (
    <ErrorBoundary
      fallbackRender={({ resetErrorBoundary }) => (
        <ErrorPageTemplate
          message="게시글 목록을 불러오지 못했습니다."
          action={<Button onClick={resetErrorBoundary}>다시 시도</Button>}
        />
      )}
    >
      <section className={styles.container}>
        {boards.length === 0 ? (
          <p className={styles.message}>게시글이 없습니다.</p>
        ) : (
          <>
            <div
              ref={containerRef}
              className={styles.virtualContainer}
              style={{ height: totalHeight }}
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
                    ref={measureElement}
                    className={styles.grid}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
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
                  className={styles.grid}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualizedHeight}px)`,
                  }}
                >
                  {Array.from({ length: SKELETON_COUNT }, (_, index) => (
                    <BoardCardSkeleton key={index} />
                  ))}
                </div>
              )}
            </div>
            <div ref={sentinelRef} />
            {isError && (
              <p className={styles.message}>
                게시글을 더 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
              </p>
            )}
          </>
        )}
      </section>
    </ErrorBoundary>
  );
}

export function BoardListSkeleton() {
  return (
    <section className={styles.container}>
      <div className={styles.grid}>
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <BoardCardSkeleton key={index} />
        ))}
      </div>
    </section>
  );
}

function useVirtualGrid(itemCount: number, isFetchingNextPage: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rowCount = Math.ceil(itemCount / COLUMN_COUNT);

  const virtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => estimateRowHeight(containerRef),
    overscan: 5,
    useFlushSync: false,
    initialRect: { width: 1800, height: 1000 },
  });

  const virtualRows = virtualizer.getVirtualItems();
  const skeletonRowCount = isFetchingNextPage
    ? Math.ceil(SKELETON_COUNT / COLUMN_COUNT)
    : 0;
  const skeletonHeight =
    skeletonRowCount * estimateRowHeight(containerRef);
  const virtualizedHeight = virtualizer.getTotalSize();

  return {
    containerRef,
    virtualRows,
    measureElement: virtualizer.measureElement,
    totalHeight: virtualizedHeight + skeletonHeight,
    virtualizedHeight,
  };
}

function estimateRowHeight(
  containerRef: { current: HTMLDivElement | null },
): number {
  const container = containerRef.current;
  if (!container) return FALLBACK_HEIGHT;

  const containerWidth = container.clientWidth;
  const totalGap = COL_GAP * (COLUMN_COUNT - 1);
  const columnWidth = (containerWidth - totalGap) / COLUMN_COUNT;
  const imageHeight = columnWidth * 1.2;
  return imageHeight + INFO_HEIGHT + ROW_GAP;
}

const COLUMN_COUNT = 4;
const SKELETON_COUNT = 24;
const FALLBACK_HEIGHT = 400;
const ROW_GAP = 40;
const COL_GAP = 16;
const INFO_HEIGHT = 80;
