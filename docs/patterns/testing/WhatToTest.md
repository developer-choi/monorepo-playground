# 테스트 대상·레벨 판단

## 판단 기준

테스트 하나를 쓰기 전에 묻는다: **"이 테스트가 깨졌을 때 실제 사용자에게 문제가 있다는 신호인가?"**

- Yes → 쓴다 (행동 계약, 회귀 방지)
- No → 쓰지 않는다 (change-detector 테스트)

**Yes가 디폴트.** No로 결론내려면 아래 면제 화이트리스트 카테고리 매칭 + 사유 명시 필수.

### 판정 4문항

skip 여부는 아래 4문항을 **순서대로** 적용해 가른다. vibe("안 깨질 것 같다")가 아니라 코드·스위트에서 나오는 구조적 사실로 판정한다.

1. **우리 버그인가, 프레임워크/타입이 보장하는가?** 프레임워크·타입이 보장하면 skip. (React ref-as-prop, `Pick`으로 좁힌 prop, 임의 attr 패스스루는 React/TS 몫.)
2. **우리 코드가 가공·차단·조건부 전달하는가, 그냥 흘려보내는가?** `{...rest}` 순수 패스스루면 skip, 가공/차단/조건부면 test.
3. **깨지면 조용히 넘어가나, 시끄럽게 드러나나?** 두 가지를 본다 — (a) 깨졌을 때 **에러·빈 화면처럼 눈에 띄게 드러나는가, 아니면 그럴듯해 보이는 틀린 결과로 조용히 넘어가는가**, (b) **모든 사용처에서 깨지는가, 특정 분기에서만 깨지는가**. **조용히 + 특정 분기에서만** 깨지면 test다 — 아무도 못 보고 배포까지 통과할 수 있으니까. 반대로 **눈에 띄게 + 모든 사용처에서** 깨지면 skip이다 — dev 서버·Chromatic·타입 검사·QA·프레임워크 에러 중 무엇이든 바로 잡으므로, **전용 테스트를 더 깔아도 발견력이 오르지 않는다**(이미 다른 그물이 다 잡으니 추가 발견력이 0). **얼마나 큰 사고인가(임팩트)가 아니라, 들킬 수 있는가로 판정한다.**
4. **이미 다른 유닛 테스트가 같은 경로로 검증하는가?** 그렇다면 전용 테스트를 또 만들지 않는다(필요하면 그 테스트의 대조군/부수 단언으로만 남긴다).

## 면제 화이트리스트

- E2E 영역의 페이지·라우트 (Next.js `page.tsx`·`layout.tsx`·`error.tsx`)
- integration 영역의 라우트 핸들러 (Next.js `app/**/route.ts`)
- trivial composition (옵션값만 합성하는 Provider 등)
- 단순 상수 전용 파일 (`constants.ts` 등; 일관성 검증이 비-trivial하면 작성)
- starter를 그대로 옮기는 chore 커밋

## 면제 사유로 인정 안 됨

- "복잡도 낮음" — 행동 계약은 복잡도와 무관

## 커버리지는 목표가 아니라 신호

코드 커버리지 숫자(라인·브랜치 %)를 채우는 것을 목표로 삼지 않는다. 커버리지를 채우려고 위 판정 4문항을 통과 못 하는 테스트를 억지로 깔면 change-detector만 늘어난다.

- 커버리지 리포트에서 테스트 없는 라인을 봤을 때 묻는 것은 "이 if/else·루프를 어떻게 덮지"가 아니라 **"이 라인이 어떤 use case를 지탱하고, 그 use case를 검증할 테스트가 있나"**다. 커버리지가 못 재는 "use case coverage"가 실제 목표다.
- 100% 커버리지가 값어치 있는 경우는 한정적이다 — 여러 소비처가 물려 breakage 파장이 큰 재사용 라이브러리·유틸 등. 앱 코드에 일률적으로 100%를 요구하지 않는다.

> 개념 배경(Testing Trophy·use case coverage): KA `knowledge/frontend/testing/trophy.md`.

## 구현 세부사항은 테스트하지 않는다

- X: internal state, lifecycle, 내부 메서드·헬퍼, 자식 컴포넌트 존재 여부
- O: user interactions, prop / context / subscription 변화

## 시각은 유닛이 아니라 Chromatic

유닛(jsdom)은 DOM 트리·동작만 본다 — 픽셀(색·간격·가시성)은 못 본다(layout/paint 엔진 없음). 시각 계약(variant/color/size 모양, 아이콘 보임, 라벨 가시성)은 **Storybook+Chromatic**이 검증한다 → 매트릭스 스토리: [PropMatrix.md](../storybook/PropMatrix.md).

그래서 CSS 모듈 클래스명 단언·스모크 렌더 등 시각·정적 그물에 맡길 것은 유닛으로 쓰지 않는다 — 코드 예시·근거는 [TestsWeAvoid.md](./TestsWeAvoid.md).

## 레벨 선택

**Integration 우선**. 네트워크(MSW)와 애니메이션만 mock, 나머지(Router, Theme, Auth, 하위 컴포넌트)는 실제로 쓴다.

- 전역 Provider 없이 단독 렌더 가능한 순수 함수·컴포넌트만 Unit
- 그 외는 Integration 기본
