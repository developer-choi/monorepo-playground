'use client';

import type {CSSProperties} from 'react';
import {ErrorBoundary} from 'react-error-boundary';
import {useSuspenseInfiniteQuery} from '@tanstack/react-query';
import {boardQueries} from '../queries';
import {useInfiniteScroll} from '../hooks/useInfiniteScroll';
import BoardCard from './BoardCard';
import BoardCardSkeleton from './BoardCardSkeleton';
import ErrorPageTemplate from '@/shared/components/ErrorPageTemplate';
import styles from './BoardListPage.module.scss';
import {Button} from '@radix-ui/themes';

export default function BoardListPage() {
  return (
    <ErrorBoundary
      fallbackRender={({resetErrorBoundary}) => (
        <ErrorPageTemplate
          action={<Button onClick={resetErrorBoundary}>다시 시도</Button>}
          message="게시글 목록을 불러오지 못했습니다."
        />
      )}
    >
      <BoardList />
    </ErrorBoundary>
  );
}

function BoardList() {
  const {data, fetchNextPage, hasNextPage, isFetchingNextPage, isError} = useSuspenseInfiniteQuery(
    boardQueries.list.options(),
  );
  const boards = data.pages.flatMap((page) => page.list);

  const {virtualizer, virtualRows} = useInfiniteScroll({
    itemCount: boards.length,
    columnCount: COLUMN_COUNT,
    estimatedRowHeight: ESTIMATED_ROW_HEIGHT,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,
  });

  const virtualContainerStyle: CSSProperties = {height: virtualizer.getTotalSize()};
  const skeletonRowStyle: CSSProperties = {transform: `translateY(${virtualizer.getTotalSize()}px)`};

  return (
    <section className={styles.container} style={columnCountStyle}>
      {boards.length === 0 ? (
        <p className={styles.message}>게시글이 없습니다.</p>
      ) : (
        <>
          <div className={styles.virtualContainer} style={virtualContainerStyle}>
            {virtualRows.map((virtualRow) => {
              const startIndex = virtualRow.index * COLUMN_COUNT;
              const rowBoards = boards.slice(startIndex, startIndex + COLUMN_COUNT);
              const rowStyle: CSSProperties = {
                transform: `translateY(${virtualRow.start}px)`,
              };

              return (
                <div
                  key={virtualRow.key}
                  ref={virtualizer.measureElement}
                  className={styles.virtualRow}
                  data-index={virtualRow.index}
                  style={rowStyle}
                >
                  {rowBoards.map((board) => (
                    <BoardCard key={board.id} board={board} />
                  ))}
                </div>
              );
            })}

            {isFetchingNextPage && (
              <div className={styles.virtualRow} style={skeletonRowStyle}>
                {Array.from({length: SKELETON_COUNT}, (_unused, index) => (
                  <BoardCardSkeleton key={index} />
                ))}
              </div>
            )}
          </div>
          {isError && <p className={styles.message}>게시글을 더 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p>}
        </>
      )}
    </section>
  );
}

export function BoardListSkeleton() {
  return (
    <section className={styles.container} style={columnCountStyle}>
      <div className={styles.grid}>
        {Array.from({length: SKELETON_COUNT}, (_unused, index) => (
          <BoardCardSkeleton key={index} />
        ))}
      </div>
    </section>
  );
}

const COLUMN_COUNT = 4;
const SKELETON_COUNT = 24;
const ESTIMATED_ROW_HEIGHT = 400;
const columnCountStyle: CSSProperties = {
  // eslint-disable-next-line @typescript-eslint/naming-convention -- CSS custom property
  '--column-count': COLUMN_COUNT,
} as CSSProperties;
