import {type ReactNode} from 'react';
import {notFound, redirect} from 'next/navigation';
import InvalidAccessError from '@/shared/error/class/InvalidAccessError';
import ErrorPageTemplate from '@/shared/components/ErrorPageTemplate';
import {getErrorInfo} from '@/shared/error/handler/info';
import ApiResponseError from '@/shared/error/class/ApiResponseError';
import {captureException} from '@sentry/nextjs';

export function handleServerSideError(error: unknown): ReactNode {
  if (error instanceof InvalidAccessError) {
    if (error.redirect.type === 'NOT_FOUND') {
      notFound();
    } else {
      redirect(error.redirect.url);
    }
  }

  if (error instanceof ApiResponseError) {
    if (error.status === HTTP_STATUS_NOT_FOUND) {
      notFound();
    }

    if (error.status < HTTP_STATUS_INTERNAL_SERVER_ERROR) {
      const {title, content} = getErrorInfo(error);
      return <ErrorPageTemplate content={content} title={title} />;
    }
  }

  // 5xx 또는 그 외 예측 못한 에러는 error.tsx로 위임. 그래야 error.tsx의 reset()으로 복구를 시도할 수 있음.
  captureException(error);
  throw error;
}

const HTTP_STATUS_NOT_FOUND = 404;
const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500;
