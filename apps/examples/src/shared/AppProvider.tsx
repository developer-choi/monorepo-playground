'use client';

import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {PropsWithChildren, useState} from 'react';
import {Theme} from '@radix-ui/themes';
import {OverlayProvider} from 'overlay-kit';
import {Toaster} from 'sonner';
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
      <Theme>
        <OverlayProvider>
          {children}
          <Toaster richColors position="top-center" />
        </OverlayProvider>
      </Theme>
    </QueryClientProvider>
  );
}
