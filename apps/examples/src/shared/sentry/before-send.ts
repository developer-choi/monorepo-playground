import type {ErrorEvent, EventHint, SeverityLevel} from '@sentry/core';
import BaseError from '@/shared/error/class/BaseError';

export const beforeSend = (event: ErrorEvent, hint: EventHint): ErrorEvent | null => {
  if (isSkipSentry(hint)) {
    return null;
  }

  event.extra ??= {};

  if (hint.originalException instanceof Error) {
    // 외부에서 던져진 에러 (스크립트 불러오기 실패) 같은것도 Sentry로 모두 보내기 위함
    event.extra.stack = hint.originalException.stack;
  }

  event.extra.original = hint.originalException;

  if (!(hint.originalException instanceof BaseError)) {
    return event;
  }

  event.level = toSentryLevel(hint.originalException.level);
  event.tags = hint.originalException.tags;

  return event;
};

function isSkipSentry(hint: EventHint): boolean {
  // nextjs에서 server side에서 redirect() 하면 내부적으로 이 에러를 던져서 처리하도록 되어있는데 문제는 그게 Sentry까지 날아간다는 것이었음. 이거말고 다른 해결책을 못찾음.
  const isNextRedirectError =
    hint.originalException &&
    typeof hint.originalException === 'object' &&
    'digest' in hint.originalException &&
    typeof hint.originalException.digest === 'string' &&
    hint.originalException.digest.includes('NEXT_REDIRECT');

  if (isNextRedirectError) {
    return true;
  }

  return SKIP_ERRORS.some(
    (error) =>
      hint.originalException instanceof error.class &&
      hint.originalException.message === error.message &&
      hint.originalException.stack !== undefined &&
      hint.originalException.stack.includes(error.stackKeyword),
  );
}

// BaseError의 'low'는 Sentry SeverityLevel에 1:1 대응이 없어 'info'로 매핑.
const LEVEL_MAP: Record<BaseError['level'], SeverityLevel> = {
  fatal: 'fatal',
  error: 'error',
  warning: 'warning',
  low: 'info',
};

function toSentryLevel(level: BaseError['level']): SeverityLevel {
  return LEVEL_MAP[level];
}

// 아무리 오류가 많이 발생하더라도 대응하지 않을 오류는 Sentry로 보내지 않기 위함
const SKIP_ERRORS: {
  class: ErrorConstructor;
  message: string;
  stackKeyword: string;
}[] = [];
