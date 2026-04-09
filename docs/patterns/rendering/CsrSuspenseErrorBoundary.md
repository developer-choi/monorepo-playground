# CSR + useSuspenseQuery + ErrorBoundary + Suspense

Vite + React 같은 CSR 앱에서 선언적 데이터 로딩. loading/error 분기 없이 Suspense + ErrorBoundary가 처리.

## 페이지 컴포넌트

페이지에서 ErrorBoundary → Suspense → 데이터 컴포넌트 순으로 감싼다. ErrorBoundary가 바깥, Suspense가 안쪽.

```tsx
export default function HomePage() {
  return (
    <div>
      <Header />
      <ErrorBoundary
        fallbackRender={({ resetErrorBoundary }) => (
          <ErrorPageTemplate
            title="데이터 오류"
            content="데이터를 불러오지 못했습니다."
            onAction={resetErrorBoundary}
          />
        )}
      >
        <Suspense fallback={<LoadingSpinner />}>
          <WeatherCard lat={37.5} lon={127.0} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
```

## 데이터 컴포넌트

useSuspenseQuery를 사용하는 컴포넌트는 isLoading, isError 체크 없이 data를 바로 사용한다. Suspense가 로딩을, ErrorBoundary가 에러를 처리하기 때문.

쿼리 옵션은 queries.ts의 팩토리에서 가져온다. 쿼리 팩토리 패턴은 [QueryOptionsFactory](../query/QueryOptionsFactory.md) 참고. 에러 처리 전략은 [에러 처리 이원화](./ErrorHandling.md) 참고.

```tsx
function WeatherCard({ lat, lon }: { lat: number; lon: number }) {
  const { data: weather } = useSuspenseQuery(
    weatherQueries.current.options(lat, lon),
  );

  return (
    <Card>
      <Temperature value={weather.temp} />
      <Description value={weather.description} />
    </Card>
  );
}
```

## 복수 Suspense 경계

독립적인 데이터 영역이 여러 개면 각각을 별도 Suspense로 감싸 독립적으로 로딩한다. ErrorBoundary 배치는 격리 범위에 따라 결정한다 — 위 섹션 참고.

```tsx
function ChatRoom({ roomId }: { roomId: number }) {
  return (
    <>
      <Suspense fallback={<HeaderSkeleton />}>
        <ChatHeader roomId={roomId} />
      </Suspense>
      <Suspense fallback={<MessageListSkeleton />}>
        <MessageList roomId={roomId} />
      </Suspense>
      <ChatForm roomId={roomId} />
    </>
  );
}
```
