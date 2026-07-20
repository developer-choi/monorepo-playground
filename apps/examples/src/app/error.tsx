'use client';

import ErrorNotice from '@/shared/components/ErrorNotice';
import {getErrorInfo} from '@/shared/error/handler/info';
import {useReportPageError} from '@/shared/error/handler/useReportPageError';

interface ErrorPageProps {
  error: Error & {digest?: string};
  reset: () => void;
}

export default function ErrorPage({error, reset}: ErrorPageProps) {
  useReportPageError(error);

  const {title, content} = getErrorInfo(error);
  return <ErrorNotice content={content} title={title} onAction={reset} />;
}
