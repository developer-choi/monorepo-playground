import {createEnv} from '@t3-oss/env-nextjs';
import {z} from 'zod';

export const env = createEnv({
  client: {
    // protocol을 제한하지 않으면 'localhost:3000'이 통과한다 — localhost가 스킴으로 해석되기 때문이다.
    NEXT_PUBLIC_API_URL: z.url({protocol: /^https?$/}),
  },
  runtimeEnv: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
});
