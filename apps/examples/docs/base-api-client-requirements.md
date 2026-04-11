# Base API Client 로드맵

> 현재 상태: ApiClient 추상 클래스 + FetchApiClient/KyApiClient 구현 완료

## 아키텍처

```
ApiClient (추상 — 인터페이스만 정의)
  ├── FetchApiClient (fetch 기반 구현체)
  └── KyApiClient (ky 기반 구현체)
```

### 기존 실패 경험

- ky + BaseError(Sentry 필드 펼치기) + ApiResponseError 조합
- 쓰임새마다 필드를 추가하는 방식이 문제 — **왜 실패했는지 분석 필요**

---

## 로드맵

1. [최소 API Client (채용과제)](./roadmap-1-minimal-api-notes.md)
2. [로그인](./roadmap-2-login-notes.md)
3. [Refresh Token](./roadmap-3-refresh-token-notes.md)
4. [기타 부가기능](./roadmap-4.md)
