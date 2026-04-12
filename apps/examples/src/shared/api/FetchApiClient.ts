import queryString, {type StringifiableRecord} from 'query-string';
import ApiClient, {type BaseOptions, type HttpMethod} from './ApiClient';
import ApiResponseError from '@/shared/error/class/ApiResponseError';
import ApiRequestError from '@/shared/error/class/ApiRequestError';

export type FetchOptions = BaseOptions & Omit<RequestInit, 'method' | 'headers' | 'body'>;

export default class FetchApiClient extends ApiClient {
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
    const requestUrl = this.buildUrl(url, searchParams);
    const headers = this.buildHeaders(rawHeaders, rawBody);
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

  private buildUrl(url: string, searchParams?: object): string {
    const fullUrl = `${this.baseUrl}${url}`;

    if (!searchParams) {
      return fullUrl;
    }

    return queryString.stringifyUrl({url: fullUrl, query: searchParams as StringifiableRecord});
  }

  private buildHeaders(headers?: HeadersInit, body?: unknown): Headers {
    const merged = new Headers(headers);

    if (body !== null && body !== undefined && typeof body === 'object' && !merged.has('Content-Type')) {
      merged.set('Content-Type', 'application/json');
    }

    return merged;
  }

  private buildBody(body?: unknown): BodyInit | undefined {
    if (body === null || body === undefined) {
      return undefined;
    }
    if (typeof body === 'object') {
      return JSON.stringify(body);
    }
    return String(body as string | number | boolean);
  }

  private async toResponseError(params: {
    method: HttpMethod;
    response: Response;
    body?: unknown;
    headers?: HeadersInit;
  }): Promise<never> {
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
