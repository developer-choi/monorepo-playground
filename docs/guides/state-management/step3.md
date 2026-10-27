# 이 상태, 직접 관리해야 할까요?

## 목차
1. [이 값, state로 만들어야 할까요?](./step1.md)
2. [이 상태를 어느 컴포넌트가 소유해야 할까요?](./step2.md)
3. **이 상태, 직접 관리해야 할까요?** ← 현재 문서

---

```jsx
function TodoListPage() {
  const [todos, setTodos] = useState([]);   // 서버에서 받아 와야 하는 목록
  const [filter, setFilter] = useState('all');

  // 이하 useEffect에서 API를 호출해 setTodos로 todos를 채우는 코드는 생략합니다
}
```

`todos`를 이렇게 페이지의 로컬 상태에 두면 생기는 문제가 있습니다. 다른 페이지로 가면 페이지 컴포넌트와 함께 state도 사라져서, 돌아왔을 때 **데이터를 처음부터 다시 받아 와야 합니다.** 그래서 받아 온 데이터를 캐시해 둘 곳이 필요해집니다.

## 서버에서 받아 오는 상태: TanStack Query

### store에 직접 저장하면

store(여기서는 zustand)에 저장해 두면 이렇게 구현할 수 있습니다.

```jsx
const useTodoStore = create((set, get) => ({
  todos: null,
  dataUpdatedAt: 0,
  isLoading: false,
  error: null,

  fetchTodos: async () => {
    if (get().todos || get().isLoading) return;   // 이미 받아 뒀거나 받는 중이면 다시 요청하지 않습니다
    set({ isLoading: true, error: null });

    try {
      const res = await fetch('/api/todos');
      if (!res.ok) throw new Error('목록을 불러오지 못했습니다');
      set({ todos: await res.json(), dataUpdatedAt: Date.now() });
    } catch (error) {
      set({ error });
    } finally {
      set({ isLoading: false });
    }
  },
}));

function TodoListPage() {
  const { todos, isLoading, error, fetchTodos } = useTodoStore();

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);
}
```

이러면 어떤 문제가 있을까요?

지금은 `todos` 하나지만, 상품 목록이나 게시글 목록처럼 API로 받아 와 캐시할 데이터가 100종류로 늘면 store에 저장할 데이터도 100종류가 됩니다.

그러면 로딩·에러 상태와 `dataUpdatedAt`처럼 데이터마다 따라붙는 상태와 공통 로직을, **보일러플레이트 코드로 계속 작성하고 관리해야 합니다.**

`dataUpdatedAt`도 저장만 해서 끝나지 않습니다. 받은 시각을 기록했으면 **얼마나 지나면 낡았다고(stale) 보고 다시 받을지**도 직접 정해야 합니다.

### TanStack Query에 맡기면

위에서 직접 구현하던 일은 TanStack Query가 대부분 맡아 줍니다.

- **로딩·에러 상태**: 데이터와 함께 `useQuery` 훅이 돌려줍니다. 데이터 종류마다 따로 만들 필요가 없습니다.
- **같은 요청 합치기**: 같은 `queryKey`(데이터를 구분하는 키)를 쓰는 컴포넌트가 여럿이어도 요청은 하나로 합쳐집니다.
- **다시 받을 시점**: TanStack Query가 받은 시각과 `staleTime`으로 낡았는지 판단해, 낡은 데이터만 뒤에서 다시 받습니다. 그동안 화면에는 있던 데이터가 그대로 보입니다.

데이터가 100종류가 돼도 `queryKey`와 받아 오는 함수(`queryFn`)만 다르게 주면 됩니다.

## 열고 닫는 상태: overlay-kit

직접 구현해야 할 일이 쌓이는 건 모달도 마찬가지입니다. 모달 하나를 띄우려면 보통 열림 여부를 담는 state 하나로 시작합니다.

```jsx
const [isOpen, setIsOpen] = useState(false);
```

여기에 요구사항이 붙기 시작합니다.

- **앱 어디서든 열고 닫아야 한다면**, 열림 여부를 앱 전역에서 공유해야 합니다(예: store).
- **다른 화면 위에 겹쳐 떠야 한다면**, 모달을 앱 최상단에 그려야 합니다(예: portal).

모달 종류가 늘면 이 작업도 모달마다 반복됩니다.

overlay-kit을 쓰면 열고 싶은 곳에서 `overlay.open(...)`을 호출하며 띄울 모달을 넘기기만 하면 됩니다. 열림 여부는 라이브러리가 들고 있고, 모달은 앱 최상단에 둔 `OverlayProvider` 자리에 그려집니다.

## 맡긴 뒤에도 해야 하는 일

라이브러리에 맡기면 직접 구현하던 코드가 사라지는 대신, **라이브러리 철학을 이해하고 써야 합니다.** 만든 사람이 어떤 의도로 기본값을 정했는지 모르고 쓰면, 라이브러리가 내 의도와 다르게 움직입니다.

TanStack Query의 `staleTime`과 `gcTime`이 그런 예입니다.

- **`staleTime`**: 받아 온 데이터를 얼마 동안 신선하다고 볼지 정합니다. 기본값은 0이라 받자마자 낡은 것으로 칩니다.
- **`gcTime`**: 어느 컴포넌트도 쓰지 않는 데이터를 캐시에 얼마나 남겨 둘지 정합니다. 기본값은 5분입니다.

`staleTime`이 0이면 모든 데이터가 받자마자 낡은 것이 되어, 아래 때마다 다시 받습니다.

- 컴포넌트가 새로 마운트될 때
- 브라우저 창(탭)에 다시 포커스가 갈 때
- 네트워크가 다시 연결될 때

자주 바뀌는 데이터라면 의도한 동작입니다. 하지만 거의 안 바뀌는 데이터라면, 이 기본값을 모르는 사이 **같은 요청이 계속 나갑니다.**

두 값을 헷갈려도 같은 일이 생깁니다. 요청을 줄이려고 `gcTime`을 늘려도, `staleTime`이 0이면 다시 마운트될 때 캐시를 먼저 보여 준 뒤 뒤에서 또 받습니다. `gcTime`은 캐시를 언제 지울지를 정할 뿐, 언제 다시 받을지는 `staleTime`이 정하기 때문입니다.

TanStack Query 공식문서의 Important Defaults 페이지도 이 기본값들이 처음 쓰는 사람을 당황하게 하거나, 모르면 배우고 디버깅하기 어렵게 만들 수 있다고 직접 적어 둡니다.

## 결론

범용 store로 직접 구현할 수도 있습니다. 하지만 그 상태를 전담하는 라이브러리가 이미 있다면, 직접 구현하고 관리하는 데 들일 시간을 그 라이브러리를 배우는 데 쓰는 쪽이 대체로 낫습니다.

그리고 맡긴 뒤에도 라이브러리 철학을 이해하는 일은 여전히 해야 합니다.

## References: [Overview | TanStack Query](https://tanstack.com/query/latest/docs/framework/react/overview)

> While most traditional state management libraries are great for working with client state, they are **not so great at working with async or server state**. This is because **server state is totally different**. For starters, server state:
>
> - Is persisted remotely in a location you may not control or own
> - Implies shared ownership and can be changed by other people without your knowledge
> - Can potentially become "out of date" in your applications if you're not careful

> - Deduping multiple requests for the same data into a single request
> - Updating "out of date" data in the background
> - Knowing when data is "out of date"

## References: [Important Defaults | TanStack Query](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults)

> Out of the box, TanStack Query is configured with **aggressive but sane** defaults. **Sometimes these defaults can catch new users off guard or make learning/debugging difficult if they are unknown by the user.**

> - Stale queries are refetched automatically in the background when:
>   - New instances of the query mount
>   - The window is refocused
>   - The network is reconnected

> - By default, "inactive" queries are garbage collected after **5 minutes**.

## References: [Caching Examples | TanStack Query](https://tanstack.com/query/latest/docs/framework/react/guides/caching)

> - The data will be marked as stale after the configured `staleTime` (defaults to `0`, or immediately).

> - Before the cache timeout (gcTime) has completed, another instance of `useQuery({ queryKey: ['todos'], queryFn: fetchTodos })` mounts. The query immediately returns the available cached data while the `fetchTodos` function is being run in the background. When it completes successfully, it will populate the cache with fresh data.

## References: [overlay-kit README](https://github.com/toss/overlay-kit)

> 1. Complexity of State Management
>    - Had to manage overlay state directly using useState or global state.
>    - Code became complex and less readable as state management mixed with UI logic.
> 2. Repetitive Event Handling
>    - Had to repeatedly write event handling code for opening, closing, and returning results.
>    - This led to code duplication and degraded development experience.

> You can easily open and close overlays using `overlay.open`.
