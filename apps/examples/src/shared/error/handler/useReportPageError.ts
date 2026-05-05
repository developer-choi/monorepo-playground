import {useEffect} from 'react';
import {captureException} from '@sentry/nextjs';

/**
 * 받은 에러를 Sentry로 보고한다. digest가 있으면 server origin이라
 * instrumentation의 onRequestError가 이미 잡았으므로 스킵하여 중복을 방지한다.
 *
 * 사용처: app/error.tsx, app/global-error.tsx, HandledErrorBoundary fallback
 */
export function useReportPageError(error: unknown) {
  useEffect(() => {
    if (error !== null && typeof error === 'object' && 'digest' in error && typeof error.digest === 'string') {
      return;
    }
    captureException(error);
  }, [error]);
}
