import BaseError, {type BaseErrorOption} from './BaseError';
import {type HttpMethod} from '@/shared/api/ApiClient';

/**
 * API 호출 자체가 실패한 경우 (네트워크 에러, DNS 실패 등). 서버 응답 없음.
 * cause에 원본 에러(fetch의 TypeError 등)가 체이닝됨.
 */
export default class ApiRequestError extends BaseError {
  readonly name = 'ApiRequestError';
  readonly method: HttpMethod;
  readonly url: string;
  readonly body: unknown;
  readonly headers: HeadersInit | undefined;

  constructor(
    params: {method: HttpMethod; url: string; body?: unknown; headers?: HeadersInit},
    option?: BaseErrorOption,
  ) {
    super(`${params.method} ${params.url}`, {level: 'warning', ...option});
    this.method = params.method;
    this.url = params.url;
    this.body = params.body;
    this.headers = params.headers;
  }
}
