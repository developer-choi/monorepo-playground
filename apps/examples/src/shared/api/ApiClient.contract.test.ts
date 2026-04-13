import {describe, it, expect, vi, beforeEach} from 'vitest';
import type ApiClient from './ApiClient';
import FetchApiClient from './FetchApiClient';
import KyApiClient from './KyApiClient';
import {HTTP_STATUS} from './httpStatus';
import ApiResponseError from '@/shared/error/class/ApiResponseError';
import ApiRequestError from '@/shared/error/class/ApiRequestError';

const BASE_URL = 'https://api.example.com';

const implementations = [
  {name: 'FetchApiClient', createClient: () => new FetchApiClient(BASE_URL), path: (url: string) => url},
  {name: 'KyApiClient', createClient: () => new KyApiClient(BASE_URL), path: (url: string) => url.replace(/^\//, '')},
];

describe.each(implementations)('ApiClient 계약 > $name', ({createClient, path}) => {
  let client: ApiClient;

  beforeEach(() => {
    client = createClient();
    vi.restoreAllMocks();
  });

  describe('편의 메소드 — 성공', () => {
    it('GET 요청 후 JSON을 반환한다', async () => {
      mockFetch({id: 1});
      expect(await client.get(path('/users/1'))).toEqual({id: 1});
    });

    it('POST 요청 후 JSON을 반환한다', async () => {
      mockFetch({id: 2}, HTTP_STATUS.CREATED);
      expect(await client.post(path('/users'), {body: {name: 'new'}})).toEqual({id: 2});
    });

    it('PUT 요청 후 JSON을 반환한다', async () => {
      mockFetch({ok: true});
      expect(await client.put(path('/users/1'), {body: {name: 'updated'}})).toEqual({ok: true});
    });

    it('PATCH 요청 후 JSON을 반환한다', async () => {
      mockFetch({ok: true});
      expect(await client.patch(path('/users/1'), {body: {name: 'patched'}})).toEqual({ok: true});
    });

    it('DELETE 요청 후 JSON을 반환한다', async () => {
      mockFetch({ok: true});
      expect(await client.delete(path('/users/1'))).toEqual({ok: true});
    });
  });

  describe('HTTP 에러 → ApiResponseError', () => {
    it('4xx 응답 시 ApiResponseError를 던진다', async () => {
      mockFetch({message: 'Not Found'}, HTTP_STATUS.NOT_FOUND);
      await expect(client.get(path('/users/999'))).rejects.toThrow(ApiResponseError);
    });

    it('에러에 method, status, url, errorData가 포함된다', async () => {
      mockFetch({message: 'Bad Request'}, HTTP_STATUS.BAD_REQUEST);

      const error = await getError(() => client.post(path('/users'), {body: {name: ''}}));

      expect(error).toBeInstanceOf(ApiResponseError);
      const apiError = error as ApiResponseError;
      expect(apiError.method).toBe('POST');
      expect(apiError.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(apiError.url).toContain('users');
      expect(apiError.errorData).toEqual({message: 'Bad Request'});
    });

    it('요청 body가 에러에 보존된다', async () => {
      const body = {name: 'test'};
      mockFetch({}, HTTP_STATUS.BAD_REQUEST);

      const error = await getError(() => client.post(path('/users'), {body}));

      expect((error as ApiResponseError).body).toEqual(body);
    });

    it('서버 응답이 유효하지 않은 JSON이면 errorData가 null이다', async () => {
      mockFetchRaw('not json', HTTP_STATUS.BAD_REQUEST);

      const error = await getError(() => client.get(path('/users')));

      expect(error).toBeInstanceOf(ApiResponseError);
      expect((error as ApiResponseError).errorData).toBeNull();
    });
  });

  describe('네트워크 에러 → ApiRequestError', () => {
    it('네트워크 실패 시 ApiRequestError를 던진다', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
      await expect(client.post(path('/users'), {body: {}})).rejects.toThrow(ApiRequestError);
    });
  });
});

function mockFetch(data: unknown, status: number = HTTP_STATUS.OK) {
  stubFetch({body: JSON.stringify(data), status, headers: new Headers([['Content-Type', 'application/json']])});
}

function mockFetchRaw(body: string, status: number) {
  stubFetch({body, status});
}

function stubFetch(init: {body: string; status: number; headers?: Headers}) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation((input: string | URL | Request) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      const response = new Response(init.body, {status: init.status, headers: init.headers});
      Object.defineProperty(response, 'url', {value: url, configurable: true});
      return Promise.resolve(response);
    }),
  );
}

async function getError(fn: () => Promise<unknown>): Promise<unknown> {
  try {
    await fn();
    expect.fail('should have thrown');
  } catch (error) {
    return error;
  }
}
