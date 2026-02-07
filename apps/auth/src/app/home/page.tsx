import Link from 'next/link';
import {serverFetch} from '@/shared/api/server';

export default async function Page() {
  const response = await serverFetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/me`,
  );
  const data = await response.json();

  return (
    <div style={{ padding: 40 }}>
      <h1>Home</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <nav style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
        <Link href="/test/ssr">SSR 테스트 (serverFetch)</Link>
        <Link href="/test/csr">CSR 테스트 (useEffect + ky)</Link>
        <Link href="/test/client-click">Client Click 테스트 (버튼 클릭 + ky)</Link>
      </nav>
    </div>
  );
}
