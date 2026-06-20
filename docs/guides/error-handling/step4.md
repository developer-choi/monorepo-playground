# Step 4. Client Side 렌더링 에러 처리

## 목차
1. [에러 처리는 왜 필요한가?](./step1.md)
2. [에러 피드백 UX 설계](./step2.md)
3. [에러 처리 원칙 세우기](./step3.md)
4. **Client Side 렌더링 에러 처리** ← 현재 문서
5. [Server Side 렌더링 에러 처리](./step5.md)
6. [이벤트 핸들러 시점 에러 처리](./step6.md)
7. [전역/공통/개별 에러 처리](./step7.md)

---

## 문제 정의
Client Side에서 렌더링 하다 임의의 에러가 발생할 수 있습니다.

1. 에러가 발생한 범위만 오류 페이지로 대체해서 [시스템 전체가 망가지는 걸 막아야 합니다.](./step3.md)
2. 오류에 맞는 에러 메시지를 [사용자에게 보여줘야 합니다.](./step2.md)

## 구현 1. 에러가 발생한 범위를 다른 UI로 대체하기

```typescript jsx
export default function Page() {
  return (
    <>
      <ProductFilter/>
      
      <ErrorBoundary fallback={...}>
        <ProductList/>
        <Pagination/>
      </ErrorBoundary>
    </>
  );
}
```

렌더링 하다 오류가 발생하는 것을 잡을 수 있는 방법은, Error Boundary 말고는 존재하지 않습니다.

따라서, 렌더링 하다 오류가 발생할 수 있는 범위를 Error Boundary로 잡아서 에러가 전체 페이지로 전파되는 것을 막아야 합니다.

### 그럼 Error Boundary를 감싸는 기준은 어떻게 잡아야 하나요?
디자이너와 같이 정해야 합니다.

홈 페이지에서 섹션이 1부터 12까지 있다고 했을 때,

1. 페이지 전체를 Error Boundary로 감싸서, 오류가 발생하면 레이아웃만 보이고 페이지 내용 전체가 에러 UI가 보이게 할 수도 있고,
2. 각 섹션마다 하나씩 감싸서, 3번째 섹션이 오류가 발생하면 3번째 섹션에만 오류 내용을 보여줄 수도 있고,
3. 긴급하지 않은 에러라서 그냥 그 섹션을 미노출 처리할 수도 있습니다.

## 구현 2. 오류에 맞는 에러 메시지로 대체하기

```typescript jsx
export default function Page() {
  return (
    <ErrorBoundary FallbackComponent={ProductFallback}>
      <ProductList/>
    </ErrorBoundary>
  );
}

function ProductFallback() {
  return (
    <div>Error occurred</div>
  );
}
```

Error Boundary에서는 error 객체를 전달하기 때문에, `에러 객체 안에 들어 있는 필드값`으로 어떤 에러인지를 판단할 수 있습니다.

따라서, 이런 식의 코드를 작성할 수 있습니다.

```typescript jsx
function ProductFallback({error}: FallbackProps) {
  if(error instanceof ApiResponseError && error.response.status === 500) {
    return (
      <div>
        <p>서버에서 오류가 발생했어요. 해당 오류가 지속되면 고객센터에 문의해 주세요.</p>
        <Link href="/">돌아가기</Link>
      </div>
    )
  }
}
```

하지만, 500 에러처럼, API마다 공통적으로 발생할 수 있는 오류가 존재합니다.

그래서 저런 코드를 Fallback마다 작성해야 하는 중복 코드 문제가 발생합니다.

이것은 [Step 7. 전역/공통/개별 에러 처리](step7.md)에서 다룹니다.

---

## 다음 단계

화면 렌더링 에러는 잡았지만, 서버에서 페이지를 그릴 때 발생하는 에러는 어떻게 할까요?

[Step 5. Server Side 렌더링 에러 처리](step5.md)