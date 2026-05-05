'use client';

import ErrorPageTemplate from '@/shared/components/ErrorPageTemplate';
import {getErrorInfo} from '@/shared/error/handler/info';
import {useReportPageError} from '@/shared/error/handler/useReportPageError';

interface ErrorPageProps {
  error: Error & {digest?: string};
  reset: () => void;
}

export default function ErrorPage({error, reset}: ErrorPageProps) {
  useReportPageError(error);

  const {title, content} = getErrorInfo(error);
  return <ErrorPageTemplate content={content} title={title} onAction={reset} />;
}
