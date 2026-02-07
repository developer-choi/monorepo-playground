"use client";

import {useState} from 'react';
import {useSession} from 'next-auth/react';
import {useSearchParams} from 'next/navigation';
import {api} from '@/shared/api/client';

export default function Page() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [result, setResult] = useState<string>("아직 호출 안함");
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      const data = await api.get("api/auth/me").json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`에러: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Client Click 테스트</h1>
      <h3>Query String</h3>
      <pre>{JSON.stringify(Object.fromEntries(searchParams.entries()), null, 2)}</pre>
      <h3>API Response</h3>
      <p>Session accessToken: {session?.accessToken ? "있음" : "없음"}</p>
      <button
        onClick={handleClick}
        disabled={isLoading}
        style={{ padding: "8px 16px", fontSize: 16 }}
      >
        {isLoading ? "로딩중..." : "API 호출 (getMe)"}
      </button>
      <pre style={{ marginTop: 16 }}>{result}</pre>
    </div>
  );
}
