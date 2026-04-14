# 무엇을 왜 테스트해야 하는가

## 핵심 질문

> 이 테스트가 깨졌을 때, 실제 사용자에게 문제가 있다는 신호인가?

- Yes -> 가치 있는 테스트 (행동 계약, 회귀 방지, 모니터링 의존 필드)
- No -> 리팩토링을 방해하는 change-detector 테스트 (내부 헬퍼 분기, 생성자 필드, instanceof)

## 소스

### Kent C. Dodds - "Avoid the Test User"

- https://kentcdodds.com/blog/avoid-the-test-user

> "By making your test use the component differently than end-users and developers do, we create a third user our application code needs to consider: the tests!"

> "Writing tests that include implementation details is all downside and no upside."

### Kent C. Dodds - "Testing Implementation Details"

- https://kentcdodds.com/blog/testing-implementation-details

구현 디테일 테스트의 두 가지 문제:

- **False Negatives:** 기능은 정상인데 리팩토링하면 테스트가 깨짐
- **False Positives:** 버그가 있는데 테스트는 통과함

> "The more your tests resemble the way your software is used, the more confidence they can give you."

> Implementation details are "things which users of your code will not typically use, see, or even know about."

### Kent C. Dodds - "Write tests. Not too many. Mostly integration."

- https://kentcdodds.com/blog/write-tests

> "You get diminishing returns on your tests as the coverage increases much beyond 70%."

> "You should very rarely have to change tests when you refactor code."

> "As you move up the pyramid, the confidence quotient of each form of testing increases."

### Kent C. Dodds - "How to Know What to Test"

- https://kentcdodds.com/blog/how-to-know-what-to-test

> "Think less about the code you are testing and more about the use cases that code supports."

> "What part of this app would make me most upset if it were broken?"

### Google Testing Blog - "Change-Detector Tests Considered Harmful"

- https://testing.googleblog.com/2015/01/testing-on-toilet-change-detector-tests.html

> "Change detectors provide negative value, since the tests do not catch any defects, and the added maintenance cost slows down development."

> "A correct or incorrect program is equally likely to pass."

### Google Testing Blog - "Test Behavior, Not Implementation"

- https://testing.googleblog.com/2013/08/testing-on-toilet-test-behavior-not.html

> "Tests should focus on testing your code's public API, and your code's implementation details shouldn't need to be exposed to tests."

> "There are many cases where you do want to test implementation details (e.g. you want to ensure that your implementation reads from a cache instead of from a datastore), but this should be less common."

### Justin Searls (via Martin Fowler)

- https://martinfowler.com/articles/2021-test-shapes.html

> "People love debating what percentage of which type of tests to write, but it's a distraction. Nearly zero teams write expressive tests that establish clear boundaries, run quickly & reliably, and only fail for useful reasons. Focus on that instead."
