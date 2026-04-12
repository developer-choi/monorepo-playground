import {describe, it, expect, vi, beforeEach} from 'vitest';
import ApiClient from './ApiClient';
import FetchApiClient from './FetchApiClient';
import {HTTP_STATUS} from './httpStatus';
import ApiResponseError from '@/shared/error/class/ApiResponseError';
import ApiRequestError from '@/shared/error/class/ApiRequestError';

describe('FetchApiClient', () => {
  let client: ApiClient;

  beforeEach(() => {
    client = new FetchApiClient(BASE_URL);
    vi.restoreAllMocks();
  });

  describe('get()', () => {
    describe('General cases', () => {
      it('GET 요청을 보내고 JSON을 반환한다', async () => {
        const data = {id: 1, name: 'test'};
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(createJsonResponse(data)));

        const result = await client.get('/users/1');

        expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/users/1`, expect.objectContaining({method: 'GET'}));
        expect(result).toEqual(data);
      });
    });

    describe('Edge cases', () => {
      it('응답이 ok가 아니면 ApiResponseError를 던진다', async () => {
        vi.stubGlobal(
          'fetch',
          vi.fn().mockResolvedValue(createJsonResponse({message: 'Not Found'}, {status: HTTP_STATUS.NOT_FOUND})),
        );

        await expect(client.get('/users/999')).rejects.toThrow(ApiResponseError);
      });

      it('fetch가 실패하면 ApiRequestError를 던진다', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

        await expect(client.get('/users')).rejects.toThrow(ApiRequestError);
      });
    });
  });

  describe('post()', () => {
    describe('General cases', () => {
      it('POST 요청을 보내고 JSON을 반환한다', async () => {
        const body = {name: 'new'};
        const response = {id: 2, name: 'new'};
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(createJsonResponse(response, {status: HTTP_STATUS.CREATED})));

        const result = await client.post('/users', {body});

        expect(fetch).toHaveBeenCalledWith(
          `${BASE_URL}/users`,
          expect.objectContaining({method: 'POST', body: JSON.stringify(body)}),
        );
        expect(result).toEqual(response);
      });

      it('객체 body일 때 Content-Type을 자동으로 application/json으로 설정한다', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(createJsonResponse({})));

        await client.post('/users', {body: {name: 'test'}});

        const {headers} = getFetchCall();
        expect((headers as Headers).get('Content-Type')).toBe('application/json');
      });
    });
  });

  describe('put()', () => {
    describe('General cases', () => {
      it('PUT 요청을 보내고 JSON을 반환한다', async () => {
        const body = {name: 'updated'};
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(createJsonResponse(body)));

        const result = await client.put('/users/1', {body});

        expect(fetch).toHaveBeenCalledWith(
          `${BASE_URL}/users/1`,
          expect.objectContaining({method: 'PUT', body: JSON.stringify(body)}),
        );
        expect(result).toEqual(body);
      });
    });
  });

  describe('patch()', () => {
    describe('General cases', () => {
      it('PATCH 요청을 보내고 JSON을 반환한다', async () => {
        const body = {name: 'patched'};
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(createJsonResponse(body)));

        const result = await client.patch('/users/1', {body});

        expect(fetch).toHaveBeenCalledWith(
          `${BASE_URL}/users/1`,
          expect.objectContaining({method: 'PATCH', body: JSON.stringify(body)}),
        );
        expect(result).toEqual(body);
      });
    });
  });

  describe('delete()', () => {
    describe('General cases', () => {
      it('DELETE 요청을 보내고 JSON을 반환한다', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(createJsonResponse({success: true})));

        const result = await client.delete('/users/1');

        expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/users/1`, expect.objectContaining({method: 'DELETE'}));
        expect(result).toEqual({success: true});
      });
    });
  });

  describe('Body serialization', () => {
    it.each([
      {input: {key: 'value'}, expected: JSON.stringify({key: 'value'}), label: '객체 → JSON 문자열'},
      {input: 42, expected: '42', label: 'number → 문자열'},
      {input: 'raw text', expected: 'raw text', label: 'string → 그대로'},
      {input: true, expected: 'true', label: 'boolean → 문자열'},
    ])('$label', async ({input, expected}) => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(createJsonResponse({})));

      await client.post('/echo', {body: input});

      expect(getFetchCall().body).toBe(expected);
    });
  });
});

const BASE_URL = 'https://api.example.com';

function createJsonResponse(body: unknown, init?: {status?: number; url?: string}) {
  const response = new Response(JSON.stringify(body), {
    status: init?.status ?? HTTP_STATUS.OK,
    headers: new Headers([['Content-Type', 'application/json']]),
  });
  if (init?.url) {
    Object.defineProperty(response, 'url', {value: init.url});
  }
  return response;
}

function getFetchCall() {
  const [url, options] = vi.mocked(fetch).mock.lastCall!;
  return {url: url as string, ...(options as RequestInit)};
}
