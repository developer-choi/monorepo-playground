'use client';

import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {PropsWithChildren, useState} from 'react';
import {Theme} from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';
import '@monorepo-playground/design-system/style.css';

export default function AppProvider({children}: PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 0,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <Theme>{children}</Theme>
    </QueryClientProvider>
  );
}
