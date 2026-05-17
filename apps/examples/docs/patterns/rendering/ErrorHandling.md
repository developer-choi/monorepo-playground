# 에러 처리 이원화 — SSR / CSR

- **SSR**: try-catch → handleServerSideError → ErrorPageTemplate 직접 렌더 (4xx) 또는 throw (5xx → error.tsx)
- **CSR 비동기 에러** (useMutation 등 명령형 호출): useHandleClientSideError 훅 → overlay/toast로 표시
- **CSR 렌더링 에러**: HandledErrorBoundary → 에러 발생 영역만 격리
- **공통**: getErrorInfo()로 에러 정보 추출 (ApiResponseError 분기)

**원칙:**

- CSR 렌더링 에러는 ErrorBoundary로만 잡을 수 있다. 에러 발생 영역만 격리하고, 범위는 디자인 기획에 따라 결정한다.
- Axios Interceptor로 공통 에러를 처리하지 않는다 (override 불가, React Hooks 사용 불가).
- catch 후 console.error만 찍고 삼키지 않는다. 처리할 수 없으면 catch하지 않는다.
- re-throw는 더 구체적인 에러로 변환할 때만 한다.

## 공통: 에러 정보 추출

구체적 에러가 공통 에러보다 우선순위 높다. ApiResponseError 인스턴스 → status 코드로 분기 → 기본 메시지.

```tsx
function getErrorInfo(error: unknown): {title: string; content: string} {
  if (error instanceof ApiResponseError) {
    // 401: 로그인 페이지 리다이렉트 등 인증 아키텍처에 맞게 처리
    if (error.status === 403)
      return {title: '접근할 수 없어요', content: '권한이 필요해요. 관리자에게 권한을 요청해 주세요.'};
    if (error.status === 404)
      return {title: '정보를 찾을 수 없어요', content: '삭제되었거나 주소가 변경되었을 수 있어요.'};
    return {
      title: '일시적인 오류가 발생했어요',
      content: error.message || '잠시 후 다시 시도해 주세요. 문제가 계속되면 고객센터로 문의해 주세요.',
    };
  }
  if (error instanceof ApiRequestError) {
    return {title: '연결이 불안정해요', content: '네트워크 상태를 확인한 뒤 다시 시도해 주세요.'};
  }
  return {
    title: '일시적인 오류가 발생했어요',
    content: '잠시 후 다시 시도해 주세요. 문제가 계속되면 고객센터로 문의해 주세요.',
  };
}
```

## SSR: Server Component에서 사용

Server Component의 try-catch에서 호출한다.

- 4xx → ErrorPageTemplate을 JSX로 반환 (throw 하지 않음)
- 5xx → throw하여 error.tsx가 처리하도록 위임

```tsx
function handleServerSideError(error: unknown) {
  if (error instanceof ApiResponseError && error.status < 500) {
    const {title, content} = getErrorInfo(error);
    return <ErrorPageTemplate title={title} content={content} />;
  }
  throw error; // 5xx → error.tsx
}
```

사용 예시:

```tsx
async function ClassDetailPage({params}: PageProps) {
  const queryClient = new QueryClient();
  try {
    await queryClient.fetchQuery(classQueries.detail.options(params.classId));
  } catch (error) {
    return handleServerSideError(error);
  }
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ClassDetailPanel />
    </HydrationBoundary>
  );
}
```

## CSR: Client Component에서 사용

useMutation의 catch 블록에서 호출한다. [overlay-kit](https://overlay-kit.slash.page/)의 overlay.open으로 Alert 모달 표시.

```tsx
function useHandleClientSideError() {
  return useCallback((error: unknown) => {
    const {title, content} = getErrorInfo(error);
    overlay.open(({unmount}) => <Alert title={title} content={content} onClose={unmount} />);
  }, []);
}
```

사용 예시 — 개별 필드 에러를 먼저 분기, 나머지는 공통 함수에 위임:

```tsx
function LoginForm() {
  const handleClientSideError = useHandleClientSideError();
  const {mutateAsync} = useMutation({mutationFn: loginAction});

  const handleLogin = async (data: LoginRequest) => {
    try {
      await mutateAsync(data);
    } catch (error) {
      if (error instanceof ApiResponseError && error.field) {
        setError(error.field, {message: error.message}, {shouldFocus: true});
        return;
      }
      handleClientSideError(error);
    }
  };
}
```

## CSR: 렌더링 에러 경계

CSR 렌더링 에러는 ErrorBoundary로만 잡을 수 있다. HandledErrorBoundary로 감싸면 에러 발생 영역만 격리되고, 나머지 UI는 정상 동작한다. ErrorBoundary 배치 범위는 디자인 기획에 따라 결정한다.

```tsx
function HandledErrorBoundary({children}: PropsWithChildren) {
  return (
    <ErrorBoundary
      fallbackRender={({error, resetErrorBoundary}) => {
        const {title, content} = getErrorInfo(error);
        return <ErrorPageTemplate title={title} content={content} onAction={resetErrorBoundary} />;
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
```

사용 예시:

```tsx
<HandledErrorBoundary>
  <Suspense fallback={<ContestListSkeleton />}>
    <ContestSection />
  </Suspense>
</HandledErrorBoundary>
```

## error.tsx (Next.js App Router)

CSR 렌더링 중 throw된 에러를 잡는 최후의 안전망. handleServerSideError에서 throw한 5xx도 여기서 처리.

**주의:** SSR에서 throw된 에러는 서버→클라이언트 직렬화 경계를 넘으므로 ApiResponseError 분기에 도달하지 않는다. CSR에서 throw된 에러는 원본 인스턴스가 그대로 전달되므로 `instanceof` 분기가 정상 동작한다.

```tsx
'use client';

function ErrorPage({error, reset}: {error: Error; reset: () => void}) {
  const {title, content} = getErrorInfo(error);
  return <ErrorPageTemplate title={title} content={content} onAction={reset} />;
}
```
