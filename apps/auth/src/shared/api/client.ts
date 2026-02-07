import ky from 'ky';
import {getAccessToken} from './token';

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
      (request) => {
        const token = getAccessToken();
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`);
        }
      },
    ],
    beforeRetry: [
      async ({ request }) => {
        const token = await refreshAccessToken();
        if (!token) {
          const callbackUrl = window.location.pathname + window.location.search;
          window.location.href = `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`;
          return ky.stop;
        }
        request.headers.set("Authorization", `Bearer ${token}`);
      },
    ],
  },
});
