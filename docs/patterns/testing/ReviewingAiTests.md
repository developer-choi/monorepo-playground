# AI가 생성한 테스트 리뷰

AI 어시스턴트가 쓴 테스트는 얼핏 그럴듯해 보여도 함정을 자주 갖는다 — 실속 없는 검증(에러만 안 나면 통과), 구현 결합, 미실행, 엣지케이스 누락. 커밋 전에 아래 4축을 점검한다.

출처: https://vitest.dev/guide/learn/writing-tests-with-ai.html — *Reviewing AI-Generated Tests*.

## 1. 의미 있는 검증인가

함수를 호출만 하고 "에러 안 남"만 보거나 mock 자체를 검증하는 테스트는 거짓 자신감을 준다. `toBeDefined()`는 거의 뭐든 통과한다 — 실제 속성을 단언해야 한다.

```js
// ❌ 무의미 — 거의 뭐든 통과
test('creates a user', () => {
  const user = createUser('Alice', 'alice@example.com');
  expect(user).toBeDefined();
});

// ✅ 실제 속성을 검증
test('creates a user with the correct fields', () => {
  const user = createUser('Alice', 'alice@example.com');
  expect(user).toMatchObject({name: 'Alice', email: 'alice@example.com'});
  expect(user.id).toBeTypeOf('string');
});
```

## 2. 동작을 테스트하나, 구현을 테스트하나

AI는 과하게 mock하는 경향이 있다. 모든 의존성을 mock하고 내부 메서드가 특정 순서로 호출됐는지 단언하면 구현 세부에 결합된 테스트다 — 리팩터할 때마다 깨진다.

**리트머스**: "내부를 바꿔도 함수가 올바른 결과를 반환하는데 이 테스트가 깨진다면" 구현 과결합이다.

```js
// ❌ 내부 호출 순서만 검증 → 리팩터마다 깨짐
test('calls db and hash', () => {
  createUser('Alice', 'alice@example.com');
  expect(hash).toHaveBeenCalled();
  expect(save).toHaveBeenCalledAfter(hash);
});
```

구현 세부(internal state·lifecycle·내부 메서드 호출 순서)를 테스트하지 않는 판단은 [WhatToTest.md](./WhatToTest.md), 과결합 안티패턴은 [TestsWeAvoid.md](./TestsWeAvoid.md) 참조.

## 3. 실제로 실행되나

AI-생성 테스트는 import 에러, 없는 함수 참조, API 오용을 품을 수 있다 — 채팅창에선 맞아 보여도 실행하면 즉시 실패한다. 커밋 전에 반드시 실행한다.

```
vitest run src/userService.test.js
```

## 4. 진짜 엣지케이스가 있나

AI는 happy-path만 만들고 어려운 케이스를 건너뛰는 경향이 있다. 리뷰 후 묻는다: 빈 입력이면? null·undefined면? 네트워크 요청이 실패하면? 리스트가 비어 있으면? 누락됐으면 AI에게 추가를 요청하거나 직접 쓴다.

정상·경계·에러 3케이스를 덮는 원칙은 [guides/testing/how-to-test.md](../../guides/testing/how-to-test.md) 참조.

---

## 벤치 fixture와 채점 기준 (before/after 수동 벤치용)

이 지침이 `/code-review`에 실제로 영향을 주는지 확인하기 위한 고정 입력이다. 아래 fixture를 스크래치 PR에 올려 **지침 배선 전/후**로 `/code-review`를 돌리고, 4축 지적이 새로 뜨는지 비교한다. fixture가 고정이라 재현 가능하다.

```js
// userService.test.js — 4개 함정을 일부러 모두 심은 AI-생성풍 fixture
import {test, expect, vi} from 'vitest';
import {createUser} from './userService';

vi.mock('./db');
vi.mock('./hash');

test('creates a user', () => {
  const user = createUser('Alice', 'alice@example.com');
  expect(user).toBeDefined(); // 함정1: 거의 뭐든 통과 → 무의미 검증
});

test('calls db and hash', () => {
  createUser('Alice', 'alice@example.com');
  expect(hashModule.hash).toHaveBeenCalled(); // 함정2: 내부 호출만 검증 → 구현 결합
  expect(dbModule.save).toHaveBeenCalledAfter(hashModule.hash);
});
// 함정3: hashModule·dbModule을 import하지 않아 실행 시 ReferenceError → 미실행
// 함정4: 빈 이름·잘못된 이메일·중복 이메일·저장 실패 등 엣지케이스 0개
```

**채점 기준** — 지침이 작동하면 리뷰가 4축을 모두 지적해야 한다:

1. 무의미한 검증: `expect(user).toBeDefined()`는 거짓 자신감 → `toMatchObject`/`toBeTypeOf` 등 실제 속성 검증 요구.
2. 구현 결합: 내부 호출 순서(`toHaveBeenCalledAfter`)만 검증 → 리팩터마다 깨진다는 점 지적.
3. 미실행: `hashModule`·`dbModule` 미import로 `ReferenceError` → `vitest run`으로 실행 확인 요구.
4. 엣지케이스 누락: 정상경로만 있고 빈 입력·null·저장 실패 없음 → 누락 지적.
