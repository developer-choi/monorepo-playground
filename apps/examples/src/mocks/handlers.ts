import {http, HttpResponse} from 'msw';
import {env} from '@/shared/env';

export const handlers = [
  http.get(`${env.NEXT_PUBLIC_API_URL}/api/board`, () => {
    return HttpResponse.json([{id: 1, title: 'Test Board'}]);
  }),
];
