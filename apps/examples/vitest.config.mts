import {defineConfig} from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import {loadEnv} from 'vite';

export default defineConfig(({mode}) => ({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    restoreMocks: true,
    // 앱과 동일한 env(.env.local의 NEXT_PUBLIC_API_URL)를 테스트 process.env에 주입.
    // 싱글턴 api가 절대 baseUrl을 갖게 해 MSW가 Node에서 요청을 가로챌 수 있다.
    env: loadEnv(mode, process.cwd(), 'NEXT_PUBLIC_'),
  },
}));
