import {http, HttpResponse} from 'msw';
import {describe, expect, it} from 'vitest';
import {server} from '../../test/server.js';
import FetchApiClient from './FetchApiClient.js';

const CONSTRUCTOR_ORIGIN = 'https://constructor.example.com';
const CONTEXT_ORIGIN = 'https://context.example.com';
const PATH = '/api/ping';

describe('FetchApiClient.get()', () => {
  describe('General cases', () => {
    it('요청 직전에 받은 컨텍스트의 prefixUrl을 생성자의 prefixUrl 대신 써야 한다', async () => {
      server.use(http.get(`${CONTEXT_ORIGIN}${PATH}`, () => HttpResponse.json({ok: true})));
      const client = new FetchApiClient(CONSTRUCTOR_ORIGIN, () => Promise.resolve({prefixUrl: CONTEXT_ORIGIN}));

      await expect(client.get(PATH)).resolves.toEqual({ok: true});
    });

    it('요청 직전에 받은 컨텍스트의 헤더를 실어 보내야 한다', async () => {
      const token = 'session-token';
      server.use(
        http.get(`${CONTEXT_ORIGIN}${PATH}`, ({request}) =>
          request.headers.get('X-Session') === token
            ? HttpResponse.json({ok: true})
            : HttpResponse.json({ok: false}, {status: 401}),
        ),
      );
      const client = new FetchApiClient(CONSTRUCTOR_ORIGIN, () =>
        Promise.resolve({prefixUrl: CONTEXT_ORIGIN, headers: [['X-Session', token]]}),
      );

      await expect(client.get(PATH)).resolves.toEqual({ok: true});
    });

    it('컨텍스트가 없으면 생성자의 prefixUrl로 요청해야 한다', async () => {
      server.use(http.get(`${CONSTRUCTOR_ORIGIN}${PATH}`, () => HttpResponse.json({ok: true})));
      const client = new FetchApiClient(CONSTRUCTOR_ORIGIN);

      await expect(client.get(PATH)).resolves.toEqual({ok: true});
    });
  });

  describe('Edge cases', () => {
    it('컨텍스트와 호출부가 같은 헤더 키를 주면 호출부 값을 써야 한다', async () => {
      const callerTrace = 'caller';
      server.use(
        http.get(`${CONTEXT_ORIGIN}${PATH}`, ({request}) => HttpResponse.json({trace: request.headers.get('X-Trace')})),
      );
      const client = new FetchApiClient(CONSTRUCTOR_ORIGIN, () =>
        Promise.resolve({prefixUrl: CONTEXT_ORIGIN, headers: [['X-Trace', 'context']]}),
      );

      await expect(client.get(PATH, {headers: [['X-Trace', callerTrace]]})).resolves.toEqual({trace: callerTrace});
    });

    it.for([
      {label: '요청 자체가 실패하면', response: () => HttpResponse.error(), errorName: 'ApiRequestError'},
      {
        label: '2xx가 아닌 응답이면',
        response: () => HttpResponse.json(null, {status: 500}),
        errorName: 'ApiResponseError',
      },
    ])(
      '$label 에러의 headers에 컨텍스트 헤더(쿠키)를 남기지 않고 호출부 헤더만 남겨야 한다',
      async ({response, errorName}) => {
        const callerHeaders: HeadersInit = [['X-Trace', 'caller']];
        server.use(http.get(`${CONTEXT_ORIGIN}${PATH}`, response));
        const client = new FetchApiClient(CONSTRUCTOR_ORIGIN, () =>
          Promise.resolve({prefixUrl: CONTEXT_ORIGIN, headers: [['Cookie', 'session=secret']]}),
        );

        await expect(client.get(PATH, {headers: callerHeaders})).rejects.toMatchObject({
          name: errorName,
          headers: callerHeaders,
        });
      },
    );
  });
});
