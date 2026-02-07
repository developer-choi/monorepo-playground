import {serverFetch} from '@/shared/api/server';

export default async function Page() {
  const response = await serverFetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/me`,
  );

  const data = await response.json();

  return (
    <div style={{ padding: 40 }}>
      <h1>SSR 테스트 (serverFetch)</h1>
      <p>Status: {response.status}</p>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
