import { queryOptions } from '@tanstack/react-query';
import { getBoardListApi } from '@/shared/board/api';

export const boardQueries = {
  list: {
    key: () => ['boards'],
    options: () =>
      queryOptions({
        queryKey: [...boardQueries.list.key()],
        queryFn: () => getBoardListApi({ page: 1 }),
      }),
  },
};
