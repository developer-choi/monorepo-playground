import {describe, it, expect, vi, beforeEach} from 'vitest';
import FetchApiClient from './FetchApiClient';

const BASE_URL = 'https://api.example.com';

describe('FetchApiClient', () => {
  let client: FetchApiClient;

  beforeEach(() => {
    client = new FetchApiClient(BASE_URL);
    vi.restoreAllMocks();
  });

  describe('Content-Type 자동 설정', () => {
    it('객체 body일 때 Content-Type을 application/json으로 설정한다', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(createJsonResponse({})));

      await client.post('/users', {body: {name: 'test'}});

      const {headers} = getFetchCall();
      expect((headers as Headers).get('Content-Type')).toBe('application/json');
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

function createJsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: new Headers([['Content-Type', 'application/json']]),
  });
}

function getFetchCall() {
  const [url, options] = vi.mocked(fetch).mock.lastCall!;
  return {url: url as string, ...(options as RequestInit)};
}
