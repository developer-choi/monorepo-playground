# Step 7. 전역/공통/개별 에러 처리

이 글은 중복된 에러 처리 로직을 하나로 통합하는 과정을 다룹니다.
- **설계 원칙**
  - [Step 2. 에러 피드백 UX 설계](./step2.md)
  - [Step 3. 에러 처리 원칙 세우기](./step3.md)


- **구현 단계**
  - [Step 4. Client Side 렌더링 에러 처리](./step4.md)
  - [Step 5. Server Side 렌더링 에러 처리](./step5.md)
  - [Step 6. 이벤트 핸들러 시점 에러 처리](./step6.md)

---

## 문제 정의

동일한 형태의 에러 처리 로직이 반복되고 있습니다.

#### [Step 4. Client Side 렌더링 에러 처리](./step4.md)

```typescript jsx
export default function Page() {
  return (
    <ErrorBoundary FallbackComponent={ProductFallback}>
      <ProductList/>
    </ErrorBoundary>
  );
}

function ProductFallback({error}: FallbackProps) {
  if(error instanceof ApiResponseError && error.response.status === 500) {
    return <ErrorPageTemplate title="..." content="..." />;
  }
}
```
상품 리스트 API를 호출하다가 500 오류가 발생할 수 있기 때문에 위와 같이 구현했지만, 500 오류는 다른 API에서도 동일하게 발생합니다.

이 경우 UserFallback, NoticeFallback 등의 코드가 추가될 때마다 500 에러 처리 로직이 매번 중복되어 작성됩니다.

#### [Step 5. Server Side 렌더링 에러 처리](./step5.md)

```typescript jsx
async function Page() {
  try {
    const response = await getProductListApi();
  } catch (error) {
    if(error instanceof ApiResponseError && error.response.status === 500) {
      return (
        <ErrorPageTemplate title="..." content="..."/>
      );
    } else {
      throw error; // error.tsx에서 기본 에러메시지 노출
    }
  }
}
```

서버 사이드도 마찬가지로 상품 리스트 페이지뿐만 아니라 다른 페이지에서도 500 에러가 발생할 수 있으므로, 이와 같은 코드를 수십 개의 페이지마다 동일하게 작성해야 합니다.

#### [Step 6. 이벤트 핸들러 시점 에러 처리](./step6.md)

```tsx
const onClick = async () => {
  try {
    // ...
  } catch (error) {
    if(error instanceof ApiResponseError && error.response.status === 500) {
      openModal({title: "서버 오류", content: "..."});
    }
  }
};
```

웹사이트에는 API를 호출하는 버튼이 수백 개 이상 존재합니다.

각 버튼마다 500 에러가 발생했을 때 모달을 띄우는 코드를 동일하게 작성해야 하는 번거로움이 있습니다.

## 중복을 해결하기 전 고려해야 할 사항

### 어떤 단위로 묶을 것인가?

단순히 코드가 똑같이 생겨서 문제인 것이 아닙니다.

진짜 문제는 **"이 코드들이 변경의 이유를 공유하는가?"** 하는 점입니다.

예를 들어, 500 에러 발생 시 안내 문구를 `"고객센터에 문의해주세요"`에서 `"잠시 후 다시 시도해주세요"`로 변경해야 한다고 가정해 봅시다.

만약 이 변경이 모든 페이지와 모든 버튼에 **동일하게 적용되어야 한다면**, 이 코드들은 **반드시 함께 변경되어야 합니다.** 즉, 논리적으로 하나의 코드여야 합니다.

지금처럼 수십 곳에 흩어져 있다면, 정책이 변경될 때마다 개발자는 수십 개의 파일을 찾아다니며 수정해야 하고, 그 과정에서 실수로 누락할 위험이 매우 큽니다.

따라서 **"함께 변경되는 코드"를 하나로 묶어 관리하는 것**이 중복 해결 시 고려해야 할 핵심 원칙입니다.

### Override 지원

무작정 공통화만 해버리면 **"이 페이지만 다르게 처리해주세요"** 라는 요구사항에 대응하기 어려워집니다.

따라서 중복을 제거하면서도, **필요한 시점에 전역 규칙을 Override 할 수 있는 구조**를 설계하는 것이 중요합니다.

## 목표 정리

### 적용 범위
1. Client Side 렌더링 시점 에러 처리 로직
2. Server Side 렌더링 시점 에러 처리 로직
3. 이벤트 핸들러 시점 에러 처리 로직

### 중복 코드 해결 범위
위 3개 범위마다 중복되는 코드가 아래 기준으로 해결되어야 합니다.

- **전역 처리 로직**: 모든 곳에 공통 적용 (예: 500 에러)
- **공통 처리 로직**: 특정 도메인이나 여러 곳에서 반복되는 경우 (예: 여러 게시판의 글쓰기 시 발생하는 유사한 오류들)

### 개별 처리 우선 실행
위 로직들보다 `개별 처리 로직`이 먼저 실행되어야 합니다.

결제가 특정 사유로 실패했다면 해당 사유에 맞는 메시지가 먼저 보여야 하며, 공통 로직이 우선 실행되어 이를 가리는 문제가 발생해서는 안 됩니다.

### Override 지원
100곳중 100곳에 404 에러메시지로 "대상이 삭제되었거나 존재하지 않습니다." 로 적용이 되어있는데,

딱 1곳만 "해당 게시물이 삭제되었거나 존재하지..." 로 바꿔달라고 요청이 오더라도 대응이 가능해야합니다.

### Sentry 지원
[Step 3. 에러 처리 원칙 세우기](./step3.md)에 따라 에러 객체에 관련 정보를 저장했으므로, 이 객체를 그대로 Sentry로 보낼 수 있어야 합니다.

즉, 전역 에러 처리 로직에서 에러 원본 객체에 접근할 수 있는 형태여야 합니다.

### 복잡성
위 요구사항들을 읽기 쉽고 수정하기 쉬운 코드로 구현해야 합니다.

---

## 해결 전략 비교

가장 대중적인 **Interceptor 패턴**과, **코드 분리**를 비교하여 최종 방식을 결정했습니다.

### 방법 1: Interceptor 패턴
https://axios-http.com/docs/interceptors

Axios 등의 라이브러리에서 제공하는 Interceptor를 사용하여, 응답을 받는 즉시 중앙에서 에러를 처리하는 방식입니다.

#### 치명적인 단점 1: Override 불가
Axios Interceptor는 컴포넌트 내부의 `catch` 블록보다 **먼저** 실행됩니다.

```typescript
// 1. 인터셉터가 먼저 실행됨
axios.interceptors.response.use(..., (error) => {
  if(error.status === 401) {
    // 이미 여기서 로직이 실행됨
  }
  return Promise.reject(error);
});

// 2. 컴포넌트 로직은 나중에 실행됨 (이미 늦음)
const onClick = async () => {
  try {
    await axios.post('...');
  } catch (error) {
    // 인터셉터 동작을 막거나 변경할 방법이 없음
  }
}
```

#### 치명적인 단점 2: React Hooks 사용 불가
또한, axios interceptor는 hooks가 아니라서 실행할 수 있는 기능에 문법적인 한계가 있습니다.

사용자가 버튼 눌렀는데 401에러 나면 모달 띄우고, 클릭하면 useRouter()로 soft navigation 해야하는데

이런걸 interceptor 단독으로 구현할 수 없습니다.

### 방법 2: 코드 분리 (채택)
에러 처리 로직을 함수(`handleClientSideError` 등)로 분리하고, 필요한 곳에서 **명시적으로 호출**하는 방식입니다.

```typescript
// 아래 try-catch 코드를 버튼 핸들러마다 작성합니다.
const onClick = async () => {
  try {
    await axios.post('...');
  } catch (error) {
    if ('여기에서만 발생하는 에러 / Override 하고싶은 에러') {
      // 1. 개별 처리
      return;
    }

    // 2. 공통 처리
    handleClientSideError(error);
  }
};

function handleClientSideError(error: unknown) {
  // 500 에러 처리
  // 401 에러 처리
  // 403 에러 처리
}
```

#### 장점
1. **실행 시점 제어:** `catch` 블록 내부에서 호출하므로, 개발자가 원할 때만 호출하거나 호출 전에 다른 로직을 실행할 수 있습니다.
2. **Hooks 연동:** 모든 React 기능을 사용할 수 있습니다.

#### 단점
1.  모든 `try-catch` 블록마다 함수를 호출하는 코드(Boilerplate)를 작성해야 합니다.
2.  함수 이름만 봐서는 내부 동작을 알 수 없어 구현을 확인해야 합니다.

## 최종 선택 및 검증

**목표를 100% 만족**할 수 있는 다른 해결 방법이 존재하지 않았습니다.

이 방식이 앞서 정의한 목표를 어떻게 달성하는지 확인해 봅시다.

### 중복 코드 해결 (100% 달성)
- **Server Side:** `handleServerSideError()` 함수 하나로 통합
- **Event Handler:** `handleClientSideError()` 함수 하나로 통합
- **Client Side:** `error.tsx` 안에서 공통처리

수백 곳에 흩어져 있던 로직이 단 2~3개의 모듈로 모이게 되며, 이는 **"미래에 함께 변경되는 단위"**와 정확히 일치합니다.

### Override 및 계층화 지원 (100% 달성)
함수 호출 순서를 조절하거나, 더 구체적인 핸들러(`handleBoardClientSideError`)를 만듦으로써 대응이 가능합니다.

```typescript
// 계층화 예시: 전역 < 도메인(공통) < 개별
function handleBoardClientSideError(error) {
  if ('Board 에서만 발생하는 에러인 경우') {
    // 도메인 공통 처리
  } else {
    // 전역 처리 위임
    handleClientSideError(error);
  }
}
```

### Sentry
저 함수들마다 원본 에러객체를 매개변수로 받고있습니다.

중간에, 에러를 title / content로 변환하는 레이어 계층을 둔다거나 그러지 않습니다.

따라서, Sentry로 에러 원본 객체를 그대로 보낼 수 있습니다.

### 복잡성

봐야하는 모듈의 갯수는 에러처리 종류별로 딱 1개입니다.

코드 실행 흐름도 단순합니다.

여러겹으로 추상화 한 레이어가 없기 때문에,

- 처음 입사하신 분은 try 코드 > catch 코드 > handleClientSideError() 내부구현 순으로 보고 나서 머릿속으로 조립 해서 이해한 다음
- 2회차 부터는 아 저기 함수에 공통 처리 로직으로 뭔가가 들어있다 (5xx, 400, 401, 403등 정확한 목록은 기억안남) 상태가 될것입니다.

## 성과

1. 에러 객체에 상황 정보(request, response, level 등)를 담아 에러 객체만으로 문제 상황을 쉽게 파악할 수 있습니다.
2. 모든 에러 발생 시점에서 누락 없이 경중을 구분하여 사용자에게 구체적인 안내를 제공합니다.
3. 사용자는 에러 상황에서도 정상적인 서비스 흐름으로 안전하게 복귀할 수 있습니다.
4. 에러가 발생해도 해당 영역만 격리되어 나머지 기능은 정상적으로 사용할 수 있습니다.
5. 중복 코드 없이 3개의 모듈로 깔끔하게 통합되었습니다.