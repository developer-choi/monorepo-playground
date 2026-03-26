import { useEffect, useRef, type RefObject } from 'react';

interface UseInfiniteScrollParams {
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  offset?: number;
}

interface UseInfiniteScrollReturn {
  sentinelRef: RefObject<HTMLDivElement | null>;
}

export function useInfiniteScroll({
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  offset = 500,
}: UseInfiniteScrollParams): UseInfiniteScrollReturn {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const enabled = hasNextPage && !isFetchingNextPage;

  useEffect(() => {
    const sentinelElement = sentinelRef.current;

    if (!sentinelElement || !enabled) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { rootMargin: `0px 0px ${offset}px 0px` },
    );

    observer.observe(sentinelElement);

    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, enabled, offset]);

  return { sentinelRef };
}
