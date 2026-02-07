"use client";

import {useState} from 'react';
import {useSession} from 'next-auth/react';

export default function Page() {
  const { update } = useSession();
  const [done, setDone] = useState(false);

  const handleInvalidate = async () => {
    await update({ invalidateRefresh: true });
    setDone(true);
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Refresh Token 무효화 테스트</h1>
      <p>버튼을 누르면 JWT 안의 refreshToken을 잘못된 값으로 교체합니다.</p>
      <p>이후 access_token 만료 시 refresh 실패 → 로그인 페이지로 리다이렉트됩니다.</p>
      <button
        onClick={handleInvalidate}
        disabled={done}
        style={{ padding: "12px 24px", fontSize: 16, marginTop: 16 }}
      >
        {done ? "무효화 완료" : "Refresh Token 무효화"}
      </button>
      {done && (
        <p style={{ color: "orange", marginTop: 12 }}>
          access_token이 만료될 때까지 기다리거나, 다른 테스트 페이지에서 API 호출해보세요.
        </p>
      )}
    </div>
  );
}
