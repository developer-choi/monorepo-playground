# Zod 페이지 통합 패턴

Next.js App Router 서버 컴포넌트에서 Zod 검증 유틸을 조합하여 searchParams·경로 파라미터·폼을 처리하는 패턴.

## searchParams → safeParsePartial → API 호출

목록 페이지에서 URL 쿼리스트링을 필터·페이지네이션으로 파싱하여 API에 전달할 때 사용한다.

searchParams는 사용자가 직접 조작할 수 있다. `schema.parse()`를 쓰면 필드 하나가 잘못되어도 전체가 실패한다. `safeParsePartial`은 필드를 개별 검증하여 성공한 필드만 추출하므로, 일부 파라미터가 오염되어도 나머지 유효한 필터는 그대로 API에 전달된다.

```tsx
// apps/examples/src/app/validation/integration/page.tsx
import {safeParsePartial} from '@/shared/utils/zod';
import {boardListFilterSchema} from '@/validation/integration/schema';
import {paginationParamsSchema} from '@/shared/schema/pagination';
import {getBoardListApi} from '@/validation/integration/api';

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Page({searchParams}: PageProps) {
  const query = await searchParams;

  // 각 스키마별로 독립 파싱 — 한쪽 실패가 다른 쪽에 영향 없음
  const filters = safeParsePartial(boardListFilterSchema, query);
  const pagination = safeParsePartial(paginationParamsSchema, query);

  // 유효한 필드만 spread하여 API 호출
  const data = await getBoardListApi({...filters, ...pagination});

  return (
    <Container p="6" size="3">
      <BoardFilter />
      <BoardTable data={data} />
    </Container>
  );
}
```

`safeParsePartial`의 구현과 `z.coerce`를 이용한 스키마 선언 방법은 `ZodInputParsing.md`를 참조한다.

---

## [id] 페이지 진입 시 ID 검증 + 에러 처리

동적 라우트 `[id]` 페이지에서 `params.id`를 숫자로 검증하고, 실패 시 404로 처리할 때 사용한다.

`params.id`는 항상 문자열이다. `"abc"` 같은 비숫자가 올 수 있고, API 호출 전에 차단하지 않으면 서버 오류가 된다. `parseNumericId`가 파싱 실패 시 `InvalidAccessError`를 throw하고, `handleServerSideError`가 이를 NOT_FOUND 페이지로 변환한다. 이 흐름은 상세 페이지와 수정 페이지가 동일하다.

```tsx
// apps/examples/src/app/validation/integration/[id]/page.tsx
import {getBoardApi} from '@/validation/integration/api';
import {parseNumericId} from '@/shared/schema/params';
import {handleServerSideError} from '@/shared/error/handler/server';
import BoardDetail from '@/validation/integration/components/BoardDetail';

export default async function Page({params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  try {
    // parseNumericId: "abc" → throw InvalidAccessError, "42" → 42
    const board = await getBoardApi(parseNumericId(id));
    return <BoardDetail board={board} />;
  } catch (error) {
    // InvalidAccessError(NOT_FOUND) → 404 페이지 렌더링
    return handleServerSideError(error);
  }
}
```

```tsx
// apps/examples/src/app/validation/integration/[id]/edit/page.tsx
// 수정 페이지도 동일한 패턴 — ID 검증 후 데이터를 폼에 전달
export default async function Page({params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  try {
    const board = await getBoardApi(parseNumericId(id));
    return <BoardForm board={board} />;
  } catch (error) {
    return handleServerSideError(error);
  }
}
```

`parseNumericId` 내부의 `.regex` → `.transform` → `.pipe` 파이프라인은 `ZodInputParsing.md`를 참조한다.

---

## 생성/수정 페이지에서 같은 폼 컴포넌트 재사용

생성 페이지와 수정 페이지가 같은 `BoardForm` 컴포넌트를 사용하되, 수정 시 기존 데이터를 `defaultValues`로 채울 때 사용한다.

생성·수정 폼은 필드가 거의 같다. 페이지를 별도 컴포넌트로 만들면 로직이 중복된다. `board` prop이 `undefined`면 생성, 존재하면 수정으로 분기하고, `defaultValues`와 `onSubmit` 분기를 한 컴포넌트 안에서 처리한다.

**생성 페이지 — board를 undefined로 전달**

```tsx
// apps/examples/src/app/validation/integration/create/page.tsx
import BoardForm from '@/validation/integration/components/BoardForm';

export default function Page() {
  return <BoardForm board={undefined} />;
}
```

**수정 페이지 — 서버에서 데이터 fetch 후 board를 전달**

```tsx
// apps/examples/src/app/validation/integration/[id]/edit/page.tsx
export default async function Page({params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  try {
    const board = await getBoardApi(parseNumericId(id));
    return <BoardForm board={board} />; // 기존 데이터를 폼에 주입
  } catch (error) {
    return handleServerSideError(error);
  }
}
```

**BoardForm — board prop으로 생성/수정 분기**

```tsx
// apps/examples/src/validation/integration/components/BoardForm.tsx
interface BoardFormProps {
  board: BoardDetail | undefined;
}

export default function BoardForm({board}: BoardFormProps) {
  const isEdit = !!board;

  const {handleSubmit, ...} = useForm<CreateBoardApiRequest>({
    resolver: zodResolver(createBoardSchema),
    defaultValues: board ?? DEFAULT_FORM_DATA, // board 있으면 기존 값, 없으면 빈 폼
  });

  const onSubmit = async (data: CreateBoardApiRequest) => {
    if (isEdit) {
      // 수정: PATCH + 상세·목록 경로 revalidate 후 상세로 이동
      await updateMutation.mutateAsync({id: board.id, ...data});
      await Promise.all([
        revalidatePathFromClient('/validation/integration'),
        revalidatePathFromClient(`/validation/integration/${board.id}`),
      ]);
      router.push(`/validation/integration/${board.id}`);
    } else {
      // 생성: POST + 목록 경로 revalidate 후 목록으로 이동
      await createMutation.mutateAsync(data);
      await revalidatePathFromClient('/validation/integration');
      router.push('/validation/integration');
    }
  };

  return (
    <form onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
      <Heading>{isEdit ? '글 수정' : '새 글 작성'}</Heading>
      {/* 필드는 생성·수정 동일 */}
    </form>
  );
}

const DEFAULT_FORM_DATA: CreateBoardApiRequest = {
  postTitle: '',
  postContent: '',
  boardType: 'normal',
  category: 'free',
  tagList: [],
};
```

`board ?? DEFAULT_FORM_DATA`로 `defaultValues`를 결정하므로 수정 시 기존 값이 폼에 채워지고, 생성 시 빈 폼으로 시작한다. `isEdit` 플래그는 헤딩 텍스트와 제출 후 리다이렉트 경로 분기에도 사용된다.
