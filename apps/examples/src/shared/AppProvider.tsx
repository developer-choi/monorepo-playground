'use client';

import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {PropsWithChildren, useState} from 'react';
import {OverlayProvider} from 'overlay-kit';
import {Toaster} from 'sonner';
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
      <OverlayProvider>
        {children}
        <Toaster richColors position="top-center" />
      </OverlayProvider>
    </QueryClientProvider>
  );
}
