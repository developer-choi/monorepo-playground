import {Theme} from '@radix-ui/themes';
import {OverlayProvider} from 'overlay-kit';
import '@radix-ui/themes/styles.css';
import '@/styles/reset.css';
import type {PropsWithChildren} from 'react';

export default function AppProvider({children}: PropsWithChildren) {
  return (
    <Theme>
      <OverlayProvider>
        {children}
      </OverlayProvider>
    </Theme>
  );
}
