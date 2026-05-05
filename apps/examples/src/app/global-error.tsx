'use client';

import * as Sentry from '@sentry/nextjs';
import NextError from 'next/error';
import {useEffect} from 'react';

export default function GlobalError({error}: {error: Error & {digest?: string}}) {
  useEffect(() => {
    // digest가 있으면 server side에서 던져진 에러. instrumentation.ts의 onRequestError(captureRequestError)에서 이미 잡혔으므로 중복 캡처 방지.
    if (error.digest) {
      return;
    }
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        {/* `NextError` is the default Next.js error page component. Its type
        definition requires a `statusCode` prop. However, since the App Router
        does not expose status codes for errors, we simply pass 0 to render a
        generic error message. */}
        <NextError statusCode={0} />
      </body>
    </html>
  );
}
