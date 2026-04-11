import {ZodError} from 'zod';
import BaseError from './BaseError';

/**
 * 2xx 성공 응답이지만 Zod 스키마와 불일치하는 경우. 서버 측 버그일 가능성이 높음.
 */
export default class ApiResponseValidationError extends BaseError {
  readonly name = 'ApiResponseValidationError';
  readonly response: unknown;
  readonly zodError: ZodError;

  constructor(response: unknown, zodError: ZodError) {
    super(zodError.message, {level: 'warning', cause: zodError});
    this.response = response;
    this.zodError = zodError;
  }
}
