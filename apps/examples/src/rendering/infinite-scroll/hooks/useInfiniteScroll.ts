import { useEffect } from 'react';

interface UseInfiniteScrollParams {
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  offset?: number;
}

export function useInfiniteScroll({
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  offset = 300,
}: UseInfiniteScrollParams) {
  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;

    let throttleTimer: ReturnType<typeof setTimeout> | null = null;

    function handleScroll() {
      if (throttleTimer) return;

      throttleTimer = setTimeout(() => {
        throttleTimer = null;
      }, 200);

      console.count('scroll callback');
      const { scrollTop, scrollHeight, clientHeight } =
        document.documentElement;

      if (scrollTop + clientHeight >= scrollHeight - offset) {
        fetchNextPage();
      }
    }

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (throttleTimer) clearTimeout(throttleTimer);
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, offset]);
}
