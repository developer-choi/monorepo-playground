'use server';

import {revalidatePath} from 'next/cache';

// eslint-disable-next-line @typescript-eslint/require-await -- TODO: server action은 async 필수이나, 향후 구조 개선 시 재검토
export async function revalidatePathFromClient(path: string) {
  revalidatePath(path);
}
