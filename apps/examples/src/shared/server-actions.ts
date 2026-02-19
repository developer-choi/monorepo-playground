'use server';

import {revalidatePath} from 'next/cache';

export async function revalidatePathFromClient(path: string) {
  revalidatePath(path);
}
