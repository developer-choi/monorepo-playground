# Step 3. 에러 처리 원칙 세우기

## 목차
1. [에러 처리는 왜 필요한가?](./step1.md)
2. [에러 피드백 UX 설계](./step2.md)
3. **에러 처리 원칙 세우기** ← 현재 문서
4. [Client Side 렌더링 에러 처리](./step4.md)
5. [Server Side 렌더링 에러 처리](./step5.md)
6. [이벤트 핸들러 시점 에러 처리](./step6.md)
7. [전역/공통/개별 에러 처리](./step7.md)

---

## 문제 정의

원칙이 없을 때, 다음 2가지 문제에 시달립니다.

1. 기준 없이 try-catch를 남발하여, 에러가 상위로 전파되지 않아 원인을 찾을 수 없게 만듦.
2. 어디서 throw 하고 어디서 catch 하는지 기준이 불분명하여 코드의 복잡도가 증가함.

이러한 문제를 해결하기 위해, 검증된 자료들을 참고하여 원칙을 정립했습니다.

### 참고 자료
- [StackOverflow: Best Practices for Exception Handling](https://stackoverflow.com/a/6852101)
- [Microsoft: Best Practices for Exceptions](https://learn.microsoft.com/en-us/dotnet/standard/exceptions/best-practices-for-exceptions)
- [Enterprise JavaScript Error Handling](https://www.slideshare.net/slideshow/enterprise-javascript-error-handling-presentation/630870)

---

## 원칙

### 1. 에러 객체에 속성 추가
> Provide more properties for an exception (in addition to the custom message string) only when there's a programmatic scenario where the additional information is useful.

"이것이 무슨 에러인가?"를 식별할 수 있는 속성을 추가하면 다양한 이점을 얻을 수 있습니다.

1. **원인 분석**: 에러 객체에 포함된 값만으로도 문제 상황을 파악할 수 있습니다.
2. **로깅**: Sentry 등의 모니터링 도구에 별도 컨텍스트를 추가하지 않아도, 에러 객체 자체가 충분한 단서가 됩니다.

### 2. 에러의 경중 구분
> "Distinguish fatal versus non-fatal errors"

모든 에러가 시스템 중단을 의미하지는 않습니다.

따라서, 에러 객체에 '우선순위(Level)' 속성을 추가하여 상황에 맞게 처리하도록 설계했습니다.

```typescript
if(error.level === 'fatal') {
  // ...
}
```

### 3. 영향 범위의 최소화
> "Errors should have minimal consequences"

예시: 특정 영역의 에러로 인해 화면 전체가 튕기는(Crash) 일이 없어야 합니다. 문제가 발생한 영역만 격리되어야 나머지 기능을 정상적으로 사용할 수 있습니다.

Next.js에서 별도의 에러 처리를 하지 않을 경우, 화면 전체에 다음과 같은 메시지가 노출되는 문제가 있습니다.

> Application error: a client-side exception has occurred (see the browser console for more information)

### 4. 에러 발생 위치 원칙
부제: 에러는 어디서 던져야 하는가?

```typescript
function grandParentFunction() {
  // Q. 이 함수에서 에러를 던져야 하는가?

  parentFunction();
}

function parentFunction() {
  // Q. 아니면 여기서 에러를 던져야 하는가?

  childrenFunction();
}

function childrenFunction() {
  // Q. 아니면 여기서?
}
```

1. 에러가 발생한 곳에서 에러를 던져야 합니다. 그렇지 않으면, 스택 트레이스에서 원인을 찾을 수 없습니다.
2. 에러를 다시 잡아서 던지는 경우는, 좀 더 구체적인 에러로 던질 때 외에는 하지 않습니다.

```typescript
async function getProductListApi(request: ProductApiRequest) {
   try {
     const response = await axios.get('...');
     return response;
   } catch (error) {
     if(!error.isAxiosError) {
       throw error;
     }
      
     // 이런 코드는 작성할 수 있지만,
     if(error.status === 404) {
       throw new NotFoundError(error);
     } else {
       throw new ApiResponseError(error, request);
     }
   }
}

async function getProductDetailApi() {
  try {
    const response = await axios.get('...');
    return response;
  } catch (error) {
    // 이런 코드는 불필요한 코드입니다.
    throw error;
  }
}
```

### 5. 어설프게 catch 하지 않습니다.
> - For code that can potentially generate an exception, and when your app can recover from that exception, use try/catch blocks around the code.
> - When your code can't recover from an exception, don't catch that exception. Enable methods further up the call stack to recover if possible.

```typescript
try {
  JSON.parse(input);
} catch (error) {
  console.error(error);
}
```

이것은 최악의 에러처리 방식입니다.

1. **사용자**: 화면에서 아무런 피드백을 받을 수 없어 "어? 왜 안 되지?" 하며 문제 상황을 인지하는 데 시간을 허비하게 됩니다.
2. **개발자**: 제보를 받아도 로그가 남지 않아 원인을 추적할 단서를 찾을 수 없습니다.

이런 경우에는 JSON.parse(input);만 호출하는 것이 차라리 나은 선택입니다.

> 확실하게 처리할 수 없다면, 차라리 아무것도 하지 않는 편이 낫습니다.

1. **개발자**: 에러가 상위로 전파되어 Unhandled Error로 Sentry에 기록되므로 디버깅이 가능해집니다.
2. **사용자**: 관련 UI가 명확하게 Crash 되어 "아, 오류가 발생했구나"라고 즉시 인지할 수 있습니다.

### 6. 에러처리를 누락하지 않아야 합니다.
에러가 발생할 수 있는 모든 경우의 수를 찾아 대응해야 합니다.

Next.js 환경에서의 발생 가능한 시점은 다음과 같습니다.

1. **렌더링 시점**
   - Server Side Rendering 시점 (예: 초기 페이지 진입 시)
   - Client Side Rendering 시점 (예: '더 보기' 버튼 클릭 후 리스트 렌더링 시)

2. **사용자 상호작용 시점**
   - 대부분의 이벤트 핸들러 (예: 제출 버튼 클릭 후 API 호출 중 에러 발생)

각 경우의 수별 구체적인 처리 방법은 다음 단계들에서 다룹니다.

---

## 결과물

```typescript jsx
type ErrorLevel = 'fatal' | 'error' | 'warning';

abstract class BaseError extends Error {
   readonly level: ErrorLevel;

   protected constructor(message: string, level: ErrorLevel) {
      super(message);
      this.level = level;
   }
}

class ApiResponseError extends BaseError {
   readonly request: BaseApiRequest;
   readonly response: BaseApiResponse;

   constructor(request: BaseApiRequest, response: BaseApiResponse) {
      super(`${request?.method ?? 'GET'} ${response.status} ${response.url}`, 'warning');
      this.request = request;
      this.response = response;
   }
}

function Page() {
   const onClick = useCallback(() => {
      try {
         const response = fetch('https://api.backend.com/user')
      } catch (error) {
        if(error instanceof ApiResponseError) {
          // 오류모달 노출
        }
      }
   }, []);
   
   return (
     <button onClick={onClick}>제출하기</button>
   )
}
```

---

## 다음 단계

원칙을 세웠으니, 가장 먼저 사용자 눈에 띄는 화면부터 처리했습니다.

[Step 4. Client Side 렌더링 에러 처리](step4.md)