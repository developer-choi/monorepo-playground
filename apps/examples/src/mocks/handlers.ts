import {http, HttpResponse} from 'msw';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export const handlers = [
  http.get(`${API_URL}/api/board`, () => {
    return HttpResponse.json([{id: 1, title: 'Test Board'}]);
  }),
];
