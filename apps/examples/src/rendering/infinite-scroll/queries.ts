import { infiniteQueryOptions } from '@tanstack/react-query';
import { getBoardListApi } from '@/shared/board/api';

export const boardQueries = {
  list: {
    key: () => ['boards'],
    options: () =>
      infiniteQueryOptions({
        queryKey: [...boardQueries.list.key()],
        queryFn: ({ pageParam }) => getBoardListApi({ page: pageParam }),
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) =>
          lastPage.hasNext ? allPages.length + 1 : undefined,
      }),
  },
};
