## 문제

린트 규칙을 바꾸면 그 규칙 때문에 존재하던 코드·주석·문서가 남습니다. 규칙을 **켜는** 변경은 위반이 에러로 떠서 저절로 드러나지만, **끄거나 완화하는** 변경은 아무것도 실패시키지 않아 잔재가 조용히 남습니다.

실제로 두 번 겪었습니다.

**`void` 잔재 — 3개월 반** (`c95b7dc4` 2026-03-31 → `933a2cc7` 2026-07-20)
`no-floating-promises`를 끄면서 목적이 "코드에서 `void` 키워드를 없애는 것"이었는데, 정작 그 규칙을 피하려고 박아둔 `void` 5곳은 그대로 남았습니다. 규칙을 껐으니 린트는 아무 말도 하지 않았고, 넉 달 뒤 사람이 눈으로 찾아 걷어냈습니다.

**문서 잔재 — 같은 날 발견** (`40f2cbe7` → `28f57ac` 2026-08-07)
`naming-convention`에 함수 타입 예외를 열자 억제 주석 2곳이 불필요해졌습니다. 이쪽은 ESLint가 "쓸모없는 억제"로 즉시 잡아줬지만, 같은 내용을 서술한 문서 두 곳(`eslint.md`, `TestWriting.md`)은 아무도 안 잡아서 손으로 뒤져 찾았습니다.

## 방향에 따라 잔재가 다르다

| 변경 방향 | 남는 것 | 누가 잡나 |
| --- | --- | --- |
| 규칙을 **연다**(예외 추가·완화) | 불필요해진 `eslint-disable` 주석 | ESLint가 자동으로 잡음 |
| 규칙을 **끈다** | 그 규칙을 피하려고 쓴 문법·우회 코드 | **아무도 안 잡음** |
| 어느 방향이든 | 문서 서술, 채용과제 템플릿 사본 | `meta/coupling.json` 묶음이 편집 시 알림 |

불필요해진 억제 주석이 자동으로 잡히는 근거는 ESLint 기본값입니다. 우리는 `--max-warnings 0`으로 돌리므로 경고 하나로 CI가 멈춥니다.

출처: https://eslint.org/docs/latest/use/configure/rules

> "To report unused `eslint-disable` comments (those that disable rules which would not report on the disabled line), use the `reportUnusedDisableDirectives` setting."
>
> Default value: The setting defaults to `"warn"`.

## 절차

### 규칙을 끄기 전에 — 회피 문법을 찾아 금지 규칙으로 바꿔 단다

끄려는 규칙 때문에 코드에 박힌 문법이 있는지 먼저 찾습니다. 있으면 **끄는 것으로 끝내지 말고, 그 문법을 금지하는 규칙을 같이 답니다.** 그래야 잔재가 그 자리에서 에러로 뜹니다.

`no-floating-promises`를 끌 때 `no-void`를 같이 켰다면 `void` 5곳이 그날 전부 드러났을 겁니다. 규칙을 끄는 게 아니라 **바꿔 다는** 일로 취급합니다.

### 바꾼 뒤 — 워크스페이스 lint를 직접 돌린다

루트 `npm run lint`(turbo)는 `eslint.config.base.mts`를 캐시 입력으로 잡지 않아, 설정을 고쳐도 캐시 적중이 떠서 차이가 안 보일 수 있습니다.

```
npm run lint -w examples
npm run lint -w @monorepo-playground/design-system
```

### 파일 통째 억제는 손으로 떼서 센다

ESLint는 "아무것도 안 막은 억제"만 알려줍니다. 파일 맨 위 `/* eslint-disable */`는 그 파일에 위반이 하나라도 남아 있으면 "쓸모없다"고 하지 않으므로, **범위가 지금도 그만큼 넓어야 하는지는 검사되지 않습니다.** 지운 뒤 남는 위반 건수를 직접 세어 확인합니다.

### 막아야 할 것·열려야 할 것을 프로브로 실측한다

바뀐 규칙이 무엇을 막고 무엇을 여는지 말로 추론하지 않고, 두 부류를 한 파일에 적어 실제로 돌립니다. 임시 파일이므로 확인 뒤 지웁니다.

```ts
/* 임시 프로브 — 측정 후 삭제 */
const Value = 1; // 막히길 기대
const DoSomethingWeird = (num: number) => num + 1; // 통과하길 기대
```

말로 맞다고 본 것이 실제로는 다른 경우가 있습니다 — 함수 타입 예외를 넣고도 `ElementType`(컴포넌트와 태그 문자열의 합집합)은 계속 막힌다는 것을 프로브로야 알았습니다.

### 짝꿍을 훑는다

`meta/coupling.json`에 린트 설정의 짝(문서·템플릿 사본)이 등록돼 있습니다. 편집 시 알림이 뜨지만, 알림은 세션당 한 번이라 긴 세션에서는 놓칠 수 있습니다. 규칙을 바꿨으면 알림 여부와 무관하게 묶음을 직접 확인합니다.

## 같은 이야기가 적용되는 곳

Stylelint·tsconfig도 방향이 같습니다. `tsconfig`의 안전망 옵션을 끄면 그 옵션 때문에 달아둔 `@ts-expect-error`가 잔재로 남고, 그것 역시 끄는 쪽에서는 아무도 잡아주지 않습니다.

새 규칙을 기존 코드에 들이는 반대 방향은 [gradual-migration.md](./gradual-migration.md)를 봅니다.
