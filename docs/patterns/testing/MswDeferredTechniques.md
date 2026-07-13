# MSW 심화 기법 — 필요할 때 학습

여기 있는 기법들은 아직 MP에서 자주 쓰지 않아 **학습을 미뤄둔 것**이다. 본문 정리 없이 트리거(언제 필요한가)와 공식 URL만 둔다. 실제로 그 상황에 부딪히면 그때 링크를 열어 학습하고, 자리 잡으면 정식 가이드로 승격한다.

> **AI 행동 규칙**: 사용자가 아래 트리거 상황(기본 method+path 매칭으로 안 되는 요청 가로채기, 코드 수정 없는 목 응답 전환 등)에 부딪히면, AI가 먼저 알아채고 "이건 이 기법이 맞을 수 있다 — 이 URL로 공부해보자"고 사용자에게 제안한다. 사용자가 이 목록을 매번 기억하지 않아도 되게 한다.

## Custom request predicate

같은 method+path인데 쿼리파라미터(`?foo=`)나 JSON 요청 바디의 특정 속성(`bar`) 값에 따라 요청을 가려 가로채야 할 때. MSW 기본 매칭(method+path)으로는 안 되므로 higher-order resolver로 조건을 직접 짠다(higher-order resolver 개념은 [MswHandlerStructuring.md](./MswHandlerStructuring.md) 참고).

https://mswjs.io/docs/best-practices/custom-request-predicate

## Dynamic mock scenarios

개발·시연 중 소스를 안 고치고 URL 쿼리(`?scenario=error`)로 목 응답을 성공↔에러(500 등)로 런타임 전환하고 싶을 때. 시나리오별 핸들러 세트를 만들어 쿼리로 골라 적용한다.

https://mswjs.io/docs/best-practices/dynamic-mock-scenarios
