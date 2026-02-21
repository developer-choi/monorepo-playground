import {ZodError} from 'zod';
import BaseError from './BaseError';

/**
 * API 호출이 성공했고 (2xx), 응답 데이터도 존재하지만,
 * Zod 스키마로 검증했을 때 기대한 형태와 일치하지 않는 경우 발생함.
 * 즉, 서버가 약속된 응답 형태를 지키지 않은 경우이므로 서버 측 버그일 가능성이 높음.
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
