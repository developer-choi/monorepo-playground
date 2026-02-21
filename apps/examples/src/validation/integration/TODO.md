# Golden Standard Upgrade TODO

dada 프로젝트 적용 과정에서 발견된, 골든 스탠다드에 추가를 검토할 패턴들.

---

## 1. `.pipe()` — Form Input Coercion 패턴

### 배경: `.pipe()`란?

Zod v4의 `.pipe()`는 **한 스키마의 출력을 다른 스키마의 입력으로 연결**하는 메서드다.
`.transform()`이 값을 변환하면, `.pipe()`가 그 변환된 값을 다음 스키마로 넘겨서 **다시 검증**한다.

```typescript
// .transform()만 쓰면: 변환은 되지만, 변환 결과를 Zod가 다시 검증하지 않음
z.string().transform(Number)  // output 타입은 number지만, NaN이어도 통과

// .pipe()를 쓰면: 변환 후 결과를 다시 Zod 스키마로 검증
z.string().transform(Number).pipe(z.number().int().positive())  // NaN이면 실패
```

핵심은 `.transform()`은 **값을 변환하지만 결과를 검증하지 않고**, `.pipe()`는 **변환된 값을 다시 스키마로 검증**한다는 차이다.

### 문제: `.refine()`으로 number 필드를 다루면 생기는 일

HTML `<input>`은 항상 `string`을 반환한다. 그래서 `capacity` 같은 숫자 필드를 form에서 다룰 때 문제가 생긴다.

dada의 ClassForm에서 현재 `.refine()`으로 처리하는 방식:

```typescript
// 1. schema: string으로 받고, .refine()으로 "숫자처럼 생겼는지" 검증만 함
capacity: z.string()
  .refine(
    (v) => !v || (Number.isInteger(+v) && +v > 0),
    "정원은 1 이상의 정수를 입력해주세요",
  )
  .optional(),

// 2. z.infer 결과 타입: string | undefined (number가 아님!)
type ClassFormValues = { capacity?: string; ... };

// 3. submit handler에서 수동으로 string → number 변환 필요
const onSubmit = (data: ClassFormValues) => {
  api.create({
    ...data,
    capacity: data.capacity ? Number(data.capacity) : undefined,
  });
};
```

**구체적 문제점:**

1. **타입 불일치** — 스키마에서 검증을 통과해도 `z.infer` 타입은 `string`이다. API가 `number`를 기대하므로 submit handler에서 `Number()` 변환이 반드시 필요한데, 이건 스키마가 보장하는 게 아니라 개발자가 기억해야 하는 암묵적 계약이다.
2. **검증 로직의 중복** — `.refine()` 안에 `Number.isInteger(+v) && +v > 0` 같은 수동 검증을 작성해야 한다. Zod에 이미 `.int()`, `.positive()` 같은 내장 검증이 있는데 string이라서 못 쓴다.
3. **변환 누락 위험** — submit handler에서 변환을 빼먹으면 API에 `"5"` (string)를 보내게 된다. TypeScript가 잡아주긴 하지만, 스키마 레벨에서 보장하는 것보다 취약하다.

### 제안: `.transform()` + `.pipe()`

```typescript
// 1. schema: string → number 변환 + number로 검증
capacity: z.string()
  .transform((v) => (v === "" ? undefined : Number(v)))
  .pipe(z.number().int().positive("정원은 1 이상의 정수를 입력해주세요").optional()),

// 2. z.infer 결과 타입: number | undefined (정확한 타입)
type ClassFormValues = { capacity?: number; ... };

// 3. submit handler: 변환 불필요
const onSubmit = (data: ClassFormValues) => {
  api.create(data);  // capacity는 이미 number
};
```

### 장단점

**장점:**
- `z.infer` 타입이 실제 API 기대 타입(`number`)과 일치 — submit handler에서 변환 불필요
- Zod 내장 검증(`.int()`, `.positive()`)을 그대로 활용 — 수동 검증 로직 제거
- 스키마 하나에서 입력(string) → 출력(number)을 완결 — 변환 누락 가능성 제거

**단점:**
- `.pipe()`가 익숙하지 않으면 가독성이 떨어질 수 있음 (Zod v3.22에서 도입, v4에도 있지만 사용 사례가 아직 적음)
- react-hook-form의 `defaultValues` 타입과 `onSubmit` 타입이 달라짐 — input 타입은 `string`인데 output 타입은 `number`. `zodResolver`가 이걸 처리하지만, `useWatch`나 `setValue`에서 타입 혼동이 생길 수 있음
- 디버깅 시 에러가 `.pipe()` 단계에서 나기 때문에 (`.transform(Number)`는 NaN을 반환해도 에러 없이 통과, 다음 `.pipe(z.number())`에서 실패), `.refine()`처럼 한 곳에서 검증+실패가 일어나는 것보다 추적이 덜 직관적

### 판단

number 필드가 1~2개인 단순 form이면 `.refine()` + submit handler 변환으로 충분.
number 필드가 여러 개이거나, form ↔ API 타입 일치가 중요한 경우 `.pipe()` 도입 가치 있음.

---

## 2. Contact Field Schemas 공유화

### 문제: `z.union([z.literal(""), z.format()])` 패턴의 반복

HTML form의 optional 필드는 비어 있을 때 `undefined`가 아니라 **빈 문자열 `""`**을 반환한다.
그래서 "비어 있으면 OK, 값이 있으면 format 검증" 패턴이 필요하고, 이게 프로젝트 전체에서 반복된다.

dada에서의 실제 사용 현황:

| 위치 | 스키마 | 사용 횟수 |
|------|--------|-----------|
| `student/schema.ts` | `optionalEmailSchema` | 2곳 (student profile, guardian) |
| `student/schema.ts` | `optionalPhoneSchema` | 2곳 (student profile, guardian) |
| `organization/schema.ts` | `websiteSchema` | 1곳 (organization) |

총 5회 사용, 3개 스키마가 동일 패턴 `z.union([z.literal(""), z.format()])`.

**현재 문제:**
- `optionalEmailSchema`와 `optionalPhoneSchema`는 `student/schema.ts`에 정의되어 있어서, 다른 도메인(예: teacher, staff)에서 동일 패턴이 필요하면 중복 정의하거나 student에서 import해야 함
- `websiteSchema`는 `organization/schema.ts`에 별도로 동일 패턴을 다시 작성
- 에러 메시지 스타일이 미묘하게 달라질 위험 (도메인별로 각자 작성하므로)

### 제안 A: 구체 스키마를 shared로 이동

```typescript
// shared/schema/contacts.ts
export const optionalEmailSchema = z
  .union([z.literal(""), z.email("유효한 이메일을 입력해주세요")])
  .optional();

export const optionalPhoneSchema = z
  .union([z.literal(""), z.string().regex(/^[\d-]+$/, "유효한 전화번호를 입력해주세요")])
  .optional();

export const optionalUrlSchema = z
  .union([z.literal(""), z.url("유효한 URL을 입력해주세요")])
  .optional();
```

### 제안 B: 유틸리티 함수로 추상화

```typescript
// shared/utils/zod.ts
function emptyOr<T extends z.ZodType>(schema: T) {
  return z.union([z.literal(""), schema]);
}

// 사용: 에러 메시지를 도메인별로 커스터마이징 가능
const emailField = emptyOr(z.email("유효한 이메일을 입력해주세요")).optional();
const urlField = emptyOr(z.url("유효한 URL을 입력해주세요"));
```

### 장단점

**제안 A (구체 스키마 공유):**
- 장점: import 한 줄로 끝, 에러 메시지 프로젝트 전체 통일
- 단점: 에러 메시지를 도메인별로 다르게 하고 싶을 때 유연성 없음

**제안 B (유틸리티 함수):**
- 장점: 패턴만 공유하고 에러 메시지는 자유, 새로운 format(phone regex 등)에도 대응 가능
- 단점: 결국 각 도메인에서 매번 스키마를 조합해야 하므로 코드 절약이 크지 않음

**안 하는 경우의 단점:**
- 현재 5회 사용으로 심각한 수준은 아님. 새 도메인이 추가될 때마다 동일 패턴을 복붙하게 되고, 에러 메시지 통일이 점점 어려워짐

### 판단

현재 규모(5회)에서는 급하지 않음.
새 도메인(teacher 등)이 추가되는 시점에 제안 A로 추출하는 것이 적절.
`emptyOr` 유틸리티는 패턴이 3종류(email, phone, url) 이상으로 늘어날 때 검토.

