# AI가 생성한 테스트 리뷰

AI 어시스턴트가 쓴 테스트는 얼핏 그럴듯해 보여도 **정상 경로만 덮고 어려운 케이스를 건너뛰는** 쏠림이 뚜렷하다. 통과하는 테스트 파일이 있다는 사실이 그 기능이 검증됐다는 뜻은 아니므로, 커밋 전에 엣지케이스가 실제로 있는지 본다.

출처: https://vitest.dev/guide/learn/writing-tests-with-ai.html — *Reviewing AI-Generated Tests*

> **Are there real edge cases?**
>
> AI tools tend to generate happy-path tests and skip the hard cases. After reviewing the generated tests, ask yourself: what happens with empty input? What about null or undefined? What if the network request fails? What if the list is empty?
>
> If these scenarios aren't covered, ask the AI to add them, or write them yourself.

## 진짜 엣지케이스가 있나

생성된 테스트를 훑은 뒤 묻는다 — 빈 입력이면? null·undefined면? 네트워크 요청이 실패하면? 리스트가 비어 있으면?

빠져 있으면 AI에게 추가를 요청하거나 직접 쓴다. 이때 지적하는 대상은 **테스트에 그 케이스가 없다**는 것이지, 구현에 방어 로직이 없다는 것이 아니다 — 둘은 다른 지적이고, 구현 쪽만 짚으면 테스트는 그대로 정상 경로 1건에 머문다.

정상·경계·에러 3케이스를 덮는 원칙은 [guides/testing/how-to-test.md](../../guides/testing/how-to-test.md), 케이스를 `describe('Edge cases')`로 묶는 배치는 [TestWriting.md](./TestWriting.md) 참조.

## 이 문서가 리뷰의 범위는 아니다

엣지케이스 누락을 따로 적어둔 이유는 이것이 AI-생성 테스트에서 가장 자주 비면서 자유 리뷰로는 잘 안 잡히는 지점이기 때문이다. 여기 적히지 않은 결함도 평소 리뷰대로 함께 잡는다 — 이 문서는 리뷰의 시작점이지 체크리스트의 전부가 아니다.
