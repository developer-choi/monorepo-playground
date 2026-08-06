# Zod 입력 검증 패턴

URL에서 오는 입력(searchParams, 경로 파라미터)을 Zod로 안전하게 파싱하는 세 가지 패턴.

## safeParsePartial — 쿼리스트링 필드별 개별 검증

`schema.parse()`는 하나라도 실패하면 전체를 throw한다. `schema.safeParse()`는 전체 성공/실패만 반환한다. URL searchParams는 사용자가 직접 조작할 수 있으므로, 일부 필드가 잘못되어도 유효한 나머지 값은 살려야 한다.

`safeParsePartial`은 스키마의 각 필드를 개별로 검증하여 성공한 필드만 결과에 포함한다.

값이 없을 때 어떻게 할지는 스키마 선언이 정한다. `.default()`가 붙어 있으면 기본값이 들어가고, 필수 필드면 검증에 실패해 빠지고, `.optional()`이면 키가 생기지 않는다. 검증 전에 `undefined`를 미리 걸러내면 이 선언이 무시되므로, 검증한 뒤 결과가 빈 값인 것만 제외한다.

```ts
// apps/examples/src/shared/utils/zod.ts
export function safeParsePartial<T extends z.ZodObject<z.ZodRawShape>>(
  schema: T,
  data: Record<string, unknown>,
): Partial<z.infer<T>> {
  const result: Record<string, unknown> = {};

  for (const key of Object.keys(schema.shape)) {
    const fieldSchema = schema.shape[key];

    if (!fieldSchema) {
      continue;
    }

    const fieldResult = z.safeParse(fieldSchema, data[key]);

    if (fieldResult.success && fieldResult.data !== undefined) {
      result[key] = fieldResult.data;
    }
  }

  return result as Partial<z.infer<T>>;
}
```

**서버 컴포넌트에서의 사용 (page.tsx)**

```ts
// apps/examples/src/app/validation/integration/page.tsx
const filters = safeParsePartial(boardListFilterSchema, query);
const pagination = safeParsePartial(paginationParamsSchema, query);
```

**클라이언트 컴포넌트에서의 사용**

```ts
// apps/examples/src/validation/integration/components/BoardFilter.tsx
const parsed = safeParsePartial(
  boardListFilterSchema,
  queryString.parse(searchParams.toString()),
);
```

---

## URL 경로 파라미터 변환 파이프라인 — `.regex` → `.transform` → `.pipe`

URL 경로 파라미터 `:id`는 항상 문자열이다. `Number("abc")`는 `NaN`을 반환하고, `Number("-1")`은 음수를 통과시킨다. 단순 캐스팅 대신 정규식 → 변환 → 추가 제약 조건을 파이프로 연결하여 각 단계가 명확한 책임을 갖는다.

```ts
// apps/examples/src/shared/schema/params.ts

// 재사용 가능한 양의 정수 스키마
export const numericIdSchema = z.number().int().positive('유효하지 않은 ID입니다');

/**
 * @throws {InvalidAccessError}
 */
export function parseNumericId(value: string): number {
  try {
    return z
      .string()
      .regex(/^\d+$/, '페이지 주소에 포함된 ID가 숫자 형식이 아닙니다') // 1단계: 숫자 문자만 허용 (음수·소수 차단)
      .transform(Number)                                                   // 2단계: string → number 변환
      .pipe(numericIdSchema)                                               // 3단계: 양의 정수 제약 (0 차단)
      .parse(value);
  } catch (error) {
    throw new InvalidAccessError({
      redirect: {type: 'NOT_FOUND'},
      meta: error,
    });
  }
}
```

**사용처**

```ts
// apps/examples/src/app/validation/integration/[id]/page.tsx
// apps/examples/src/app/validation/integration/[id]/edit/page.tsx
const board = await getBoardApi(parseNumericId(id));
```

파싱 실패 시 `InvalidAccessError`를 throw하고, 상위 ErrorBoundary가 404로 리다이렉트한다.

---

## z.coerce — URL 파라미터 강제 타입 변환

URL searchParams는 모두 문자열이다. `z.number()`는 `"1"`을 거부한다. `z.coerce.number()`는 내부적으로 `Number(value)`를 적용하므로 URL 파싱에 적합하다. `.default()`를 체이닝하면 키가 없는 경우의 기본값도 같은 선언에서 처리할 수 있다.

```ts
// apps/examples/src/shared/schema/pagination.ts
export const PAGINATION_LIMITS = {
  page: {min: 1},
  limit: {min: 1, max: 200},
  defaultPage: 1,
  defaultLimit: 10,
};

export const paginationParamsSchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(PAGINATION_LIMITS.page.min, `페이지 번호는 ${PAGINATION_LIMITS.page.min} 이상이어야 합니다`)
    .default(PAGINATION_LIMITS.defaultPage),  // 키 없을 때 기본값 1
  limit: z.coerce
    .number()
    .int()
    .min(PAGINATION_LIMITS.limit.min, `항목 수는 ${PAGINATION_LIMITS.limit.min} 이상이어야 합니다`)
    .transform((value) => Math.min(PAGINATION_LIMITS.limit.max, value)) // 상한 초과는 거부 대신 깎기
    .default(PAGINATION_LIMITS.defaultLimit), // 키 없을 때 기본값 10
});
```

상한을 `.max()`로 거부하면 `safeParsePartial`이 그 필드를 통째로 빼고, 서버는 limit이 안 온 것으로 보아 기본값을 쓴다. 그래서 `limit=250`이 `limit=150`보다 **적은** 개수를 받는 역전이 생긴다. 상한은 거부가 아니라 `transform`으로 깎아야 "많이 요청할수록 많이(상한까지) 받는다"가 지켜진다.

**사용처**

```ts
// apps/examples/src/app/validation/integration/page.tsx
const pagination = safeParsePartial(paginationParamsSchema, query);
// "1" → 1, "abc" → 필드 제외(safeParsePartial과 조합), 없음 → 기본값
```

`z.coerce`는 `safeParsePartial`과 조합할 때 특히 유용하다. 변환에 실패하면 해당 필드만 제외된다 — 기본값은 값이 아예 없을 때만 적용되고, 잘못된 값을 대신 메우지는 않는다.
