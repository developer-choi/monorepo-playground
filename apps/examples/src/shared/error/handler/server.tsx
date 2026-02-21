import {type ReactNode} from 'react';
import {notFound, redirect} from 'next/navigation';
import {HTTPError} from 'ky';
import InvalidAccessError from '@/shared/error/class/InvalidAccessError';

export function handleServerSideError(error: unknown): ReactNode {
  if (error instanceof InvalidAccessError) {
    if (error.redirect.type === 'NOT_FOUND') {
      notFound();

    } else {
      redirect(error.redirect.url);
    }
  }

  if (error instanceof HTTPError && error.response.status === 404) {
    notFound();
  }

  // TODO 에러 종류별 에러 UI 노출 예정
  throw error;
}
