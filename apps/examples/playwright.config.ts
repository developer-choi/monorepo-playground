import {defineConfig, devices} from '@playwright/test';

/** 콜드 빌드는 Playwright 기본 60초를 넘기므로 넉넉히 잡는다. */
const WEB_SERVER_TIMEOUT_MS = 180_000;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: {...devices['Desktop Chrome']},
    },
    {
      name: 'firefox',
      use: {...devices['Desktop Firefox']},
    },
    {
      name: 'webkit',
      use: {...devices['Desktop Safari']},
    },
  ],

  /*
   * 프로덕션 빌드를 띄운 뒤 테스트한다 — next dev는 배포본과 동작이 달라 E2E 신뢰도가 떨어진다.
   * turbo가 워크스페이스 루트에서 design-system → examples 순으로 빌드하고(build의 dependsOn),
   * 변경이 없으면 캐시가 맞아 재실행이 빠르다.
   */
  webServer: {
    command: 'npm run examples:start',
    cwd: '../..',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: WEB_SERVER_TIMEOUT_MS,
  },
});
