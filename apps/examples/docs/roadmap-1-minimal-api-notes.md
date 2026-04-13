# 로드맵 1: 최소 API Client (채용과제)

## 요구사항

인터페이스 확정이 최우선 과제. fetch/ky를 추상화한 abstract class를 만든다.

- HTTP METHOD별 메소드 (get, post, put, patch, delete)
- 기본 응답은 JSON 가정
- 비-JSON 응답(blob, text 등) 지원 → roadmap 4에서 responseType 옵션으로 대응 예정
- 에러 시 래핑하여 throw (모니터링용 필드 포함)
- fetch/ky 네이티브 옵션을 전부 노출 — 내부에서 관리하는 것(method, headers, body)만 Omit하고 나머지는 pass-through

## 테스트케이스

### FetchApiClient

- 편의 메소드(get/post/put/patch/delete)가 요청을 보내고 JSON을 반환한다
- HTTP 에러 → `ApiResponseError`로 래핑 (method, status, url, body, headers, errorData 포함)
- 네트워크 에러 → `ApiRequestError`로 래핑 (fetch의 TypeError가 노출되면 안 됨)
- 서버 응답 body가 유효하지 않은 JSON → `errorData: null`
- 2xx 응답이지만 body가 비-JSON → 현재 미래핑 (roadmap 4 responseType 도입 시 처리)

### KyApiClient

- FetchApiClient와 동일 계약 (동일 시나리오에서 동일 에러 타입·필드)
- ky의 `HTTPError`가 직접 노출되지 않음
