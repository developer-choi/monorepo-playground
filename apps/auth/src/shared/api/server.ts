import {cookies} from 'next/headers';

export async function serverFetch(
  input: string,
  init?: RequestInit,
): Promise<Response> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

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
