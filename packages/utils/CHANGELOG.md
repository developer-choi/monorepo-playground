# 변경 기록

버전마다 쓰는 쪽이 알아야 할 변경을 적습니다. 올리는 규칙은 [README 「버전」](README.md#버전)에 있습니다.

## 0.1.0

첫 배포입니다.

### Added

- `@developer-choi/utils/api`: `ApiClient`(추상 클래스), `FetchApiClient`, `BaseError`, `ApiRequestError`, `ApiResponseError`, `HTTP_STATUS`, `joinUrl`
- `FetchApiClient` 생성자 2번째 인자 `resolveRequestContext`: 요청마다 불러 받은 `prefixUrl`·`headers`로 생성자 값을 덮습니다. 서버 렌더링 중 받은 요청의 쿠키·host를 실어 보낼 때 씁니다. 같은 헤더 키는 호출부 값이 이깁니다.
