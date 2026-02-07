import NextAuth, {CredentialsSignin} from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import type {JWT} from 'next-auth/jwt';

class InvalidCredentials extends CredentialsSignin {
  code = "INVALID_CREDENTIALS";
}

class InactiveAccount extends CredentialsSignin {
  code = "INACTIVE_ACCOUNT";
}

class ValidationError extends CredentialsSignin {
  code = "VALIDATION_ERROR";
}

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

let refreshPromise: Promise<JWT> | null = null;
let refreshCache: {
  accessToken: string;
  refreshToken: string | null;
  accessTokenExpires: number;
} | null = null;

async function refreshAccessToken(token: JWT): Promise<JWT> {
  if (refreshCache && Date.now() < refreshCache.accessTokenExpires) {
    console.log("[AUTH] refresh: using cached result");
    return { ...token, ...refreshCache, error: undefined };
  }

  if (refreshPromise) {
    console.log("[AUTH] refresh: deduplicating, awaiting existing request");
    return refreshPromise;
  }

  refreshPromise = doRefreshAccessToken(token)
    .then((result) => {
      if (!result.error) {
        refreshCache = {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          accessTokenExpires: result.accessTokenExpires,
        };
      }
      return result;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

async function doRefreshAccessToken(token: JWT): Promise<JWT> {
  try {
    console.log("[AUTH] refresh: calling backend");
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
    console.log(
      `[AUTH] refresh: backend responded ${response.status}`,
      data.success ? "success" : data,
    );

    if (data.success && data.data) {
      return {
        ...token,
        accessToken: data.data.access_token,
        accessTokenExpires: getTokenExpiry(data.data.access_token),
        refreshToken: extractRefreshToken(response) ?? token.refreshToken,
        error: undefined,
      };
    }

    return { ...token, error: "RefreshAccessTokenError" };
  } catch (error) {
    console.log("[AUTH] refresh: exception", error);
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

          if (response.status === 401) throw new InvalidCredentials();
          if (response.status === 403) throw new InactiveAccount();
          if (response.status === 422) throw new ValidationError();
          return null;
        } catch (error) {
          if (error instanceof CredentialsSignin) throw error;
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
        console.log(
          "[AUTH] jwt: token valid,",
          Math.round(remaining / 1000) + "s remaining",
        );
        return token;
      }

      console.log(
        "[AUTH] jwt: token expired",
        Math.round(-remaining / 1000) + "s ago, refreshing...",
      );
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
