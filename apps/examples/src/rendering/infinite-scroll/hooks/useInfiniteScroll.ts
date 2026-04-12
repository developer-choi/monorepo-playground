import {useEffect} from 'react';
import {useWindowVirtualizer} from '@tanstack/react-virtual';

export function useInfiniteScroll({
  itemCount,
  columnCount,
  estimatedRowHeight,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isError,
}: {
  itemCount: number;
  columnCount: number;
  estimatedRowHeight: number;
  fetchNextPage: () => Promise<unknown>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isError: boolean;
}) {
  const rowCount = Math.ceil(itemCount / columnCount);

  const virtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => estimatedRowHeight,
    overscan: 5,
  });

  const virtualRows = virtualizer.getVirtualItems();

  useEffect(() => {
    const lastItem = virtualRows[virtualRows.length - 1];

    if (!lastItem) {
      return;
    }

    if (lastItem.index >= rowCount - 1 && hasNextPage && !isFetchingNextPage && !isError) {
      void fetchNextPage();
    }
  }, [hasNextPage, fetchNextPage, rowCount, isFetchingNextPage, isError, virtualRows]);

  return {virtualizer, virtualRows};
}
