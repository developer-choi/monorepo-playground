import BaseError, {type BaseErrorOption} from './BaseError';
import {type HttpMethod} from '@/shared/api/ApiClient';

/**
 * API 호출은 성공했지만 2xx가 아닌 경우 (response.ok === false).
 * 요청 자체가 실패한 경우(네트워크 에러 등)는 ApiRequestError를 사용.
 */
export default class ApiResponseError extends BaseError {
  readonly name = 'ApiResponseError';
  readonly method: HttpMethod;
  readonly status: number;
  readonly url: string;
  readonly body: unknown;
  readonly headers: HeadersInit | undefined;
  readonly errorData: unknown;

  constructor(
    params: {
      method: HttpMethod;
      status: number;
      url: string;
      body?: unknown;
      headers?: HeadersInit;
      errorData: unknown;
    },
    option?: BaseErrorOption,
  ) {
    super(`${params.method} ${params.status} ${params.url}`, {level: 'warning', ...option});
    this.method = params.method;
    this.status = params.status;
    this.url = params.url;
    this.body = params.body;
    this.headers = params.headers;
    this.errorData = params.errorData;
  }
}
