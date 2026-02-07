import {serverFetch} from '@/shared/api/server';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const response = await serverFetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/me`,
  );

  const data = await response.json();

  return (
    <div style={{ padding: 40 }}>
      <h1>SSR 테스트 (serverFetch)</h1>
      <h3>Query String</h3>
      <pre>{JSON.stringify(params, null, 2)}</pre>
      <h3>API Response</h3>
      <p>Status: {response.status}</p>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
