# Step 5. Server Side 렌더링 에러 처리

## 목차
1. [에러 처리는 왜 필요한가?](./step1.md)
2. [에러 피드백 UX 설계](./step2.md)
3. [에러 처리 원칙 세우기](./step3.md)
4. [Client Side 렌더링 에러 처리](./step4.md)
5. **Server Side 렌더링 에러 처리** ← 현재 문서
6. [이벤트 핸들러 시점 에러 처리](./step6.md)
7. [전역/공통/개별 에러 처리](./step7.md)

---

## 문제 정의
Server Side에서 페이지를 렌더링 하다 임의의 에러가 발생할 수 있습니다. (API 에러 등)

1. 에러가 발생한 페이지 범위만 오류 페이지로 대체해서 [시스템 전체가 망가지는 걸 막아야 합니다.](./step3.md)
2. 오류에 맞는 에러 메시지를 [사용자에게 보여줘야 합니다.](./step2.md)

## 해결 방법 비교

### 옵션 1: error.tsx 활용
Server에서 에러를 던지면 [error.tsx](https://nextjs.org/docs/app/api-reference/file-conventions/error)에서 에러페이지를 노출할 수 있습니다.

하지만, 에러 객체의 모든 정보가 손실됩니다.

> - However, this behavior is different in production to avoid leaking potentially sensitive details included in the error to the client.
> - https://nextjs.org/docs/app/api-reference/file-conventions/error#error

즉, `if(error instanceof PaymentError)` 같은 분기 처리가 불가능하고,

error.message도 `An error occurred in the Server Components render. ...` 로 고정됩니다.

따라서, 오류에 맞는 에러 메시지를 사용자에게 보여줘야 한다는 요구사항을 만족할 수 없습니다.

### 옵션 2: Server에서 직접 try-catch

```typescript jsx
export default async function Page() {
  try {
    const response = await getProductListApi();
    
    return(
      <main>...</main>
    );
    
  } catch (error) {
    if(error instanceof ApiResponseError) {
      return (
        <div>...</div>
      );
    } else {
      throw error; // error.tsx에서 기본 에러메시지 노출
    }
  }
}
```

Server Side에서는 (원본) 에러 객체에 접근이 가능하다는 점에 착안하여 try-catch 하는 방법을 생각했습니다.

- **장점:** 에러 타입별로 다른 에러 메시지 노출 가능
- **단점:** 각 Server Component마다 try-catch 필요

## 선택과 근거
Server Side에서 매번 try-catch 하는 방법을 선택했습니다.

요구사항을 만족할 수 있는 다른 방법이 있었다면 장단점을 비교했겠지만, 다른 대안이 없었습니다.

Server Side의 에러 객체를 Client Side로 유지시킬 수 있는 방향은 일부러 찾아보지 않았습니다.

프레임워크의 보안 철학을 무시하고 우회하려 할 때 발생할 수 있는 잠재적 위험을 경계했기 때문입니다.

### 왜 Vercel은 이렇게 설계했을까요?
> to avoid leaking potentially sensitive details included in the error to the client.

에러 객체에 속성을 추가하는 것은 좋은 방법입니다. ([Step 3. 에러 처리 원칙 세우기](docs/error/step3.md))

하지만, 개발자의 실수로 민감한 정보를 에러 객체에 저장하는 것도 충분히 가능합니다.

예를 들어, 아래의 에러 클래스는 문제가 될 수 있습니다.

```typescript
export class ApiResponseError extends BaseError {
  readonly request: BaseApiRequest;
  readonly response: BaseApiResponse;

  constructor(request: BaseApiRequest, response: BaseApiResponse) {
    super(...);
    this.request = request;
    this.response = response;
  }
}
```

요청 및 응답 데이터를 에러 객체의 속성으로 관리하는 것은 `ApiResponseError` 클래스의 역할에 충실한 설계입니다. 

다만, 보안이 중요한 API 응답까지 에러 객체에 담겨 클라이언트로 노출될 위험이 존재합니다.

이러한 잠재적 보안 사고를 원천 차단하기 위해 원본 에러 객체의 전송을 막아둔 프레임워크의 철학에 공감합니다.

## 구현 방법
개별 페이지 컴포넌트에서 `try-catch`를 사용하여 에러를 잡고, 에러 종류에 따라 적절한 UI를 반환하도록 구현했습니다.

```typescript jsx
function ErrorPageTemplate({title, content}: ErrorPageTemplateProps) {
  return (
    <div>
      <h2>{title}</h2>
      <p>{content}</p>
    </div>
  );
}

// 상품 리스트 페이지
async function Page() {
  try {
    const response = await getProductListApi();
    // 이후 상품 리스트 페이지 렌더링
  } catch (error) {
    if(error instanceof ApiResponseError) {
      return (
        <ErrorPageTemplate title="..." content="..."/>
      );
    } else {
      throw error; // error.tsx에서 기본 에러메시지 노출
    }
  }
}

// 상품 상세 페이지
async function Page() {
  // 위와 100% 동일합니다.
}
```

하지만, 500 에러처럼, API마다 공통적으로 발생할 수 있는 오류가 존재합니다.

그래서 저런 코드를 페이지마다 작성해야 하는 중복 코드 문제가 발생합니다.

이것은 [Step 7. 전역/공통/개별 에러 처리](step7.md)에서 다룹니다.

---

## 다음 단계

렌더링 시점의 에러들은 모두 잡았습니다. 이제 사용자가 버튼을 클릭했을 때 발생하는 에러를 다룰 차례입니다.

[Step 6. 이벤트 핸들러 시점 에러 처리](step6.md) 
