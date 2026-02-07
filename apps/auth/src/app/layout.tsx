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
        <nav style={{ display: "flex", gap: 16, padding: "12px 24px", borderBottom: "1px solid #ddd", alignItems: "center" }}>
          <Link href="/home?foo=bar&page=3&search=hello+world&lang=ko">Home</Link>
          <Link href="/test/ssr?type=server&id=42&debug=true">SSR</Link>
          <Link href="/test/csr?type=client&filter=active&limit=10">CSR</Link>
          <Link href="/test/client-click?action=fetch&retry=3&timeout=5000">Client Click</Link>
          <Link href="/test/invalidate-refresh" style={{ color: "red" }}>Refresh 무효화</Link>
          <span style={{ marginLeft: "auto", fontSize: 12, color: "#888" }}>
            [AUTH] 로그는 서버 터미널에서 확인하세요 (refresh 동작 포함)
          </span>
        </nav>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
