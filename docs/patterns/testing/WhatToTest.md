# 무엇을 왜 테스트할 것인가

## 판단 기준

테스트 하나를 쓰기 전에 묻는다: **"이 테스트가 깨졌을 때 실제 사용자에게 문제가 있다는 신호인가?"**

- Yes → 쓴다 (행동 계약, 회귀 방지)
- No → 쓰지 않는다 (change-detector 테스트)

## 구현 세부사항은 테스트하지 않는다

사용자(end-user, developer)가 보지도·쓰지도·알지도 못하는 내부 구현은 대상이 아니다.

- X: internal state, lifecycle, 내부 메서드·헬퍼, 자식 컴포넌트 존재 여부
- O: user interactions, prop / context / subscription 변화

### ApiClient 계약 테스트

제거: `buildBody` / `buildHeaders` 분기, `ApiResponseError` 생성자 필드, `instanceof` 체인.

유지:

- `get` / `post` / `put` / `delete` 호출 시 올바른 메서드·URL·쿼리·바디로 요청이 나간다
- 4xx/5xx → `ApiResponseError`, 네트워크 실패 → `ApiRequestError` 정규화
- 정상 응답은 `data`만 반환

FetchApiClient·KyApiClient 공통 스위트는 `describe.each`로 묶는다.

## 레벨 선택

**Integration 우선**. 네트워크(MSW)와 애니메이션만 mock, 나머지(Router, Theme, Auth, 하위 컴포넌트)는 실제로 쓴다.

- 전역 Provider 없이 단독 렌더 가능한 순수 함수·컴포넌트만 Unit
- 그 외는 Integration 기본
