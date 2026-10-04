import queryString, {type StringifiableRecord} from 'query-string';
import ApiClient, {type BaseOptions} from './ApiClient.js';
import type {HttpMethod} from './http.js';
import ApiRequestError from './error/ApiRequestError.js';
import ApiResponseError from './error/ApiResponseError.js';
import {joinUrl} from './url.js';

export type FetchOptions = BaseOptions & Omit<RequestInit, 'method' | 'headers' | 'body'>;

/**
 * 요청마다 생성자의 prefixUrl·헤더를 덮어쓸 값. 서버 렌더링 중 받은 요청의 쿠키·host를 실어 보낼 때 쓴다.
 * 여기 담긴 헤더는 ApiRequestError·ApiResponseError의 headers에 남기지 않는다 — 에러가 모니터링 도구로 넘어가므로.
 */
export interface RequestContext {
  prefixUrl: string;
  headers?: HeadersInit;
}

export default class FetchApiClient extends ApiClient {
  private readonly resolveRequestContext?: () => Promise<RequestContext>;

  constructor(prefixUrl: string, resolveRequestContext?: () => Promise<RequestContext>) {
    super(prefixUrl);
    this.resolveRequestContext = resolveRequestContext;
  }

  async get<T>(url: string, options?: FetchOptions) {
    const response = await this.request(url, {method: 'GET', body: undefined, ...options});
    if (!response.ok) {
      await this.toResponseError({method: 'GET', response, headers: options?.headers});
    }
    return response.json() as T;
  }

  async post<T>(url: string, options: FetchOptions & {body: unknown}) {
    const response = await this.request(url, {method: 'POST', ...options});
    if (!response.ok) {
      await this.toResponseError({method: 'POST', response, body: options.body, headers: options.headers});
    }
    return response.json() as T;
  }

  async put<T>(url: string, options: FetchOptions & {body: unknown}) {
    const response = await this.request(url, {method: 'PUT', ...options});
    if (!response.ok) {
      await this.toResponseError({method: 'PUT', response, body: options.body, headers: options.headers});
    }
    return response.json() as T;
  }

  async patch<T>(url: string, options: FetchOptions & {body: unknown}) {
    const response = await this.request(url, {method: 'PATCH', ...options});
    if (!response.ok) {
      await this.toResponseError({method: 'PATCH', response, body: options.body, headers: options.headers});
    }
    return response.json() as T;
  }

  async delete<T>(url: string, options?: FetchOptions) {
    const response = await this.request(url, {method: 'DELETE', body: undefined, ...options});
    if (!response.ok) {
      await this.toResponseError({method: 'DELETE', response, headers: options?.headers});
    }
    return response.json() as T;
  }

  private async request(url: string, options: FetchOptions & {method: HttpMethod; body: unknown}) {
    const {searchParams, headers: rawHeaders, body: rawBody, method, ...fetchOptions} = options;
    const context = await this.resolveRequestContext?.();
    const requestUrl = this.buildUrl(joinUrl(context?.prefixUrl ?? this.prefixUrl, url), searchParams);
    const headers = this.buildHeaders([context?.headers, rawHeaders], rawBody);
    const body = this.buildBody(rawBody);

    try {
      return await fetch(requestUrl, {
        ...fetchOptions,
        method,
        headers,
        body,
      });
    } catch (error) {
      throw new ApiRequestError({method, url: requestUrl, body: rawBody, headers: rawHeaders}, {cause: error});
    }
  }

  private buildUrl(fullUrl: string, searchParams?: object): string {
    if (!searchParams) {
      return fullUrl;
    }

    return queryString.stringifyUrl({url: fullUrl, query: searchParams as StringifiableRecord});
  }

  private buildHeaders(headersList: (HeadersInit | undefined)[], body?: unknown): Headers {
    const merged = new Headers();

    headersList.forEach((headers) => {
      new Headers(headers).forEach((value, key) => merged.set(key, value));
    });

    if (body !== undefined && !merged.has('Content-Type')) {
      merged.set('Content-Type', 'application/json');
    }

    return merged;
  }

  private buildBody(body?: unknown): BodyInit | undefined {
    return body === undefined ? undefined : JSON.stringify(body);
  }

  private async toResponseError(params: {
    method: HttpMethod;
    response: Response;
    body?: unknown;
    headers?: HeadersInit;
  }): Promise<never> {
    // eslint-disable-next-line no-restricted-syntax -- 이미 throw 하는 중에 에러 본문을 부가정보로 읽는 것뿐이라 실패를 삼키지 않는다. 본문이 JSON이 아니면 errorData만 null이고 ApiResponseError는 그대로 던져진다.
    const errorData: unknown = await params.response.json().catch(() => null);
    throw new ApiResponseError({
      method: params.method,
      status: params.response.status,
      url: params.response.url,
      body: params.body,
      headers: params.headers,
      errorData,
    });
  }
}
