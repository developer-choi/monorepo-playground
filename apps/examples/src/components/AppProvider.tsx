'use client';

import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {PropsWithChildren} from 'react';
import {Theme} from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';
import '@monorepo-playground/design-system/style.css';

const queryClient = new QueryClient();

export default function AppProvider({children}: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <Theme>
        {children}
      </Theme>
    </QueryClientProvider>
  )
}