import ky, {type Options as KyInternalOptions, HTTPError} from 'ky';
import queryString from 'query-string';
import ApiClient, {type BaseOptions, type HttpMethod} from './ApiClient';
import ApiResponseError from '@/shared/error/class/ApiResponseError';
import ApiRequestError from '@/shared/error/class/ApiRequestError';

export type KyOptions = BaseOptions &
  Omit<KyInternalOptions, 'method' | 'headers' | 'body' | 'json' | 'prefixUrl' | 'searchParams'>;

export default class KyApiClient extends ApiClient {
  private readonly client: typeof ky;

  constructor(baseUrl: string) {
    super(baseUrl);
    this.client = ky.create({
      prefixUrl: baseUrl,
    });
  }

  async get<T>(url: string, options?: KyOptions) {
    const {searchParams, ...rest} = options ?? {};
    try {
      return await this.client
        .get(url, {...rest, searchParams: searchParams ? queryString.stringify(searchParams) : undefined})
        .json<T>();
    } catch (error) {
      return this.handleError({error, method: 'GET', url, headers: options?.headers});
    }
  }

  async post<T>(url: string, options: KyOptions & {body: unknown}) {
    const {body, searchParams, ...kyOptions} = options;
    try {
      return await this.client
        .post(url, {
          ...kyOptions,
          searchParams: searchParams ? queryString.stringify(searchParams) : undefined,
          json: body,
        })
        .json<T>();
    } catch (error) {
      return this.handleError({error, method: 'POST', url, body, headers: options.headers});
    }
  }

  async put<T>(url: string, options: KyOptions & {body: unknown}) {
    const {body, searchParams, ...kyOptions} = options;
    try {
      return await this.client
        .put(url, {
          ...kyOptions,
          searchParams: searchParams ? queryString.stringify(searchParams) : undefined,
          json: body,
        })
        .json<T>();
    } catch (error) {
      return this.handleError({error, method: 'PUT', url, body, headers: options.headers});
    }
  }

  async patch<T>(url: string, options: KyOptions & {body: unknown}) {
    const {body, searchParams, ...kyOptions} = options;
    try {
      return await this.client
        .patch(url, {
          ...kyOptions,
          searchParams: searchParams ? queryString.stringify(searchParams) : undefined,
          json: body,
        })
        .json<T>();
    } catch (error) {
      return this.handleError({error, method: 'PATCH', url, body, headers: options.headers});
    }
  }

  async delete<T>(url: string, options?: KyOptions) {
    const {searchParams, ...rest} = options ?? {};
    try {
      return await this.client
        .delete(url, {...rest, searchParams: searchParams ? queryString.stringify(searchParams) : undefined})
        .json<T>();
    } catch (error) {
      return this.handleError({error, method: 'DELETE', url, headers: options?.headers});
    }
  }

  private async handleError(params: {
    error: unknown;
    method: HttpMethod;
    url: string;
    body?: unknown;
    headers?: HeadersInit;
  }): Promise<never> {
    if (params.error instanceof HTTPError) {
      // eslint-disable-next-line no-restricted-syntax -- 이미 throw 하는 중에 에러 본문을 부가정보로 읽는 것뿐이라 실패를 삼키지 않는다. 본문이 JSON이 아니면 errorData만 null이고 ApiResponseError는 그대로 던져진다.
      const errorData: unknown = await params.error.response.json().catch(() => null);
      throw new ApiResponseError({
        method: params.method,
        status: params.error.response.status,
        url: params.error.response.url,
        body: params.body,
        headers: params.headers,
        errorData,
      });
    }

    throw new ApiRequestError(
      {
        method: params.method,
        url: `${this.baseUrl.replace(/\/$/, '')}/${params.url}`,
        body: params.body,
        headers: params.headers,
      },
      {cause: params.error},
    );
  }
}
