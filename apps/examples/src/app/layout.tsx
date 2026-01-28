import type {Metadata} from 'next';
import {Noto_Sans} from 'next/font/google';
import '@monorepo-playground/design-system/style.css';
import {PropsWithChildren} from 'react';

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
        {children}
      </body>
    </html>
  );
}
