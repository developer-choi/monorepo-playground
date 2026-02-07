"use client";

import {useEffect, useState} from 'react';
import {useSession} from 'next-auth/react';
import {useSearchParams} from 'next/navigation';
import {api} from '@/shared/api/client';

export default function Page() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [result, setResult] = useState<string>("로딩중...");

  useEffect(() => {
    api
      .get("api/auth/me")
      .json()
      .then((data) => setResult(JSON.stringify(data, null, 2)))
      .catch((error) => setResult(`에러: ${error}`));
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>CSR 테스트 (useEffect + ky)</h1>
      <h3>Query String</h3>
      <pre>{JSON.stringify(Object.fromEntries(searchParams.entries()), null, 2)}</pre>
      <h3>API Response</h3>
      <p>Session accessToken: {session?.accessToken ? "있음" : "없음"}</p>
      <pre>{result}</pre>
    </div>
  );
}
