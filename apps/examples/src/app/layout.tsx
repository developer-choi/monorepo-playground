import type {Metadata} from 'next';
import {Noto_Sans} from 'next/font/google';
import {PropsWithChildren} from 'react';
import AppProvider from '@/shared/AppProvider';

const notoSans = Noto_Sans({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Monorepo Playground",
};

export default function RootLayout({children}: PropsWithChildren) {
  return (
    <html lang="en">
      <body className={notoSans.className}>
      <AppProvider>
        {children}
      </AppProvider>
      </body>
    </html>
  );
}
