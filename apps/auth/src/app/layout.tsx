import type {Metadata} from 'next';
import Link from 'next/link';
import AppProvider from '@/shared/AppProvider';
import './globals.css';

export const metadata: Metadata = {
  title: "Auth Playground",
  description: "NextAuth + JWT + Refresh Token example",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <nav style={{ display: "flex", gap: 16, padding: "12px 24px", borderBottom: "1px solid #ddd" }}>
          <Link href="/test/ssr">SSR</Link>
          <Link href="/test/csr">CSR</Link>
          <Link href="/test/client-click">Client Click</Link>
        </nav>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
