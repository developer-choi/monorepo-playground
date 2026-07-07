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

  describe('URL 조합 — 슬래시 정규화', () => {
    it.each([
      {baseUrl: 'http://localhost:3000', path: '/api/board', label: '끝X + 앞O'},
      {baseUrl: 'http://localhost:3000/', path: '/api/board', label: '끝O + 앞O (배포 버그 케이스)'},
      {baseUrl: 'http://localhost:3000/', path: 'api/board', label: '끝O + 앞X'},
      {baseUrl: 'http://localhost:3000', path: 'api/board', label: '끝X + 앞X'},
      {baseUrl: 'http://localhost:3000//', path: '//api/board', label: '중복 슬래시 붕괴'},
    ])('$label → http://localhost:3000/api/board', async ({baseUrl, path}) => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(createJsonResponse({})));

      await new FetchApiClient(baseUrl).get(path);

      expect(getFetchCall().url).toBe('http://localhost:3000/api/board');
    });

    it('프로토콜의 // 는 보존한다', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(createJsonResponse({})));

      await new FetchApiClient('https://api.example.com/').get('/users/1');

      expect(getFetchCall().url).toBe('https://api.example.com/users/1');
    });

    it('baseUrl이 비어있으면 상대 경로로 단일 슬래시를 붙인다', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(createJsonResponse({})));

      await new FetchApiClient('').get('/api/board');

      expect(getFetchCall().url).toBe('/api/board');
    });

    it('searchParams가 있어도 단일 슬래시로 조인한 뒤 쿼리를 붙인다', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(createJsonResponse({})));

      await new FetchApiClient('http://localhost:3000/').get('/api/board', {searchParams: {page: 2, limit: 24}});

      expect(getFetchCall().url).toBe('http://localhost:3000/api/board?limit=24&page=2');
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
