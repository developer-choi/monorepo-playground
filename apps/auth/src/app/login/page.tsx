"use client";

import {useState} from 'react';
import {signIn} from 'next-auth/react';
import {useRouter} from 'next/navigation';

export default function Page() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      tenant_id: "tnt_tIIuaU0xFpsNCvA7",
      username: "admin",
      password: "admin123",
      redirect: false,
    });

    if (result?.error) {
      setError("로그인 실패");
      setIsLoading(false);
      return;
    }

    router.push("/home");
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>로그인</h1>
      <p>DADA / admin / admin123 으로 로그인합니다.</p>
      <button
        onClick={handleLogin}
        disabled={isLoading}
        style={{ padding: "12px 24px", fontSize: 16, marginTop: 16 }}
      >
        {isLoading ? "로그인 중..." : "로그인"}
      </button>
      {error && <p style={{ color: "red", marginTop: 8 }}>{error}</p>}
    </div>
  );
}
