import {FetchApiClient} from '@developer-choi/utils/api';
import {env} from '@/shared/env';

export const api = new FetchApiClient(env.NEXT_PUBLIC_API_URL);
