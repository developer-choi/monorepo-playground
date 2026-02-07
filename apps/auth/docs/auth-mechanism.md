# Auth Mechanism (NextAuth + JWT + Refresh Token)

## 토큰 저장 위치

| 토큰 | 저장 위치 | 관리 주체 |
|------|----------|----------|
| access_token | NextAuth JWT (암호화 쿠키) | auth.ts JWT callback |
| access_token | 일반 쿠키 (`access_token`) | proxy.ts가 JWT에서 꺼내 sync |
| access_token | 요청 헤더 (`x-access-token`) | proxy.ts가 서버 컴포넌트용으로 설정 |
| refresh_token | NextAuth JWT (암호화 쿠키) | auth.ts JWT callback |

- NextAuth JWT = `authjs.session-token` 쿠키 (암호화, HttpOnly)
- `access_token` 쿠키 = proxy.ts가 ky 클라이언트용으로 sync (비암호화, JS 접근 가능)
- `x-access-token` 헤더 = proxy.ts가 서버 컴포넌트용으로 설정 (요청 헤더, 쿠키보다 안정적)

## 관련 파일

| 파일 | 역할 |
|------|------|
| `auth.ts` | NextAuth 설정. 로그인 에러 분기, JWT callback (만료 체크 + refreshPromise dedup + refreshCache), session callback |
| `src/proxy.ts` | Next.js 미들웨어. auth guard + access_token 쿠키 sync + x-access-token 요청 헤더 설정 |
| `src/shared/api/client.ts` | **통합 ky 클라이언트**. 서버(x-access-token 헤더) + 클라이언트(쿠키) 양쪽 지원 |
| `src/shared/api/server.ts` | SSR용 fetch 유틸리티. headers()에서 x-access-token 읽기 |
| `src/shared/api/token.ts` | 브라우저 쿠키에서 access_token 읽기 (ky beforeRequest용) |
| `src/shared/AppProvider.tsx` | SessionProvider 설정 (refetchInterval=0으로 race condition 방지) |
| `types/next-auth.d.ts` | NextAuth Session, User, JWT 타입 확장 |

## 로그인 흐름

```
브라우저 → signIn("credentials", { tenant_id, username, password })
  → NextAuth → auth.ts authorize()
    → fetch(백엔드 /api/auth/login)
    → 응답 body: { access_token, user }
    → 응답 Set-Cookie: refresh_token=xxx; HttpOnly
    → extractRefreshToken()으로 Set-Cookie에서 refresh_token 파싱
    → return { id, name, email, accessToken, refreshToken, tenantId }
  → JWT callback: accessToken, refreshToken, tenantId, accessTokenExpires를 JWT에 저장
  → NextAuth가 JWT를 암호화해서 세션 쿠키에 저장
```

### 로그인 에러 코드별 처리

`authorize()`에서 백엔드 응답 status에 따라 `CredentialsSignin` 서브클래스를 throw:

| Status | 에러 클래스 | code |
|--------|-----------|------|
| 401 | `InvalidCredentials` | `INVALID_CREDENTIALS` |
| 403 | `InactiveAccount` | `INACTIVE_ACCOUNT` |
| 422 | `ValidationError` | `VALIDATION_ERROR` |

로그인 페이지에서 `signIn()` 결과의 `result?.code`로 분기하여 적절한 에러 메시지 표시.

## x-access-token 헤더 패턴

### 왜 쿠키 대신 요청 헤더를 쓰나?

미들웨어(proxy.ts)가 `response.cookies.set("access_token", ...)`으로 설정한 쿠키는 **브라우저 응답**에 `Set-Cookie`로 내려간다. 하지만 같은 요청의 서버 컴포넌트가 `cookies()`로 읽을 때, 미들웨어가 **방금 설정한** 쿠키가 반영될 수도 있고 안 될 수도 있다 (Next.js 버전/동작에 따라 다름).

반면, 미들웨어가 **요청 헤더**에 설정한 값은 서버 컴포넌트의 `headers()`에서 **항상 즉시 반영**된다. 이것이 더 안정적인 패턴.

### 동작 흐름

```
브라우저 요청 → proxy.ts (미들웨어)
  → auth() → JWT callback → accessToken 확보
  → requestHeaders.set("x-access-token", accessToken)
  → NextResponse.next({ request: { headers: requestHeaders } })
  → 서버 컴포넌트에서 headers().get("x-access-token")으로 읽기
```

### 통합 ky 클라이언트 (client.ts)

하나의 ky 인스턴스로 서버(RSC)와 클라이언트 양쪽 지원:

```ts
const isServer = typeof document === "undefined";

// beforeRequest
const token = isServer ? await getServerToken() : getAccessToken();
// 서버: headers()에서 x-access-token 읽기
// 클라이언트: document.cookie에서 access_token 읽기

// beforeRetry
if (isServer) return ky.stop; // 서버에서는 retry 안 함
// 클라이언트: /api/auth/session으로 refresh 후 retry
```

## 3가지 토큰 갱신 케이스

### Case 1: 페이지 이동/새로고침 (proxy.ts — 선제적 갱신)

```
브라우저 요청 → proxy.ts
  → auth() 호출
  → JWT callback 실행
    → getTokenExpiry()로 access_token JWT의 exp claim 디코딩
    → Date.now() < accessTokenExpires? → 유효하면 그대로 반환
    → 만료됐으면 → refreshAccessToken(token)
      → refreshCache 체크 → 유효하면 캐시 반환
      → refreshPromise 체크 → 이미 진행 중이면 dedup
      → doRefreshAccessToken() → fetch(백엔드 /api/auth/refresh)
      → 성공: 새 accessToken + 새 refreshToken → JWT 갱신 + cache 저장
      → 실패: error: "RefreshAccessTokenError" 설정
  → proxy.ts: x-access-token 요청 헤더 설정 + access_token 쿠키 sync
  → 페이지 렌더링 시작 (이미 갱신된 토큰)
```

**핵심**: 페이지가 렌더링되기 전에 proxy.ts가 토큰을 미리 갱신하므로, 서버 컴포넌트/클라이언트 컴포넌트 모두 신선한 토큰을 사용할 수 있다.

### Case 2: CSR에서 API 호출 중 401 (ky beforeRetry — 반응적 갱신)

```
useEffect/버튼 클릭 → ky API 호출
  → beforeRequest: 쿠키에서 access_token 읽어서 Authorization 헤더 설정
  → 백엔드 응답: 401
  → ky retry 발동 (statusCodes: [401])
  → beforeRetry: refreshAccessToken() 호출
    → fetch("/api/auth/session") ← 같은 도메인 HTTP 요청
      → NextAuth API 라우트 (/api/auth/[...nextauth])
      → JWT callback 실행 → 만료 확인 → refreshAccessToken()
      → 새 accessToken으로 JWT 갱신
      → 응답: { accessToken: "새 토큰", ... }
    → document.cookie에 새 access_token 저장
    → 새 토큰을 request 헤더에 설정
  → ky가 원래 요청 재시도 → 성공
```

**핵심**: 페이지에 머무는 동안 토큰이 만료되면 (proxy.ts 안 타니까), ky가 401을 감지해서 NextAuth 세션 엔드포인트를 통해 갱신 후 자동 재시도한다.

### Case 3: SSR에서 API 호출 (통합 ky / serverFetch — proxy.ts 의존)

```
서버 컴포넌트 → api.get(...) 또는 serverFetch(url)
  → headers()에서 x-access-token 읽기 ← proxy.ts가 설정한 요청 헤더
  → fetch(url, Authorization: Bearer xxx)
  → 401 시: 서버에서는 ky.stop (retry 안 함) — proxy.ts가 이미 갱신했으므로 401이면 진짜 문제
  → 응답 반환
```

**핵심**: 서버 컴포넌트는 auth()를 직접 호출하지 않는다. proxy.ts가 이미 토큰을 갱신하고 요청 헤더에 설정했으므로, headers()로 읽기만 한다.

## refreshPromise + refreshCache (auth.ts 내부)

### 문제: 동일 런타임 내 동시 auth() 호출

같은 런타임(Edge 또는 Node.js) 안에서 여러 요청이 동시에 auth()를 호출하면, 모두 같은 refresh token으로 백엔드를 호출할 수 있다. 백엔드가 refresh token rotation을 하면 첫 번째만 성공하고 나머지는 실패.

### 해결: refreshPromise (dedup)

```ts
let refreshPromise: Promise<JWT> | null = null;

async function refreshAccessToken(token: JWT): Promise<JWT> {
  if (refreshPromise) {
    // 이미 진행 중인 refresh가 있으면 그 결과를 기다림
    return refreshPromise;
  }
  refreshPromise = doRefreshAccessToken(token).finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}
```

같은 런타임의 동시 요청이 모두 하나의 Promise를 공유 → 백엔드 호출 1회만 발생.

### 해결: refreshCache

```ts
let refreshCache: { accessToken, refreshToken, accessTokenExpires } | null = null;

// refresh 성공 시 cache 저장
// 다음 호출 시 cache가 유효하면 (accessTokenExpires > Date.now()) 백엔드 호출 없이 반환
```

refreshPromise가 resolve된 후에 오는 요청도 캐시로 즉시 응답 → 불필요한 백엔드 호출 방지.

### 한계: 크로스 런타임은 커버 못함

`refreshPromise`와 `refreshCache`는 **모듈 변수** → Edge Runtime과 Node.js Runtime은 별개 인스턴스. 이 문제는 아래 Race Condition 섹션 참조.

## 왜 serverFetch/통합 ky에서 auth()를 호출하면 안 되는가? (Double Refresh 문제)

같은 HTTP 요청 안에서:
1. **proxy.ts** → `auth()` → JWT callback → refreshAccessToken() → 성공 (refresh_token_v1 사용)
2. 백엔드가 refresh_token을 **rotate** → refresh_token_v2로 교체, v1 무효화
3. **serverFetch** → `auth()` → JWT callback → refreshAccessToken() → **실패** (같은 v1 사용, 이미 무효)

proxy.ts는 응답 쿠키에 갱신된 JWT를 쓰지만, 같은 요청의 서버 컴포넌트는 아직 **원본 요청 쿠키**를 읽는다. 따라서 serverFetch의 auth()는 옛날 JWT(v1)를 보고 다시 refresh를 시도 → 이미 rotate된 토큰이라 무효.

**해결**: serverFetch/통합 ky는 auth() 대신 `headers()`를 사용한다. proxy.ts가 `x-access-token` 요청 헤더로 설정한 값을 읽으므로, 항상 갱신된 토큰을 사용.

---

## Refresh Token Rotation Race Condition

### 현상
- 코드 수정(hot reload) 후 또는 드물게 정상 운영 중에 **로그인이 풀림**
- `RefreshAccessTokenError` → 로그인 페이지로 리다이렉트

### 근본 원인: Edge/Node.js 런타임 격리 + Refresh Token Rotation

#### Next.js 런타임 구조
- **Edge Runtime**: `proxy.ts` (미들웨어) — `auth()` 호출
- **Node.js Runtime**: `/api/auth/session` (NextAuth 세션 엔드포인트) — `auth()` 호출
- 두 런타임은 **서로 다른 모듈 인스턴스** → `refreshPromise`, `refreshCache` 등 모듈 변수가 공유 안 됨

#### Race Condition 발생 흐름
```
1. Access token 만료됨
2. 브라우저가 동시에 두 요청을 보냄:
   - 페이지 요청 → Edge 미들웨어 → auth() → jwt callback → refreshAccessToken()
   - 세션 폴링 (/api/auth/session) → Node.js → auth() → jwt callback → refreshAccessToken()
3. Edge의 refreshPromise와 Node.js의 refreshPromise는 별개 변수 → dedup 안 먹힘
4. 둘 다 같은 old refresh token으로 백엔드 /api/auth/refresh 호출
5. Edge가 먼저 도착 → 백엔드: old token revoke + new token 발급 → 200
6. Node.js가 직후 도착 → 백엔드: old token 이미 revoked → 401 INVALID_TOKEN
7. Node.js auth() → error: "RefreshAccessTokenError" → JWT에 에러 플래그
8. 미들웨어: hasRefreshError → 로그인 페이지로 redirect
```

#### 왜 hot reload에서 더 자주?
- Hot reload → 개발 서버 재컴파일 (수초 소요) → 그 사이 access token 만료
- 재컴파일 완료 후 미들웨어 + 세션 + 서버 컴포넌트가 동시에 auth() 호출

### 프론트엔드 해결책

#### 1. SessionProvider 세션 폴링 비활성화 (핵심)

```tsx
<SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
```

- 매번 `/api/auth/session` 호출하던 것 중단
- Edge(미들웨어)와 Node.js(세션 API)가 동시에 refresh할 확률 대폭 감소
- **프로덕션(yarn start) + 15분 토큰 + 세션 폴링 비활성화 = race condition 발생 확률 사실상 0**

#### 2. refreshPromise + refreshCache (같은 런타임 내 방어)

- refreshPromise: 같은 런타임 내 동시 요청 dedup
- refreshCache: refresh 성공 결과를 accessTokenExpires까지 캐시
- 크로스 런타임은 커버 못하지만, 세션 폴링 비활성화로 충분

#### 3. 백엔드 스펙은 정상

백엔드의 즉시 revoke (refresh token rotation)는 올바른 보안 패턴. 프론트에서 동시 호출을 안 하면 됨.

---

## access_token 만료 시간 판단 방법

```ts
function getTokenExpiry(accessToken: string): number {
  const base64Url = accessToken.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const payload = JSON.parse(atob(base64));
  return payload.exp * 1000; // 초 → 밀리초
}
```

JWT는 `header.payload.signature` 구조이며, payload는 base64 인코딩 (암호화 아님). `exp` claim에 만료 시간(Unix timestamp)이 들어있으므로 디코딩해서 읽는다.

## FAQ

### Q: proxy.ts가 매번 refresh하면 성능 문제 없나?
proxy.ts의 auth()는 JWT callback에서 `Date.now() < accessTokenExpires` 체크를 한다. 토큰이 유효하면 그대로 반환하고 백엔드를 호출하지 않는다. 만료됐을 때만 refresh API를 호출하며, refreshCache가 있으면 그것도 건너뛴다.

### Q: CSR에서 왜 새로고침하면 401이 안 나나?
새로고침 = proxy.ts가 먼저 실행. 토큰 만료됐으면 선제적으로 갱신하고 쿠키/헤더에 신선한 토큰을 설정한다. 클라이언트 코드가 실행될 때는 이미 갱신된 토큰이므로 401이 발생하지 않는다.

### Q: CSR에서 401 → refresh 흐름은 언제 발생하나?
페이지에 머물면서 토큰이 만료된 후 API를 호출할 때. 예: 페이지 로드 후 15분 이상 대기 → 버튼 클릭 또는 refetch 트리거 → ky가 만료된 토큰으로 요청 → 401 → refresh → 재시도.

### Q: useSuspenseQuery는 왜 dynamic(import, { ssr: false })가 필요한가?
"use client"여도 Next.js는 서버에서 렌더링을 시도한다. useSuspenseQuery가 서버에서 실행되면 ky가 서버 환경에서 동작하게 되는데, document.cookie 접근 등이 불가능하여 에러가 발생한다. `dynamic(import, { ssr: false })`로 클라이언트에서만 렌더링되게 해야 한다.

단, 통합 ky 클라이언트를 사용하면 서버에서도 `headers()`로 토큰을 읽으므로, SSR에서 ky를 써도 에러가 발생하지 않는다. 이 경우 `dynamic`이 불필요할 수 있다.

### Q: 서버 컴포넌트에서 API 호출은 어떻게 하나?
두 가지 방법:
1. **통합 ky** (`api.get(...)`) — `isServer` 분기로 `headers()`에서 `x-access-token` 읽음
2. **serverFetch()** — `headers()`에서 `x-access-token` 읽어서 직접 fetch

둘 다 auth()를 호출하지 않고 proxy.ts가 설정한 x-access-token 헤더를 읽는다.

### Q: refresh_token은 어떻게 서버사이드에서 사용하나?
로그인 시 백엔드가 Set-Cookie로 보내는 refresh_token을 `extractRefreshToken()`으로 파싱해서 NextAuth JWT에 저장한다. 서버에서 refresh할 때 `Cookie: refresh_token=xxx` 헤더로 직접 전달한다 (`credentials: "include"`는 서버에서 동작하지 않으므로).

### Q: refresh_token이 rotate되면 어떻게 되나?
백엔드 refresh 응답의 Set-Cookie에서 새 refresh_token을 추출(`extractRefreshToken`)해서 JWT에 갱신한다. 추출 실패 시 이전 토큰을 유지하는데, 백엔드가 이미 rotate했으면 다음 refresh에서 INVALID_TOKEN 에러가 발생한다.

### Q: 로그아웃은 어떻게 처리하나?
1. 백엔드에 refresh_token 폐기 요청
2. `signOut()` from next-auth/react — NextAuth 세션 쿠키 삭제
3. proxy.ts가 access_token 쿠키 삭제 (세션 없으면 자동)

---

## 심화 FAQ

### Q: SSR은 왜 CSR처럼 401 → retry 로직이 없나?
통합 ky 클라이언트에서 서버 `beforeRetry`는 `ky.stop`을 반환해서 retry를 안 한다. **proxy.ts가 페이지 렌더링 전에 이미 토큰을 갱신**하기 때문이다. SSR에서 401이 발생한다면 토큰 자체가 무효한 것이므로 retry해봤자 의미 없다.

### Q: refresh_token이 브라우저 쿠키에 없는 이유?
`authorize()`는 **서버에서** 백엔드 login API를 호출한다. 백엔드가 `Set-Cookie: refresh_token=...`을 응답해도 서버-to-서버 통신이라 브라우저에 전달되지 않는다. 그래서 `extractRefreshToken()`으로 값만 추출해서 NextAuth JWT(암호화된 `authjs.session-token` 쿠키) 안에 저장한다. 브라우저 JS에서 직접 접근 불가능하므로 보안 수준은 HttpOnly 쿠키와 비슷하거나 오히려 나음.

### Q: 백엔드가 Set-Cookie로 주는 걸 프론트가 마음대로 빼도 되나?
NextAuth Credentials Provider 구조상 불가피하다. authorize()가 서버에서 실행되므로 Set-Cookie가 브라우저에 안 간다. 대안으로 백엔드가 refresh_token을 **response body**에 내려주면 Set-Cookie 파싱 없이 깔끔하게 처리 가능. 예: `{ access_token: "...", refresh_token: "..." }`. 백엔드 수정이 가능하면 body가 더 자연스럽고, 안 되면 현재 방식이 일반적인 패턴.

### Q: 일반 API 요청에 refresh_token도 같이 보내야 하나?
아니다. **access_token만** `Authorization: Bearer ...`로 보낸다. refresh_token은 **오직 `/api/auth/refresh` 호출할 때만** 사용된다.

### Q: 브라우저에서 refresh_token을 만료시킬 수 있나?
불가능하다. refresh_token이 NextAuth JWT 안에 암호화되어 있어서 브라우저에서 직접 수정/삭제할 방법이 없다. 가능한 방법:
- **로그아웃**: `signOut()` → JWT 통째로 삭제 → refresh_token도 같이 사라짐
- **백엔드 revoke**: 백엔드에 revoke API가 있으면 호출
- **백엔드 DB 직접 삭제**: 해당 refresh_token 무효화
- **테스트용**: `useSession`의 `update({ invalidateRefresh: true })`로 JWT 안의 refresh_token을 잘못된 값으로 교체 (auth.ts JWT callback에서 trigger === "update" 핸들링 필요)

### Q: refresh 실패 시 어떻게 로그인 페이지로 보내나?
두 가지 경로:
1. **SSR (proxy.ts)**: JWT callback에서 refresh 실패 → `token.error = "RefreshAccessTokenError"` → proxy.ts에서 `req.auth?.error === "RefreshAccessTokenError"` 감지 → `/login?callbackUrl=원래경로+쿼리스트링`으로 리다이렉트
2. **CSR (ky)**: 401 → beforeRetry에서 refresh 시도 → `/api/auth/session` → JWT callback refresh 실패 → session.accessToken이 null → ky beforeRetry에서 `window.location.href = /login?callbackUrl=...`

### Q: 로그인 후 원래 가려던 페이지로 돌아가는 방법?
proxy.ts/ky에서 로그인 리다이렉트 시 `callbackUrl` 쿼리 파라미터에 원래 pathname + search를 담는다. 로그인 페이지에서 `useSearchParams().get("callbackUrl")`로 읽어서, 로그인 성공 후 `router.push(callbackUrl)`로 이동.

### Q: redirect loop (too many redirects) 원인?
refresh 실패 시 `req.auth`는 여전히 존재한다 (JWT에 데이터가 남아있으므로). `isAuthenticated = !!req.auth`가 true → 로그인 페이지에서 "인증됨 + public path" 조건에 걸려 `/home`으로 리다이렉트 → `/home`에서 다시 refresh 실패 → `/login`으로 → 무한 루프. **해결**: `isAuthenticated = !!req.auth && !hasRefreshError`로 refresh 에러 시 미인증 취급.

### Q: `/api/auth/refresh` 호출이 브라우저 네트워크 패널에 안 보이는 이유?
refresh는 **서버에서 서버로** 가는 요청이다. CSR에서 ky가 401 받으면 `fetch("/api/auth/session")`을 호출하는데, 이건 NextAuth API 라우트 → JWT callback → `refreshAccessToken()` → 서버에서 백엔드 `/api/auth/refresh` 호출. 브라우저 네트워크 패널에는 `/api/auth/session` 요청만 보이고, 실제 refresh 호출은 서버 터미널 로그에서만 확인 가능.

### Q: refresh_token이 없거나 만료된 케이스를 어떻게 테스트하나?
`/test/invalidate-refresh` 페이지에서 버튼 클릭 → `useSession`의 `update({ invalidateRefresh: true })` → JWT callback에서 `trigger === "update"` 감지 → `token.refreshToken = "invalid_token_for_testing"` 으로 교체. 이후 access_token 만료 시 refresh 시도 → 백엔드가 잘못된 토큰이라 거부 → `RefreshAccessTokenError` → 로그인 리다이렉트.

### Q: "token expired 10s ago" 로그는 뭔가?
access_token 유효기간이 6초인데 "10초 전에 만료"라고 나오는 이유: 토큰 만료 후 사용자가 아무 액션을 안 하면 jwt callback이 호출되지 않는다. 10초 뒤에 페이지 이동/세션 체크가 발생하면 그때야 만료를 감지 → "expired 10s ago". 만료 후 경과 시간이지, 토큰 수명이 아님.

---

## 테스트 케이스

### 1. SSR — refresh 실패 시 로그인 리다이렉트
- **구현 위치**: `src/proxy.ts:19-22`
- **조건**: `req.auth?.error === "RefreshAccessTokenError" && !isPublicPath`
- **동작**: `access_token` 쿠키 삭제 → `/login?callbackUrl=원래경로+쿼리스트링`으로 리다이렉트
- **테스트 방법**:
  1. 로그인
  2. `/test/invalidate-refresh`에서 Refresh Token 무효화
  3. access_token 만료 대기
  4. `/test/ssr?type=server&id=42&debug=true` 클릭 (또는 새로고침)
  5. proxy.ts에서 JWT callback 실행 → refresh 실패 → `/login?callbackUrl=/test/ssr?type=server&id=42&debug=true`로 리다이렉트
  6. 로그인 → 원래 SSR 페이지 + 쿼리스트링으로 복원

### 2. CSR — refresh 실패 시 로그인 리다이렉트
- **구현 위치**: `src/shared/api/client.ts` (ky `beforeRetry` 훅)
- **조건**: `refreshAccessToken()`이 null 반환 (세션에서 새 토큰을 받지 못함)
- **동작**: `window.location.href = /login?callbackUrl=현재pathname+search`
- **테스트 방법**:
  1. 로그인
  2. `/test/invalidate-refresh`에서 Refresh Token 무효화
  3. access_token 만료 대기
  4. `/test/client-click?action=fetch&retry=3&timeout=5000`에서 API 호출 버튼 클릭
  5. ky가 401 수신 → beforeRetry에서 `/api/auth/session` 호출 → JWT callback refresh 실패 → null 반환 → `/login?callbackUrl=/test/client-click?action=fetch&retry=3&timeout=5000`로 리다이렉트
  6. 로그인 → 원래 Client Click 페이지 + 쿼리스트링으로 복원

### 3. 정상 refresh (access_token 만료, refresh_token 유효)
- **테스트 방법**:
  1. 로그인
  2. access_token 만료 대기 (서버 터미널에서 `[AUTH] jwt: token valid, 0s remaining` 확인)
  3. **SSR**: 페이지 이동/새로고침 → 서버 터미널에 `[AUTH] jwt: token expired Xs ago, refreshing...` + `[AUTH] refresh: backend responded 200 success` → 페이지 정상 표시
  4. **CSR (Client Click)**: 버튼 클릭 → 네트워크 패널에 401 → `/api/auth/session` → 원래 요청 재시도 200 → 서버 터미널에 `[AUTH] refresh: backend responded 200 success`

### 4. callbackUrl 쿼리스트링 보존
- **테스트 방법**:
  1. 로그아웃 상태에서 `/home?foo=bar&page=3&search=hello+world&lang=ko` 직접 접속
  2. 로그인 페이지로 리다이렉트 (URL에 `callbackUrl` 확인)
  3. 로그인 → `/home?foo=bar&page=3&search=hello+world&lang=ko`로 복원

---

## 현재 한계

### CSR에서 refresh 실패 시 강제 리다이렉트
현재 ky의 `beforeRetry` 훅에서 refresh 실패 시 `window.location.href`로 로그인 페이지를 강제 이동한다. 사용자가 페이지에 머물면서 버튼을 클릭했을 때 갑자기 로그인 페이지로 이동하는 것은 UX 관점에서 어색할 수 있다.

**이상적인 동작**: 강제 리다이렉트 대신 "세션이 만료되었습니다. 다시 로그인하시겠습니까?" 같은 모달을 표시하고, 사용자가 확인 후 로그인 페이지로 이동.

**개선 방향**: ky `beforeRetry`에서 `window.dispatchEvent(new CustomEvent("auth:expired"))` 같은 커스텀 이벤트를 발생시키고, 상위 컴포넌트(AppProvider 등)에서 이벤트를 수신하여 모달 UI를 표시하는 방식으로 변경 가능.

### 크로스 런타임 Race Condition
refreshPromise/refreshCache는 같은 런타임 내에서만 동작. Edge/Node.js 간 race condition은 SessionProvider 폴링 비활성화로 완화하지만, 이론적으로는 여전히 가능 (매우 드묾). 완전한 해결은 백엔드에서 최근 revoke된 토큰에 grace period를 두는 것.
