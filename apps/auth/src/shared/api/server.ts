import {headers} from 'next/headers';

export async function serverFetch(
  input: string,
  init?: RequestInit,
): Promise<Response> {
  const headerStore = await headers();
  const accessToken = headerStore.get("x-access-token");

  return fetch(input, {
    ...init,
    headers: {
      ...init?.headers,
      ...(accessToken && {
        Authorization: `Bearer ${accessToken}`,
      }),
    },
  });
}
