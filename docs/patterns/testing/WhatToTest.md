# 테스트 대상·레벨 판단

## 판단 기준

테스트 하나를 쓰기 전에 묻는다: **"이 테스트가 깨졌을 때 실제 사용자에게 문제가 있다는 신호인가?"**

- Yes → 쓴다 (행동 계약, 회귀 방지)
- No → 쓰지 않는다 (change-detector 테스트)

**Yes가 디폴트.** No로 결론내려면 아래 면제 화이트리스트 카테고리 매칭 + 사유 명시 필수.

## 면제 화이트리스트

- E2E 영역의 페이지·라우트 (Next.js `page.tsx`·`layout.tsx`·`error.tsx`)
- integration 영역의 라우트 핸들러 (Next.js `app/**/route.ts`)
- trivial composition (옵션값만 합성하는 Provider 등)
- 단순 상수 전용 파일 (`constants.ts` 등; 일관성 검증이 비-trivial하면 작성)
- starter를 그대로 옮기는 chore 커밋

## 면제 사유로 인정 안 됨

- "복잡도 낮음" — 행동 계약은 복잡도와 무관

## 구현 세부사항은 테스트하지 않는다

- X: internal state, lifecycle, 내부 메서드·헬퍼, 자식 컴포넌트 존재 여부
- O: user interactions, prop / context / subscription 변화

## 레벨 선택

**Integration 우선**. 네트워크(MSW)와 애니메이션만 mock, 나머지(Router, Theme, Auth, 하위 컴포넌트)는 실제로 쓴다.

- 전역 Provider 없이 단독 렌더 가능한 순수 함수·컴포넌트만 Unit
- 그 외는 Integration 기본
