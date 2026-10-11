에러를 처리하는 모양을 정하는 규칙입니다. 따로 적지 않은 규칙은 `eslint.config.base.mts`의 `baseRules`에 있습니다.

`no-restricted-syntax` 항목은 [eslint.md](../eslint.md#no-restricted-syntax-항목)의 공통 처리(위반 시 `eslint-disable` + 사유 주석)를 따릅니다.

## `no-restricted-syntax` — 에러를 삼키는 catch 금지

셀렉터: `CallExpression[callee.property.name='catch'] > ArrowFunctionExpression:matches([body.type='Literal'][body.value=null], [body.type='Identifier'][body.name='undefined'])` + `CatchClause[body.body.length=0]` — 전역

`.catch(() => null)`·`.catch(() => undefined)`와 빈 `catch {}`를 금지합니다. 성격이 다른 실패(리소스 없음 404 / 서버 장애 500 / 네트워크 오류)가 한 결과값으로 합쳐지면 호출부가 이를 구분할 방법이 사라져, **장애가 "없음"으로 위장**됩니다. 실제 사고 사례: 상세 페이지에서 `const data = await fetchReservation(id).catch(() => null); if (!data) notFound();`로 작성해 서버가 죽어도 사용자에게 "없는 페이지"를 보여줬습니다. 올바른 형태는 실패 종류를 구분하는 것입니다 — 404만 `null`로 접고 나머지는 그대로 전파.

```ts
// ❌ 모든 실패가 null 하나로 합쳐짐 — 500도 "없는 페이지"가 된다
const data = await fetchReservation(id).catch(() => null);
if (!data) notFound();

// ✅ 실패 종류를 구분한다
try {
  return await fetchReservation(id);
} catch (error) {
  if (error instanceof ApiResponseError && error.status === HTTP_NOT_FOUND) {
    notFound();
  }
  throw error;
}
```

**"catch에서 로그만 찍고 안 던지는" 형태는 룰에 넣지 않았습니다.** 판정 기준이 성립하지 않기 때문입니다 — 에러를 화면 상태로 옮기는 정당한 처리(`setErrorMessage(...)`, `handleClientSideError(error)`)와 삼키는 처리가 AST에서 동일한 모양(`catch` 안에서 함수 하나 호출)이고, 호출되는 함수가 에러를 제대로 다루는지는 이름만으로 알 수 없습니다. `console.*` 한 줄뿐인 형태로 좁히면 잡을 수는 있으나 아무 줄이나 하나 더하면 빠져나가므로 게이트 구실을 못 합니다. 이 축은 린트가 아니라 코드리뷰가 봅니다.

정당하게 삼켜야 하는 경우는 `eslint-disable` + 사유 주석으로 통과시킵니다. 현재 레포에 2건 있으며(`FetchApiClient.ts`·`KyApiClient.ts`의 `toResponseError`), 둘 다 **이미 `throw` 하는 중에** 에러 응답 본문을 부가정보로 파싱하는 자리라 실패를 삼키지 않습니다 — 본문이 JSON이 아니면 `errorData`만 `null`이 되고 `ApiResponseError`는 그대로 던져집니다. 이 "throw 경로에서만 정당" 조건은 데이터 흐름 추적이 필요해 selector로 구분할 수 없어(`.json()` 호출만 예외 처리하는 방식은 ky의 `api.get(url).json()`처럼 정상 흐름에도 `.json()`이 붙어 구멍이 납니다) disable + 사유로 개별 승인합니다.
