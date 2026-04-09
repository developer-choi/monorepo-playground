# queryOptions / infiniteQueryOptions 팩토리

TanStack Query v5의 `queryOptions()`를 사용하여 쿼리 옵션을 중앙화한다.

**장점:**

- queryKey와 queryFn이 항상 쌍으로 관리됨 (불일치 방지)
- useSuspenseQuery, prefetchQuery, invalidateQueries에서 동일 옵션 재사용
- TypeScript 타입 추론이 queryOptions()를 통해 자동으로 전파

**원칙:**

- queryFn에 fetch/ky 등 HTTP 호출을 직접 작성하지 않는다. api.ts에 정의된 API 함수를 호출만 한다.
- list 쿼리에 필터가 있으면, 기본값을 spread로 resolve한 뒤 queryKey에 포함한다. filters를 그대로 넣으면 undefined 포함 시 캐시 불일치가 발생한다.
- 각 항목은 `key()`와 `options()`를 가진 객체. invalidation 시 `key()`만 참조하여 필터 조합과 무관하게 무효화 가능.
- 무한 쿼리는 `queryOptions()` 대신 `infiniteQueryOptions()`를 사용한다.

## 팩토리 정의

```tsx
import { queryOptions } from '@tanstack/react-query';

export const classQueries = {
  // list: key()를 분리하면 invalidateQueries에서 필터와 무관하게 무효화 가능.
  // filters 기본값을 spread로 resolve한 뒤 queryKey에 포함한다.
  list: {
    key: (organizationId: string) => ['classes', organizationId] as const,
    options: (organizationId: string, filters?: ClassFilters) => {
      const resolved = { page: 1, search: '', ...filters };
      return queryOptions({
        queryKey: [...classQueries.list.key(organizationId), resolved] as const,
        queryFn: () => classApi.getClasses({ organizationId, ...resolved }),
      });
    },
  },

  detail: {
    key: (classId: string) => ['classes', 'detail', classId] as const,
    options: (classId: string) =>
      queryOptions({
        queryKey: classQueries.detail.key(classId),
        queryFn: () => classApi.getClass(classId),
      }),
  },
};
```

## 사용 예시

```tsx
useSuspenseQuery(classQueries.detail.options(classId));
queryClient.prefetchQuery(classQueries.list.options(orgId));
queryClient.invalidateQueries({ queryKey: classQueries.list.key(orgId) });
```
