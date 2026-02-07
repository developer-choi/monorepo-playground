import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import type {JWT} from 'next-auth/jwt';

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

async function refreshAccessToken(token: JWT): Promise<JWT> {
  console.log("[AUTH] refresh 시도");
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

    if (data.success && data.data) {
      console.log("[AUTH] refresh 성공");
      return {
        ...token,
        accessToken: data.data.access_token,
        accessTokenExpires: getTokenExpiry(data.data.access_token),
        refreshToken: extractRefreshToken(response) ?? token.refreshToken,
        error: undefined,
      };
    }

    console.log("[AUTH] refresh 실패:", data.message);
    return { ...token, error: "RefreshAccessTokenError" };
  } catch {
    console.log("[AUTH] refresh 예외 발생");
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
        } catch {
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.tenantId = user.tenantId;
        token.accessTokenExpires = getTokenExpiry(user.accessToken);
      }

      if (trigger === "update" && session?.invalidateRefresh) {
        token.refreshToken = "invalid_token_for_testing";
      }

      const remaining = token.accessTokenExpires - Date.now();
      if (remaining > 0) {
        console.log("[AUTH] 토큰 유효 (남은시간:", Math.round(remaining / 1000) + "초)");
        return token;
      }

      console.log("[AUTH] 토큰 만료 → refresh");
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.user.id = token.sub!;
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.tenantId = token.tenantId;
      session.error = token.error;
      return session;
    },
  },
});
