'use client';

import {type PropsWithChildren} from 'react';
import {ErrorBoundary, type FallbackProps} from 'react-error-boundary';
import ErrorNotice from '@/shared/components/ErrorNotice';
import {getErrorInfo} from '@/shared/error/handler/info';
import {useReportPageError} from '@/shared/error/handler/useReportPageError';

export default function HandledErrorBoundary({children}: PropsWithChildren) {
  return <ErrorBoundary FallbackComponent={Fallback}>{children}</ErrorBoundary>;
}

function Fallback({error, resetErrorBoundary}: FallbackProps) {
  useReportPageError(error);
  const {title, content} = getErrorInfo(error);
  return <ErrorNotice content={content} title={title} onAction={resetErrorBoundary} />;
}
