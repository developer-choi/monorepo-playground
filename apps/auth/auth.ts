import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

function getTokenExpiry(accessToken: string): number {
  try {
    const base64Url = accessToken.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));
    return payload.exp * 1000;
  } catch {
    return Date.now() + 10 * 1000;
  }
}

function extractRefreshToken(response: Response): string | null {
  const cookies = response.headers.getSetCookie?.() ?? [];
  for (const cookie of cookies) {
    const match = cookie.match(/refresh_token=([^;]+)/);
    if (match) return match[1];
  }
  return null;
}

async function refreshAccessToken(token: any) {
  console.log("[AUTH] refreshAccessToken 호출됨");
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/refresh`,
      {
        method: "POST",
        headers: {
          Cookie: `refresh_token=${token.refreshToken}`,
        },
      },
    );

    const data = await response.json();
    console.log("[AUTH] refresh 응답:", data.success ? "성공" : "실패", data.message ?? "");

    if (data.success && data.data) {
      const newRefreshToken = extractRefreshToken(response);
      console.log("[AUTH] 새 refreshToken:", newRefreshToken ? "받음" : "없음 (기존 유지)");
      return {
        ...token,
        accessToken: data.data.access_token,
        accessTokenExpires: getTokenExpiry(data.data.access_token),
        refreshToken: newRefreshToken ?? token.refreshToken,
        error: undefined,
      };
    }

    console.log("[AUTH] refresh 실패 → RefreshAccessTokenError");
    return { ...token, error: "RefreshAccessTokenError" };
  } catch (e) {
    console.error("[AUTH] refresh 예외:", e);
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        tenant_id: { type: "text" },
        username: { type: "text" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                tenant_id: credentials.tenant_id,
                username: credentials.username,
                password: credentials.password,
              }),
            },
          );

          const data = await response.json();

          if (data.success && data.data) {
            return {
              id: data.data.user.id,
              name: data.data.user.name,
              email: data.data.user.email,
              accessToken: data.data.access_token,
              refreshToken: extractRefreshToken(response),
              tenantId: credentials.tenant_id as string,
            };
          }

          return null;
        } catch (error) {
          console.error("Login error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log("[AUTH] jwt callback: 로그인 → 토큰 초기화");
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.tenantId = user.tenantId;
        token.accessTokenExpires = getTokenExpiry(user.accessToken as string);
      }

      const remaining = (token.accessTokenExpires as number) - Date.now();
      if (remaining > 0) {
        console.log("[AUTH] jwt callback: 토큰 유효 (남은시간:", Math.round(remaining / 1000) + "초)");
        return token;
      }

      console.log("[AUTH] jwt callback: 토큰 만료 → refresh 시도");
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.user.id = token.sub!;
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken;
      session.tenantId = token.tenantId as string;
      session.error = token.error as string | undefined;
      return session;
    },
  },
});
