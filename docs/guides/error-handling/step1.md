# Step 1. 에러 처리는 왜 필요한가?

## 목차
1. **에러 처리는 왜 필요한가?** ← 현재 문서
2. [에러 피드백 UX 설계](./step2.md)
3. [에러 처리 원칙 세우기](./step3.md)
4. [Client Side 렌더링 에러 처리](./step4.md)
5. [Server Side 렌더링 에러 처리](./step5.md)
6. [이벤트 핸들러 시점 에러 처리](./step6.md)
7. [전역/공통/개별 에러 처리](./step7.md)

---

에러 처리가 필요한 이유는, 에러가 발생했기 때문입니다.

> 그래서 더 중요한 건, 애초에 에러가 발생하지 않도록 **예방**하는 것입니다.

## 에러는 어떻게 **예방**할 수 있을까요?
1. 기획 및 디자인 리뷰 + 기능 구현을 애초에 잘했다면...
2. [테스트 코드를 잘 작성했다면...](https://github.com/developer-choi/monorepo-playground/blob/master/docs/guides/testing/why-to-test.md)
3. [코드 리뷰가 잘 됐다면...](https://github.com/developer-choi/developer-choi/blob/main/docs/communication/pr-commit-guide.md)

즉, 이 문서는 `버그 없는 프로그램 만들기`를 위한 마지막 절차입니다.

## 에러 처리의 목표
예방하는 걸 1순위로 하되,

그럼에도 발생했다면 `사용자에게 잘 안내하고 / 빨리 대응`해야 합니다.

이 두 가지 목표를 달성하기 위한 구체적인 단계들을 이후 Step부터 다룹니다.

---

## 다음 단계

`사용자에게 잘 안내하기` 위해서는 에러 페이지와 에러 모달에 어떤 내용이 들어가야 할까요?

[Step 2. 에러 피드백 UX 설계](./step2.md)