# 테스트 대상·레벨 판단

## 판단 기준

테스트 하나를 쓰기 전에 묻는다: **"이 테스트가 깨졌을 때 실제 사용자에게 문제가 있다는 신호인가?"**

- Yes → 쓴다 (행동 계약, 회귀 방지)
- No → 쓰지 않는다 (change-detector 테스트)

## 구현 세부사항은 테스트하지 않는다

- X: internal state, lifecycle, 내부 메서드·헬퍼, 자식 컴포넌트 존재 여부
- O: user interactions, prop / context / subscription 변화

## 레벨 선택

**Integration 우선**. 네트워크(MSW)와 애니메이션만 mock, 나머지(Router, Theme, Auth, 하위 컴포넌트)는 실제로 쓴다.

- 전역 Provider 없이 단독 렌더 가능한 순수 함수·컴포넌트만 Unit
- 그 외는 Integration 기본
