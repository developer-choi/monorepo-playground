# Zod 스키마 설계 패턴

단일 원천(single source of truth)을 유지하면서 enum, 제약 조건, 파생 스키마, 타입을 구성하는 5가지 패턴을 다룬다.

## createLabelMap — enum 값·라벨 단일 원천

Select 순회, 테이블 라벨 조회, `z.enum` 전달을 한 상수에서 처리해야 할 때 사용한다.
값과 라벨을 별도 배열·객체로 관리하면 값을 추가할 때 한쪽만 업데이트되는 오류가 발생하므로, `createLabelMap`으로 묶어 단일 원천으로 만든다.

```ts
export const BOARD_TYPES = createLabelMap([
  {value: 'gallery', label: '갤러리'},
  {value: 'normal', label: '일반'},
]);

// 스키마 — values: z.enum에 전달 가능한 string[]
const boardTypeEnum = z.enum(BOARD_TYPES.values, {
  error: '게시판 유형을 선택해주세요',
});

// 순회 — items: {value, label}[] 그대로 사용
{BOARD_TYPES.items.map(({value, label}) => (
  <Select.Item key={value} value={value}>{label}</Select.Item>
))}

// 라벨 조회 — record: Record<T, string>으로 O(1) 접근
<Badge>{BOARD_TYPES.record[row.boardType]}</Badge>
```

`createLabelMap`이 반환하는 구조:

| 키 | 타입 | 용도 |
|---|---|---|
| `items` | `{value, label}[]` | Select 등 목록 순회 |
| `values` | `T[]` | `z.enum()` 인수 |
| `record` | `Record<T, string>` | 값 → 라벨 조회 |

## LIMITS 상수 — 제약 조건 중앙화

필드 min/max를 스키마 검증, 에러 메시지, UI `maxLength` 세 곳에서 동시에 사용할 때 쓴다.
하드코딩하면 UI와 검증 값이 어긋날 수 있으므로 상수로 중앙화한다.

```ts
export const BOARD_LIMITS = {
  postTitle: {min: 1, max: 100},
  postContent: {min: 1, max: 5000},
  tagList: {maxCount: 10, maxLength: 20},
};

// 스키마 검증 + 에러 메시지에서 같은 상수 참조
z.string()
  .min(BOARD_LIMITS.postTitle.min, '제목을 입력하세요')
  .max(BOARD_LIMITS.postTitle.max, `제목은 ${BOARD_LIMITS.postTitle.max}자 이내로 입력하세요`)

// UI — maxLength가 스키마와 자동으로 일치
<TextField.Root {...register('postTitle')} maxLength={BOARD_LIMITS.postTitle.max} />
```

## 원본 스키마 → 파생 스키마 (pick + extend)

도메인에서 목록·상세·생성·수정 타입이 같은 필드를 기반으로 파생될 때 사용한다.
각각 별도로 선언하면 필드 제약이 중복되고, 하나를 바꾸면 나머지를 수동으로 수정해야 한다.

```ts
// 원본 — 도메인 전체 필드와 제약을 한 곳에 정의
const boardOriginalSchema = z.object({
  id: numericIdSchema,
  postTitle: z
    .string()
    .min(BOARD_LIMITS.postTitle.min, '제목을 입력하세요')
    .max(BOARD_LIMITS.postTitle.max, `제목은 ${BOARD_LIMITS.postTitle.max}자 이내로 입력하세요`),
  postContent: z
    .string()
    .min(BOARD_LIMITS.postContent.min, '내용을 입력하세요')
    .max(BOARD_LIMITS.postContent.max, `내용은 ${BOARD_LIMITS.postContent.max}자 이내로 입력하세요`),
  boardType: boardTypeEnum,
  category: boardCategoryEnum,
  tagList: z
    .array(tagSchema)
    .max(BOARD_LIMITS.tagList.maxCount, `태그는 최대 ${BOARD_LIMITS.tagList.maxCount}개까지 가능합니다`),
});

// 상세 — 전체 필드가 필요하면 원본을 그대로 할당 (pick으로 전체 나열은 불필요)
export const boardDetailSchema = boardOriginalSchema;

// 목록 — 필요한 필드만 pick
export const boardRowSchema = boardOriginalSchema.pick({
  id: true,
  postTitle: true,
  boardType: true,
  category: true,
  tagList: true,
});

// 생성 — id를 제외한 입력 필드만 pick
export const createBoardSchema = boardOriginalSchema.pick({
  postTitle: true,
  postContent: true,
  boardType: true,
  category: true,
  tagList: true,
});

// 수정 — pick으로 id를 취하고 extend로 필드를 오버라이드
const updateBoardSchema = boardOriginalSchema.pick({id: true}).extend({
  ...createBoardSchema.shape,
  boardType: boardTypeEnum.nullable(), // 백엔드에서 null을 명시적으로 요구하는 경우
});
```

원본 스키마(`boardOriginalSchema`) 자체는 export하지 않는다. 상세 뷰처럼 전체 필드가 필요한 경우에도 `boardDetailSchema`라는 파생 이름으로 할당하여, 외부에서는 항상 용도별 파생 스키마를 통해 접근한다.

## z.infer로 타입 추론

API 요청·응답 타입을 별도 `interface`로 선언하지 않고 스키마에서 파생할 때 사용한다.
스키마와 타입을 분리 관리하면 스키마가 바뀔 때 타입도 수동으로 수정해야 하는 이중 작업이 생긴다.

```ts
export type BoardDetail = z.infer<typeof boardDetailSchema>;
export type BoardRow = z.infer<typeof boardRowSchema>;
export type CreateBoardApiRequest = z.infer<typeof createBoardSchema>;
export type UpdateBoardApiRequest = z.infer<typeof updateBoardSchema>;
export type BoardListFilter = z.infer<typeof boardListFilterSchema>;
```

스키마를 수정하면 타입이 자동으로 따라오므로 타입과 검증 로직 사이의 불일치가 없다.

## nullable()로 API 계약 명시

백엔드가 `undefined`(키 생략)가 아닌 명시적 `null`을 요구할 때 사용한다.
`optional()`은 해당 키 자체를 생략(undefined)하는 반면, 일부 백엔드는 `null`과 `undefined`를 다르게 처리한다. 이 경우 `optional()`을 쓰면 런타임에서 계약 위반이 발생한다.

```ts
const updateBoardSchema = boardOriginalSchema.pick({id: true}).extend({
  ...createBoardSchema.shape,
  boardType: boardTypeEnum.nullable(), // 백엔드에서 null을 명시적으로 요구하는 경우
});
```

| 메서드 | 직렬화 결과 | 사용 시점 |
|---|---|---|
| `optional()` | 키 자체 생략 (`undefined`) | 필드를 보내지 않아도 되는 경우 |
| `nullable()` | `null`을 값으로 전송 | 백엔드가 `null`을 명시적으로 요구하는 경우 |
| `nullish()` | `null` 또는 `undefined` 모두 허용 | 두 경우를 모두 수용하는 경우 |
