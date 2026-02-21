import {type ReactNode} from 'react';
import {notFound, redirect} from 'next/navigation';
import {HTTPError} from 'ky';
import InvalidAccessError from '@/shared/error/class/InvalidAccessError';
import ErrorPageTemplate from '@/shared/components/ErrorPageTemplate';
import {getErrorMessage} from '@/shared/error/handler/message';

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

  return <ErrorPageTemplate message={getErrorMessage(error)} />;
}
