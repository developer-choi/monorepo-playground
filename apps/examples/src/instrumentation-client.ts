// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';
import {beforeSend} from '@/shared/sentry/before-send';

Sentry.init({
  dsn: 'https://62de46a2edebd4a30601b4179549c068@o4508301096714240.ingest.us.sentry.io/4511337766780928',
  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,

  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
  debug: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT === 'development',
  beforeSend,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
