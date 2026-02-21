import BaseError from './BaseError';

export interface InvalidAccessErrorOptions {
  redirect: {type: 'NOT_FOUND'} | {type: 'REDIRECT'; url: string};
  meta?: unknown;
}

/**
 * 잘못된 경로로 페이지에 접근한 경우
 * 예시 1. /board/abc 처럼 유효하지 않은 params로 접근한 경우
 * 예시 2. 회원가입 폼을 거치지 않고 회원가입 완료 페이지에 직접 접근한 경우
 */
export default class InvalidAccessError extends BaseError {
  readonly name = 'InvalidAccessError';
  readonly redirect: {type: 'NOT_FOUND'} | {type: 'REDIRECT'; url: string};
  readonly meta?: unknown;

  constructor(options: InvalidAccessErrorOptions) {
    const message = options.redirect.type === 'NOT_FOUND'
      ? `${options.redirect.type}`
      : `${options.redirect.type} ${options.redirect.url}`;
    super(message, {level: 'info'});
    this.redirect = options.redirect;
    this.meta = options.meta;
  }
}
