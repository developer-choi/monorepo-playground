import FetchApiClient from './FetchApiClient';
import {env} from '@/shared/env';

export const api = new FetchApiClient(env.NEXT_PUBLIC_API_URL);
