# Auth Playground

NextAuth v5 + JWT + Refresh Token 인증 메커니즘 예제.

## 백엔드

dada 프로젝트의 `backend-bak`을 사용한다.

```bash
cd C:\Users\dbwls\WebstormProjects\dada\backend-bak
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

백엔드 API:
- `POST /api/auth/login` — 로그인 (access_token 반환, refresh_token Set-Cookie)
- `POST /api/auth/refresh` — 토큰 갱신 (refresh_token 쿠키 필요)
- `GET /api/auth/me` — 현재 유저 정보 (access_token 필요)
- `POST /api/auth/logout` — 로그아웃 (refresh_token 폐기)

## 실행

```bash
npm run dev
```

http://localhost:3000 접속 후 테스트 페이지 링크 클릭.

## 테스트 페이지

| 경로 | 설명 | 검증 포인트 |
|------|------|-----------|
| `/test/ssr` | 서버 컴포넌트에서 serverFetch로 API 호출 | proxy.ts가 선제적으로 토큰 갱신 → cookies()로 읽기 |
| `/test/csr` | useEffect + ky로 마운트 시 API 호출 | 새로고침 시 proxy.ts가 미리 갱신, 401 안 남 |
| `/test/client-click` | 버튼 클릭으로 ky API 호출 | 6초 대기 후 클릭 → 401 → ky beforeRetry → refresh → 재시도 |

## 환경 변수 (.env.local)

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
AUTH_SECRET=your-secret-key-change-this
```

## 문서

- [Auth Mechanism 상세](./docs/auth-mechanism.md) — 전체 메커니즘, 3가지 케이스, Double Refresh 문제, FAQ
