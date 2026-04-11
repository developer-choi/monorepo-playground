import FetchApiClient from './FetchApiClient';

export const api = new FetchApiClient(process.env.NEXT_PUBLIC_API_URL ?? '');
