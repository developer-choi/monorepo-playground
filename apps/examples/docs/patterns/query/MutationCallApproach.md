# 변경 API 호출 — useMutation vs 직접 호출

변경(POST/PATCH/DELETE) API를 호출할 때 두 가지 선택지가 있다.
`useMutation`으로 감싸서 호출하거나, API 함수를 직접 호출한다.

## 선택지 A. useMutation으로 감싼다

`useMutation`이 제공하는 RQ 기능을 실제로 활용할 때 적합하다.

- API 호출 결과(에러)를 컴포넌트에 표시한 뒤, 사용자의 다음 액션 시점에 리셋해야 한다 → `mutation.reset()`
- `isPending`을 컴포넌트 트리 여러 곳에서 공유해야 한다

### 예: mutation.reset() 활용

API 에러를 화면에 띄운 뒤 사용자가 입력을 고치면 에러를 비워야 하는 흐름이다.

```tsx
const mutation = useMutation({
  mutationFn: createPost,
});

return (
  <>
    <PostForm onSubmit={(data) => mutation.mutateAsync(data)} onChange={() => mutation.reset()} />
    {mutation.error && <ErrorBanner message={mutation.error.message} />}
  </>
);
```

## 선택지 B. API 함수를 직접 호출

`useMutation`이 제공하는 기능을 활용하지 않는다면 감싸지 않고 직접 호출한다.

- `mutateAsync(...)`만 호출하고 `isPending`·`mutation.reset()` 등을 활용하지 않는다
- 호출 중복 방지를 버튼 disabled / 폼 제출 락 같은 로컬 상태로 처리할 수 있다
- 폼 라이브러리(예: React Hook Form)가 제출 상태·에러를 이미 관리한다 → `mutation.reset()` 등을 별도로 쓸 일은 없다

### 예: 직접 호출

```tsx
async function handleSubmit(data: PostInput) {
  await createPost(data);
  router.push('/posts');
}
```

`useMutation(createPost)`로 감싸고 `mutateAsync`만 호출했을 때와 동작 차이가 없다면 B가 적합하다.

## 함정

- `useMutation`은 호출 중에 또 호출되는 케이스(중복 제출)를 자동으로 막아주지 않는다. A를 고르더라도 직접 `isPending` 가드가 필요하며, 버튼 disabled만으로는 폼의 Enter 제출 등을 막지 못한다.
- 폼 라이브러리(예: React Hook Form)가 제출 상태·에러를 이미 관리한다면 `mutation.reset()`을 별도로 쓸 일은 거의 없다.
