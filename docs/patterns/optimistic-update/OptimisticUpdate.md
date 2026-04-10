# 로컬 state 낙관적 업데이트

useState로 즉시 UI 반영, mutateAsync 실패 시 롤백. TanStack Query의 optimistic update API(onMutate/onError)를 쓰지 않는다 — 단일 boolean 상태에는 과잉.

에러 처리는 handleClientSideError에 위임한다. 에러 처리 패턴은 [ErrorHandling](../rendering/ErrorHandling.md) 참고.

```tsx
function FavoriteButton({code, initialIsFavorite}: {code: string; initialIsFavorite: boolean}) {
  const handleClientSideError = useHandleClientSideError();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const {mutateAsync, isPending} = useMutation({
    mutationFn: (shouldAdd: boolean) => (shouldAdd ? addFavoriteApi(code) : removeFavoriteApi(code)),
  });

  async function handleClick() {
    if (isPending) return;
    const shouldAdd = !isFavorite;
    setIsFavorite(shouldAdd); // 즉시 반영

    try {
      await mutateAsync(shouldAdd);
    } catch (error) {
      setIsFavorite((prev) => !prev); // 롤백
      handleClientSideError(error);
    }
  }

  return (
    <Button onClick={handleClick} disabled={isPending}>
      {isFavorite ? '♥' : '♡'}
    </Button>
  );
}
```
