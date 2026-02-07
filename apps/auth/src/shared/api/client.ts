import ky from 'ky';
import {getAccessToken} from './token';

const isServer = typeof document === "undefined";

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = fetch("/api/auth/session")
    .then((res) => res.json())
    .then((session) => {
      if (session?.error || !session?.accessToken) {
        return null;
      }
      document.cookie = `access_token=${session.accessToken}; path=/`;
      return session.accessToken;
    })
    .catch(() => null)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

async function getServerToken(): Promise<string | null> {
  const { headers } = await import("next/headers");
  const headerStore = await headers();
  return headerStore.get("x-access-token");
}

export const api = ky.create({
  prefixUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  credentials: "include",
  retry: {
    limit: 1,
    statusCodes: [401],
    methods: ["get", "post", "put", "patch", "delete", "head"],
    delay: () => 0,
  },
  hooks: {
    beforeRequest: [
      async (request) => {
        const token = isServer ? await getServerToken() : getAccessToken();
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`);
        }
      },
    ],
    beforeRetry: [
      async ({ request }) => {
        if (isServer) {
          return ky.stop;
        }

        const token = await refreshAccessToken();
        if (!token) {
          const callbackUrl =
            window.location.pathname + window.location.search;
          window.location.href = `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`;
          return ky.stop;
        }
        request.headers.set("Authorization", `Bearer ${token}`);
      },
    ],
  },
});
