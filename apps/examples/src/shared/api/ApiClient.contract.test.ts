import {describe, it, expect, beforeEach} from 'vitest';
import {http, HttpResponse} from 'msw';
import type ApiClient from './ApiClient';
import FetchApiClient from './FetchApiClient';
import KyApiClient from './KyApiClient';
import {HTTP_STATUS} from './httpStatus';
import {server} from '@/mocks/node';
import ApiResponseError from '@/shared/error/class/ApiResponseError';
import ApiRequestError from '@/shared/error/class/ApiRequestError';

const PREFIX_URL = 'https://contract.test';
const USERS_PATH = 'users';
const USER_PATH = 'users/1';
const MISSING_USER_PATH = 'users/999';
const USERS_URL = `${PREFIX_URL}/${USERS_PATH}`;
const USER_URL = `${PREFIX_URL}/${USER_PATH}`;
const MISSING_USER_URL = `${PREFIX_URL}/${MISSING_USER_PATH}`;

const implementations = [
  {name: 'FetchApiClient', createClient: () => new FetchApiClient(PREFIX_URL)},
  {name: 'KyApiClient', createClient: () => new KyApiClient(PREFIX_URL)},
];

describe.for(implementations)('ApiClient 계약 > $name', ({createClient}) => {
  let client: ApiClient;

  beforeEach(() => {
    client = createClient();
  });

  describe('General cases', () => {
    it('GET 요청 후 JSON을 반환한다', async () => {
      const user = {id: 1};
      server.use(http.get(USER_URL, () => HttpResponse.json(user)));

      expect(await client.get(USER_PATH)).toEqual(user);
    });

    it.for([
      {method: 'post', status: HTTP_STATUS.CREATED},
      {method: 'put', status: HTTP_STATUS.OK},
      {method: 'patch', status: HTTP_STATUS.OK},
    ] as const)('$method 요청 후 JSON을 반환한다', async ({method, status}) => {
      const body = {name: 'sent'};
      server.use(
        http[method](USER_URL, async ({request}) => {
          if ((await request.text()) !== JSON.stringify(body)) {
            return new HttpResponse('body가 기대와 다릅니다', {status: HTTP_STATUS.BAD_REQUEST});
          }
          return HttpResponse.json({ok: true}, {status});
        }),
      );

      await expect(client[method](USER_PATH, {body})).resolves.toEqual({ok: true});
    });

    it('DELETE 요청 후 JSON을 반환한다', async () => {
      server.use(http.delete(USER_URL, () => HttpResponse.json({ok: true})));

      expect(await client.delete(USER_PATH)).toEqual({ok: true});
    });

    it.for([
      {body: {key: 'value'}, label: '객체'},
      {body: 42, label: 'number'},
      {body: 'raw text', label: 'string'},
      {body: true, label: 'boolean'},
      {body: null, label: 'null'},
    ])('$label body를 JSON으로 직렬화해 보낸다', async ({body}) => {
      server.use(
        http.post(USERS_URL, async ({request}) => {
          if ((await request.text()) !== JSON.stringify(body)) {
            return new HttpResponse('본문이 기대와 다릅니다', {status: HTTP_STATUS.BAD_REQUEST});
          }
          return HttpResponse.json({ok: true});
        }),
      );

      await expect(client.post(USERS_PATH, {body})).resolves.toEqual({ok: true});
    });

    it('body가 있으면 Content-Type을 application/json으로 붙인다', async () => {
      server.use(
        http.post(USERS_URL, ({request}) => {
          if (request.headers.get('Content-Type') !== 'application/json') {
            return new HttpResponse('JSON 본문이 필요합니다', {status: HTTP_STATUS.UNSUPPORTED_MEDIA_TYPE});
          }
          return HttpResponse.json({ok: true});
        }),
      );

      await expect(client.post(USERS_PATH, {body: {name: 'sent'}})).resolves.toEqual({ok: true});
    });

    it('searchParams를 쿼리 문자열로 붙여 보낸다', async () => {
      const page = 2;
      server.use(
        http.get(USERS_URL, ({request}) => {
          if (new URL(request.url).searchParams.get('page') !== String(page)) {
            return new HttpResponse('page가 필요합니다', {status: HTTP_STATUS.BAD_REQUEST});
          }
          return HttpResponse.json({ok: true});
        }),
      );

      expect(await client.get(USERS_PATH, {searchParams: {page}})).toEqual({ok: true});
    });
  });

  describe('Edge cases', () => {
    it('호출자가 Content-Type을 지정하면 덮어쓰지 않는다', async () => {
      const contentType = 'application/vnd.api+json';
      server.use(
        http.post(USERS_URL, ({request}) => {
          if (request.headers.get('Content-Type') !== contentType) {
            return new HttpResponse('지정한 Content-Type이 유지되지 않았습니다', {
              status: HTTP_STATUS.UNSUPPORTED_MEDIA_TYPE,
            });
          }
          return HttpResponse.json({ok: true});
        }),
      );

      await expect(
        client.post(USERS_PATH, {body: {name: 'sent'}, headers: {'Content-Type': contentType}}),
      ).resolves.toEqual({ok: true});
    });

    it.for([USER_PATH, `/${USER_PATH}`])('경로 앞 슬래시와 무관하게 %s를 같은 URL로 보낸다', async (path) => {
      const user = {id: 1};
      server.use(http.get(USER_URL, () => HttpResponse.json(user)));

      expect(await client.get(path)).toEqual(user);
    });

    it('상태 코드가 달라도 2xx가 아니면 모두 ApiResponseError로 던진다', async () => {
      server.use(
        http.get(MISSING_USER_URL, () => HttpResponse.json({message: 'Not Found'}, {status: HTTP_STATUS.NOT_FOUND})),
      );

      await expect(client.get(MISSING_USER_PATH)).rejects.toThrow(ApiResponseError);
    });

    it('에러에 method, status, url, errorData, headers가 담긴다', async () => {
      const errorData = {message: 'Bad Request'};
      const headers = {'X-Trace-Id': 'trace-1'};
      server.use(http.post(USERS_URL, () => HttpResponse.json(errorData, {status: HTTP_STATUS.BAD_REQUEST})));

      const error = await getError<ApiResponseError>(() => client.post(USERS_PATH, {body: {name: ''}, headers}));

      expect(error).toBeInstanceOf(ApiResponseError);
      expect(error.method).toBe('POST');
      expect(error.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(error.url).toBe(USERS_URL);
      expect(error.errorData).toEqual(errorData);
      expect(error.headers).toEqual(headers);
    });

    it('요청 body가 에러에 보존된다', async () => {
      const body = {name: 'test'};
      server.use(http.post(USERS_URL, () => HttpResponse.json({}, {status: HTTP_STATUS.BAD_REQUEST})));

      const error = await getError<ApiResponseError>(() => client.post(USERS_PATH, {body}));

      expect(error.body).toEqual(body);
    });

    it('서버 응답이 유효하지 않은 JSON이면 errorData가 null이다', async () => {
      server.use(http.get(USERS_URL, () => new HttpResponse('not json', {status: HTTP_STATUS.BAD_REQUEST})));

      const error = await getError<ApiResponseError>(() => client.get(USERS_PATH));

      expect(error).toBeInstanceOf(ApiResponseError);
      expect(error.errorData).toBeNull();
    });

    it('네트워크 실패 시 ApiRequestError에 요청 정보가 담긴다', async () => {
      const body = {name: 'test'};
      server.use(http.post(USERS_URL, () => HttpResponse.error()));

      const error = await getError<ApiRequestError>(() => client.post(USERS_PATH, {body}));

      expect(error).toBeInstanceOf(ApiRequestError);
      expect(error.method).toBe('POST');
      expect(error.url).toBe(USERS_URL);
      expect(error.body).toEqual(body);
    });
  });
});

async function getError<T>(fn: () => Promise<unknown>): Promise<T> {
  try {
    await fn();
  } catch (error) {
    return error as T;
  }
  expect.fail('에러를 던질 것으로 기대했지만 정상 반환했습니다');
}
