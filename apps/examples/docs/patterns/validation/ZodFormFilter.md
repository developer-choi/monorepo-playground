# 폼/필터 Zod 패턴

react-hook-form + zod를 조합한 폼 검증, URL 쿼리스트링 필터 파싱, "전체" 옵션 처리 패턴을 다룬다.

## zodResolver로 폼 검증 단일화

`register`의 `validate` 옵션과 zod 스키마가 이중으로 존재하면 검증 규칙이 분산된다. `zodResolver`를 사용하면 검증 로직을 스키마 하나로 통합할 수 있다.

```tsx
// apps/examples/src/validation/integration/components/BoardForm.tsx
const {
  register,
  handleSubmit,
  control,
  formState: {errors},
} = useForm<CreateBoardApiRequest>({
  resolver: zodResolver(createBoardSchema), // 검증 규칙을 스키마에만 두고 register에는 작성하지 않는다
  defaultValues: board ?? DEFAULT_FORM_DATA,
});
```

`useForm`의 제네릭 타입(`CreateBoardApiRequest`)과 `resolver`의 스키마(`createBoardSchema`)는 같은 스키마에서 파생되므로 타입-검증 규칙이 항상 일치한다.

```ts
// apps/examples/src/validation/integration/schema.ts
export const createBoardSchema = boardOriginalSchema.pick({
  postTitle: true,
  postContent: true,
  boardType: true,
  category: true,
  tagList: true,
});

export type CreateBoardApiRequest = z.infer<typeof createBoardSchema>;
```

## 단일/배열 union transform — 필터 스키마

`query-string` 라이브러리는 동일 키가 1개이면 `string`, 2개 이상이면 `string[]`로 파싱한다. 컴포넌트가 매번 `Array.isArray`로 분기하지 않으려면 스키마의 `transform`으로 통일한다.

```ts
// apps/examples/src/validation/integration/schema.ts

// 단일 string을 배열로 통일하는 재사용 헬퍼
const stringOrStringArray = z.union([
  z.string().transform((val) => [val]), // "gallery" → ["gallery"]
  z.array(z.string()),                  // ["gallery", "normal"] → 그대로
]);

export const boardListFilterSchema = boardOriginalSchema.pick({
  postTitle: true,
  category: true,
}).extend({
  // enum 검증 후 배열로 통일
  boardType: z.union([boardTypeEnum.transform((val) => [val]), z.array(boardTypeEnum)]),
  // 일반 string은 헬퍼로 처리
  tagList: stringOrStringArray,
});
```

파싱 결과(`z.infer<typeof boardListFilterSchema>`)의 `boardType`과 `tagList`는 항상 배열이므로 컴포넌트에서 별도 분기가 필요 없다.

## 필터 "전체" 처리 — Checkbox vs Select

"전체"는 도메인 스키마에 없는 프론트 전용 상태다. API에는 파라미터를 생략하는 것으로 "전체"를 표현한다. UI 컴포넌트의 특성에 따라 처리 방식이 달라진다.

### Checkbox — 'all' 값 불필요

선택된 값이 배열이므로 "전부 선택됐는지"를 배열 길이로 판단할 수 있다. 'all' 같은 특수 값이 필요하지 않다.

```tsx
// apps/examples/src/validation/integration/components/BoardFilter.tsx

// 렌더링 — 전체 체크박스는 모든 값이 선택됐는지로 checked 상태를 계산
<Checkbox
  checked={BOARD_TYPES.values.every((type) => field.value.includes(type))}
  onCheckedChange={(checked) => field.onChange(checked ? BOARD_TYPES.values : [])}
/>

// 제출 시 — 전부 선택됐으면 쿼리스트링에서 생략 (파라미터 없음 = 전체)
const isAllTypes = BOARD_TYPES.values.every((type) => data.boardType.includes(type));
router.push(
  buildUrlWithQuery({
    pathname: DEFAULT_URL,
    params: {
      ...data,
      boardType: isAllTypes ? undefined : data.boardType,
    },
  }),
);
```

### Select — 'all' 프론트 전용 값 필요

단일 값만 보유할 수 있어 "전체" 상태를 배열 계산으로 표현할 수 없다. 'all'이라는 프론트 전용 값을 추가한다.

```tsx
// 렌더링
<Select.Root value={field.value} onValueChange={field.onChange}>
  <Select.Trigger placeholder="전체" />
  <Select.Content>
    <Select.Item value="all">전체</Select.Item> {/* 도메인에 없는 프론트 전용 값 */}
    {BOARD_CATEGORIES.items.map(({value, label}) => (
      <Select.Item key={value} value={value}>{label}</Select.Item>
    ))}
  </Select.Content>
</Select.Root>

// 제출 시 — 'all'이면 쿼리스트링에서 생략
router.push(
  buildUrlWithQuery({
    pathname: DEFAULT_URL,
    params: {
      ...data,
      category: data.category === 'all' ? undefined : data.category,
    },
  }),
);
```

### 폼 타입과 스키마 타입 분리

Select에 'all'이 추가되면 폼의 `category` 타입이 도메인 스키마와 달라진다. 이를 명시적으로 분리한다.

```ts
// API와 URL 파싱에서 사용하는 타입
type BoardListFilter = z.infer<typeof boardListFilterSchema>;
// category: 'notice' | 'free' | 'question' | 'info'

// 필터 폼에서 사용하는 타입 — 'all' 추가
interface BoardListFilterForm extends Omit<BoardListFilter, 'category'> {
  category: BoardListFilter['category'] | 'all';
}
```

폼은 `BoardListFilterForm`으로, API 호출·URL 조작은 `BoardListFilter`로 구분하여 'all'이 API로 유출되지 않도록 타입 수준에서 차단한다.
