# Step 6. 이벤트 핸들러 시점 에러 처리

## 목차
1. [에러 처리는 왜 필요한가?](./step1.md)
2. [에러 피드백 UX 설계](./step2.md)
3. [에러 처리 원칙 세우기](./step3.md)
4. [Client Side 렌더링 에러 처리](./step4.md)
5. [Server Side 렌더링 에러 처리](./step5.md)
6. **이벤트 핸들러 시점 에러 처리** ← 현재 문서
7. [전역/공통/개별 에러 처리](./step7.md)

---

## 문제 정의
버튼 클릭과 같은 사용자 상호작용 중에 API 오류 등의 에러가 발생할 수 있습니다.

이때, [Step 2. 에러 피드백 UX 설계](./step2.md)에서 정의한 대로 사용자에게 상황에 맞는 적절한 안내를 제공해야 합니다.

## 해결 전략

이벤트 핸들러 내부의 에러를 잡을 수 있는 유일한 방법은 **try-catch** 구문입니다.

기술적인 방법은 이미 정해져 있으므로, 기획 의도에 맞춰 어떤 UI로 피드백을 줄 것인지만 선택하면 됩니다.

- **모달**: 중요한 에러나 사용자 확인이 필수적인 경우
- **토스트**: 흐름을 방해하지 않는 가벼운 알림이 필요한 경우
- **인풋 메시지**: 특정 입력 필드의 오류를 알릴 경우

## 구현 방법

### 기본 구조

```typescript jsx
function Page() {
  const onClick = async () => {
    try {
      const response = await postProductApi(formData);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        openModal({
          title: '권한 없음',
          content: '상품 등록 권한이 없습니다. 관리자에게 문의하세요.'
        });
      } else {
        openModal({
          title: '오류 발생',
          content: '잠시 후 다시 시도해 주세요. 문제가 지속되면 고객센터에 문의하세요.'
        });
      }
    }
  };
  
  return (
    <button onClick={onClick}>상품 등록</button>
  );
}
```

하지만, 500 에러처럼, API마다 공통적으로 발생할 수 있는 오류가 존재합니다.

그래서 저런 코드를 이벤트 핸들러 마다 작성해야 하는 중복 코드 문제가 발생합니다.

이것은 [Step 7. 전역/공통/개별 에러 처리](step7.md)에서 다룹니다.

---

## 관련 팁: 버튼 로딩 상태 처리

이벤트 핸들러에서 API를 호출할 때, 에러 처리와 함께 고려해야 할 것이 **버튼의 로딩 상태**입니다.

API 호출 중에 버튼이 활성 상태로 남아 있으면, 사용자가 중복 클릭할 수 있습니다. 그래서 `useMutation`의 `isPending`을 버튼의 loading props에 전달합니다.

```typescript jsx
function Page() {
  const { mutateAsync, isPending } = useMutation(/* ... */);

  const onClick = async () => {
    try {
      await mutateAsync(formData);
    } catch (error) {
      // 에러 처리
    }
  };

  return (
    <Button loading={isPending} onClick={onClick}>상품 등록</Button>
  );
}
```

그런데, API 성공 후 **페이지 이동**이나 **모달 닫힘**이 이어지는 경우에는 `isPending`만으로 부족합니다.

`isPending`은 API 응답을 받는 순간 `false`로 바뀌지만, 페이지 이동이나 모달이 닫히기까지는 짧은 시간이 걸립니다. 그 사이에 로딩이 풀리면서 버튼이 다시 활성화되는 현상이 발생합니다.

이를 해결하기 위해, 컴포넌트가 언마운트될 때까지 로딩을 유지하도록 `isSuccess`를 함께 전달합니다.

```typescript jsx
function Modal() {
  const { mutateAsync, isPending, isSuccess } = useMutation(/* ... */);

  const onConfirm = async () => {
    try {
      await mutateAsync(formData);
      closeModal();
    } catch (error) {
      // 에러 처리
    }
  };

  return (
    <Button loading={isPending || isSuccess} onClick={onConfirm}>확인</Button>
  );
}
```

- `isPending`: API 호출 중 → 로딩
- `isSuccess`: API 성공 후 ~ 컴포넌트 언마운트 전 → 로딩 유지

---

## 다음 단계

모든 곳에서 에러를 잡았지만, 코드가 중복되고 있습니다. 이걸 어떻게 깔끔하게 정리할까요?

[Step 7. 전역/공통/개별 에러 처리](step7.md)