# 인수인계: 테스트 철학 정립

## 배경

ApiClient 테스트코드 작성 중 "무엇을 왜 테스트해야 하는가" 논의가 발생.
로드맵(roadmap-1)에 구현 디테일 테스트가 과다 명세되어 있었고, 정리 과정에서 판단 기준이 필요해짐.

## 이번 세션에서 한 것

1. **로드맵 테스트케이스 축소** — 구현 디테일(buildBody/buildHeaders 분기, Error 생성자, instanceof 체인) 제거, 행동 계약만 남김
2. **ApiClient 계약 테스트 통합** — `describe.each`로 FetchApiClient + KyApiClient 공유 테스트 스위트 작성
3. **FetchApiClient.test.ts 정리** — 계약 테스트와 겹치는 것 제거, 구현 고유 테스트(body serialization, Content-Type)만 잔류
4. **리서치** — "무엇을 왜 테스트해야 하는가" 소스 6개 수집 → `docs/patterns/testing/WhatToTest.md` 초안 작성

## 남은 할 일

### 1순위: KA에서 소스 학습

`docs/patterns/testing/WhatToTest.md`에 정리된 소스를 KA에서 공부:

- Google Testing Blog: Change-Detector Tests, Test Behavior Not Implementation
- Justin Searls (via Martin Fowler): On the Diverse And Fantastical Shapes of Testing

**원문 인용 검증 필요** — 리서처 에이전트가 가져온 인용이 실제 원문과 일치하는지 1차 소스 확인 아직 안 됨 (위 3개 URL 대상).

### 2순위: 규칙 도출 → patterns/ 문서 확정

학습 결과를 기반으로 `docs/patterns/testing/WhatToTest.md`를 실제 규칙 문서로 확정.

### 3순위: best-practices-map.md 등록

확정된 WhatToTest.md를 best-practices-map.md 테스팅 섹션에 등록.

## 핵심 판단 기준 (잠정)

> 이 테스트가 깨졌을 때, 실제 사용자에게 문제가 있다는 신호인가?

이 기준이 1순위. "무엇을 테스트할 것인가"가 결정되어야 "어떻게 작성할 것인가"(TestWriting.md)나 컨벤션이 의미가 있음.

## 관련 커밋

- `2f4fd9be` docs(examples): 로드맵 테스트케이스를 계약 수준으로 축소
- `5eabe096` test(examples): ApiClient 계약 테스트를 describe.each로 통합
