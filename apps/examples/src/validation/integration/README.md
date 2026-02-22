# Zod 활용기

- [배포 링크](https://monorepo-playground-examples.vercel.app/validation/integration)
- [컨벤션 링크](https://github.com/developer-choi/ai-contexts/blob/master/instructions/conventions/coding/zod.md)

---

# 왜 zod를 쓰는가?

## 1. 타입 선언과 유효성 검증을 따로 작성해야 합니다

```typescript
// 1. 타입 선언
interface LessonRow {
  lessonType: 'online' | 'offline';
}

// 2. 유효성 검증 — 같은 제약을 다시 작성 (react-hook-form)
<select {...register('lessonType', {
  required: '수업 유형을 선택해주세요',
  validate: (value) => ['online', 'offline'].includes(value) || '유효하지 않은 수업 유형입니다',
})} />
```

### zod로 구현하면?

```typescript
// 타입, 유효성 검증, 에러메시지를 하나의 스키마에 통합
const LessonSchema = z.object({
  lessonType: z.enum(['online', 'offline'], {
    errorMap: () => ({ message: '수업 유형을 선택해주세요' }),
  }),
});

// 타입은 스키마에서 자동 추론
type Lesson = z.infer<typeof LessonSchema>;
```

## 2. 폼과 URL에서 같은 필드를 각각 검증해야 합니다

같은 필드라도, 검증이 필요한 시점마다 입력값의 타입이 다릅니다.

```typescript
// 1. 폼 — 입력값이 string
<select {...register('lessonType', {
  validate: (value) => ['online', 'offline'].includes(value) || '유효하지 않은 수업 유형입니다',
})} />

// 2. URL 쿼리스트링 — 입력값이 string | string[] | undefined
export default function LessonListPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const lessonType = ...
}
```

> 입력값의 타입이 다르면 검증 로직을 공유하기 어렵습니다. 시점마다 별도의 검증 코드를 작성해야 합니다.

### zod로 구현하면?

```typescript
const LessonSchema = z.object({
  lessonType: z.enum(['online', 'offline'], {
    errorMap: () => ({ message: '수업 유형을 선택해주세요' }),
  }),
});

// 폼 — 같은 스키마로 검증
const { register } = useForm<z.infer<typeof LessonSchema>>({
  resolver: zodResolver(LessonSchema),
});

// URL 쿼리스트링 — 같은 스키마로 검증
export default function LessonListPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const { success, data: filter } = LessonSchema.safeParse(searchParams);
}
```

zod는 입력값의 타입에 관계없이 동일한 스키마로 검증할 수 있습니다.

---

# 어떻게 활용할 수 있는가?

실무에서는 CRUD, 필터, UI 등 다양한 경우의 수가 있고, 각각을 zod로 어떻게 풀 수 있는지가 중요합니다.

아래는 수업(Lesson) 도메인을 예시로, 자주 만나는 경우들을 정리한 것입니다.

## 1. 원본 스키마 하나에서 용도별 타입을 파생할 수 있습니다

하나의 도메인(예: 수업)에서 파생되는 타입은 여러 개입니다.

- **목록 API 응답** — 요약 필드만 (pk, 제목, 유형, 정원)
- **상세 API 응답** — 전체 필드
- **생성 API 요청** — pk, 내용(description) 없이
- **수정 API 요청** — 생성 필드 + pk
- **필터** — 검색에 필요한 필드만 (제목, 유형)

이 타입들을 각각 따로 선언하면 필드 제약(예: 제목 100자)이 중복되고, 하나를 바꾸면 나머지도 수동으로 맞춰야 합니다.

zod에서는 **전체 필드를 가진 원본 스키마**를 하나 정의하고, `.pick()`과 `.extend()`로 파생할 수 있습니다.

```typescript
// 원본 — 전체 필드를 가진 단일 원천(Single Source of Truth)
const LessonOriginalSchema = z.object({
  pk: z.number().int().positive(),
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(5000),
  lessonType: z.enum(['online', 'offline']),
  /** 0 = 0명(수강 불가), 양수 = 해당 인원 */
  capacity: z.number().int().min(0),
});

// 목록 — description 제외
export const LessonRowSchema = LessonOriginalSchema.pick({
  pk: true, title: true, lessonType: true, capacity: true,
});

// 상세 — 전체 필드
export const LessonDetailSchema = LessonOriginalSchema;

// 생성 — pk, description 제외
export const CreateLessonSchema = LessonOriginalSchema.pick({
  title: true, lessonType: true, capacity: true,
});
```

`title`의 최대 길이를 100자에서 200자로 바꿀 때, 원본 스키마 한 곳만 수정하면 모든 파생 스키마에 반영됩니다.

## 2. 상수를 검증·에러메시지·UI에서 공유할 수 있습니다

같은 값(예: 최대 100자)을 스키마 검증, 에러메시지, UI에서 각각 써야 합니다. 상수를 한 곳에 정의하고 공유할 수 있습니다.

### 길이 제한

```typescript
export const LESSON_LIMITS = {
  title: {min: 1, max: 100},
  description: {min: 1, max: 5000},
} as const;

// 스키마 — 검증에 사용
z.string().min(LESSON_LIMITS.title.min).max(LESSON_LIMITS.title.max)

// 에러메시지
`제목은 ${LESSON_LIMITS.title.max}자 이내로 입력하세요`

// UI — 입력 길이 제한
<TextField.Root {...register('title')} maxLength={LESSON_LIMITS.title.max} />
```

---

# 관련 설계 패턴

## enum 값 + 라벨 관리

enum 값에 대한 한글 라벨은 UI 여러 곳에서 필요합니다.

- Select, RadioGroup, Checkbox의 **항목 순회**
- 테이블, 상세 페이지의 **라벨 표시**
- z.enum()에 전달할 **값 배열**

하나의 `{value, label}[]` 배열에서 이 세 가지 형태를 모두 파생하는 유틸리티를 만들 수 있습니다.

```typescript
// 유틸리티
interface LabelItem<T> { value: T; label: string; }
interface LabelMap<T extends string> {
  items: LabelItem<T>[];       // 순회용 — Select, RadioGroup, Checkbox
  record: Record<T, string>;   // 조회용 — 테이블, 상세 페이지
  values: T[];                 // z.enum() 전달용
}
function createLabelMap<T extends string>(items: LabelItem<T>[]): LabelMap<T> { ... }

// 상수 정의
export const LESSON_TYPES = createLabelMap([
  {value: 'online', label: '온라인'},
  {value: 'offline', label: '오프라인'},
]);

// 순회 — items
{LESSON_TYPES.items.map(({value, label}) => (
  <Select.Item key={value} value={value}>{label}</Select.Item>
))}

// 라벨 조회 — record
<Badge>{LESSON_TYPES.record[row.lessonType]}</Badge>

// 스키마 — values
z.enum(LESSON_TYPES.values)
```

## 필터의 "전체" 처리

목록 페이지의 필터에는 보통 "전체" 옵션이 있습니다. 수업 유형을 전부 보고 싶으면 "전체"를 선택하는 식입니다.

그런데 `'all'`은 도메인 스키마에 없는 값입니다. API에도 보내지 않습니다 (파라미터 없음 = 전체). 이 "전체" 상태를 폼 데이터에서 어떻게 표현할지는 UI 컴포넌트에 따라 달라집니다.

### Checkbox — "전체" 값이 필요 없음

Checkbox는 선택된 값을 **배열**로 저장합니다. 전부 체크되어 있는지는 배열로 판단할 수 있으므로, `'all'` 같은 별도의 값이 필요 없습니다.

```typescript
// 제출 시 — 전부 선택됐으면 쿼리스트링에서 생략
const isAllTypes = LESSON_TYPES.values.every(t => data.lessonType.includes(t));
if (!isAllTypes) {
  data.lessonType.forEach(type => searchParams.append('lessonType', type));
}
```

### Select — "전체" 값이 필수

Select는 **단일 값**을 저장합니다. "전체"를 선택한 상태를 데이터에서 계산할 방법이 없으므로, `'all'` 같은 프론트 전용 값을 폼 데이터에 직접 넣어야 합니다.

```typescript
<Select.Content>
  <Select.Item value="all">전체</Select.Item>
  {LESSON_CATEGORIES.items.map(({value, label}) => (
    <Select.Item key={value} value={value}>{label}</Select.Item>
  ))}
</Select.Content>

// 제출 시 — 'all'이면 쿼리스트링에서 생략
if (data.category !== 'all') params.set('category', data.category);
```

`'all'`은 스키마 enum에 없는 프론트 전용 값이므로, **필터 폼의 타입은 스키마 타입과 분리**해야 합니다.

```typescript
// 스키마 타입 — API와 URL에서 사용
type LessonListFilter = z.infer<typeof LessonListFilterSchema>;
// { category: 'notice' | 'free' | 'question' | 'info' }

// 필터 폼 타입 — 이 컴포넌트에서만 사용, 'all' 추가
interface LessonListFilterForm extends Omit<LessonListFilter, 'category'> {
  category: LessonListFilter['category'] | 'all';
}
```
