# 이 값, state로 만들어야 할까요?

## 목차
1. **이 값, state로 만들어야 할까요?** ← 현재 문서
2. [이 상태를 어느 컴포넌트가 소유해야 할까요?](./step2.md)

---

## state가 많으면 무엇이 손해인가

```jsx
function TodoListPage({ title }) {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'done'
  const [visibleTodos, setVisibleTodos] = useState([]);
  const [remainingCount, setRemainingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
  const [menuTodoId, setMenuTodoId] = useState(null);
  const [menuX, setMenuX] = useState(0);
  const [menuY, setMenuY] = useState(0);
  const [timerId, setTimerId] = useState(null);
  const [heading, setHeading] = useState(title);

  // 이하 이벤트 핸들러와 JSX는 생략합니다
}
```

TODO 리스트 화면을 만든다고 해봅시다.

이렇게 상태가 많아지면, 컴포넌트의 리렌더링 시나리오를 전부 파악하는 데 어려움이 생길 수 있어서 버그가 발생하기 쉬워집니다.

따라서, 이번 글에서는 올바른 상태관리를 위한 첫 번째 순서인, **불필요한 상태를 삭제하는 것**부터 다룹니다.

## 손해 1: 다른 값에서 계산되는 값

```jsx
// ❌ 거른 목록과 남은 개수를 state로 두고, effect로 맞춰줍니다
const [todos, setTodos] = useState([]);
const [filter, setFilter] = useState('all');
const [visibleTodos, setVisibleTodos] = useState([]);
const [remainingCount, setRemainingCount] = useState(0);

useEffect(() => {
  setVisibleTodos(todos.filter((todo) => matchesFilter(todo, filter)));
  setRemainingCount(todos.filter((todo) => !todo.done).length);
}, [todos, filter]);

// ✅ todos에서 그때그때 계산합니다
const [todos, setTodos] = useState([]);
const [filter, setFilter] = useState('all');
const visibleTodos = todos.filter((todo) => matchesFilter(todo, filter));
const remainingCount = todos.filter((todo) => !todo.done).length;
```

이렇게 바꾸면 어떤 차이가 날까요? **요구사항에 수정이 생겼을 때** 차이가 납니다.

```jsx
// ❌ todo나 filter에 기획수정이 발생하면, 여기도 같이 따라서 변경을 해줘야 하는데 누락되면 버그가 됩니다.
useEffect(() => {
  setVisibleTodos(todos.filter((todo) => matchesFilter(todo, filter)));
  setRemainingCount(todos.filter((todo) => !todo.done).length);
}, [todos, filter]);
```

그래서, 공식문서도 렌더 도중에 props나 기존 state에서 계산해낼 수 있는 정보라면 state에 넣지 말라고 못박습니다.

## 손해 2: 모순되는 조합이 만들어지는 값

```jsx
// ❌ 불러오기 상태를 불리언 셋으로 나눠 둡니다
const [isLoading, setIsLoading] = useState(false);
const [isError, setIsError] = useState(false);
const [isEmpty, setIsEmpty] = useState(false);

// ✅ 한 번에 하나만 될 수 있는 값 하나로 둡니다
const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'error' | 'success'
```

이렇게 바꾸면 어떤 차이가 날까요? **화면이 다른 상태로 넘어갈 때** 차이가 납니다.

```jsx
// ❌ false로 되돌리는 것을 하나 빠뜨리면 화면에 두 가지가 같이 뜹니다
async function loadTodos() {
  setIsLoading(true);
  setIsError(false);

  try {
    const data = await fetchTodos();
    setTodos(data);
    setIsEmpty(data.length === 0);
    setIsLoading(false);
  } catch {
    setIsError(true);
    // setIsLoading(false)를 빠뜨렸습니다
  }
}

return (
  <>
    {isLoading && <Spinner />}
    {isError && <p>불러오지 못했습니다</p>}
    {isEmpty && <p>할 일이 없습니다</p>}
  </>
);
```

스피너가 돌면서 그 아래에 "불러오지 못했습니다"가 같이 뜹니다.

원인은 세 값이 서로 아무 관계 없이 따로 정해진다는 데 있습니다. "로딩이면서 동시에 에러"라는 조합을 코드가 막아주지 않으니, 그 조합이 나오지 않게 하는 일이 전부 사람 몫으로 남습니다.

그래서 상태를 바꾸는 자리가 하나 늘어날 때마다 나머지 값도 빠짐없이 같이 맞춰줘야 합니다. 이걸 매번 정확히 해내는 건 사람이 하기 어려운 일입니다.

```jsx
// ✅ false로 되돌릴 코드 자체가 없습니다
async function loadTodos() {
  setStatus('loading');

  try {
    const data = await fetchTodos();
    setTodos(data);
    setStatus('success');
  } catch {
    setStatus('error');
  }
}

return (
  <>
    {status === 'loading' && <Spinner />}
    {status === 'error' && <p>불러오지 못했습니다</p>}
    {status === 'success' && todos.length === 0 && <p>할 일이 없습니다</p>}
  </>
);
```

`status`는 한 번에 하나의 값만 가질 수 있으니 새 값을 넣으면 이전 값은 알아서 사라집니다. **되돌리는 것을 빠뜨릴 수가 없습니다.**

"로딩이면서 동시에 에러"라는 상태를 표현할 방법 자체가 없어진 것입니다. 막는 코드를 짜는 대신 만들어지지 않게 하는 쪽입니다.

## 손해 3: props를 그대로 복사한 값

TODO 리스트가 여러 개고("오늘 할 일", "장보기") 부모가 그 이름을 내려주는 상황입니다.

```jsx
// ❌ 부모가 넘긴 값을 state 초기값으로 복사해 둡니다
function TodoListPage({ title }) {
  const [heading, setHeading] = useState(title);

  // 나머지 state와 핸들러는 생략합니다
  return <h2>{heading}</h2>;
}

// ✅ props를 그냥 씁니다
function TodoListPage({ title }) {
  // 나머지 state와 핸들러는 생략합니다
  return <h2>{title}</h2>;
}
```

이렇게 바꾸면 어떤 차이가 날까요?

**같은 화면에서 다른 목록을 보여줄 때** 차이가 납니다. 위쪽 코드는 부모가 `title`을 "장보기"로 바꿔 내려줘도 제목이 "오늘 할 일" 그대로입니다.

`useState`에 넘긴 값은 그 컴포넌트의 **첫 렌더에만** 초기값으로 쓰이고 그 뒤로는 무시되기 때문입니다.

이 증상이 치명적인 이유는 처음에는 멀쩡히 동작한다는 데 있습니다. 목록이 하나뿐일 때는 아무 문제가 없습니다.

그러다 목록을 바꾸는 기능이 붙으면, 아무도 건드리지 않은 이 컴포넌트가 **장보기 목록을 띄워놓고 제목만 "오늘 할 일"** 로 보여주기 시작합니다. 원인을 찾기 어려운 종류의 버그입니다.

따라서, props는 특별한 이유가 없는 한 그대로 쓰는 게 좋습니다.

## 손해 4: 항상 같이 바뀌는 값

할 일을 우클릭하면 그 자리에 작은 메뉴가 뜨는 화면입니다.

```jsx
// ❌ 메뉴 상태를 셋으로 나눠 둡니다
const [menuTodoId, setMenuTodoId] = useState(null);
const [menuX, setMenuX] = useState(0);
const [menuY, setMenuY] = useState(0);

function openMenu(event, todoId) {
  setMenuTodoId(todoId);
  setMenuX(event.clientX);
  setMenuY(event.clientY);
}

// ✅ 항상 같이 정해지므로 하나로 묶습니다
const [menu, setMenu] = useState(null); // { todoId, x, y }

function openMenu(event, todoId) {
  setMenu({ todoId, x: event.clientX, y: event.clientY });
}
```

이렇게 바꾸면 어떤 차이가 날까요? **메뉴를 닫을 때** 차이가 납니다.

```jsx
// ❌ 되돌릴 게 셋인데 하나를 빠뜨렸습니다
function closeMenu() {
  setMenuX(0);
  setMenuY(0);
  // setMenuTodoId(null)을 안 불렀습니다. 메뉴가 화면 왼쪽 맨 위에 그대로 떠 있습니다
}

// ✅ 되돌릴 것도 하나뿐입니다
function closeMenu() {
  setMenu(null);
}
```

메뉴가 열려 있다는 사실과 그 위치는 언제나 같이 정해지고 같이 사라집니다. 그런데 위쪽 코드는 그걸 세 군데에 나눠 적어놨습니다.

그러다 보니 열고 닫는 자리가 늘어날 때마다 셋을 빠짐없이 맞춰줘야 하는 문제가 생깁니다.

그래서 공식문서도 둘 이상의 state를 항상 동시에 갱신하고 있다면 하나로 합치는 것을 고려하라고 권합니다.

판단 기준은 "항상 같이 바뀌는가" 하나입니다. 가끔 따로 바뀐다면 묶지 않는 편이 낫습니다.

## 손해 5: 화면을 바꾸지 않는 값

할 일 제목을 고칠 때 타이핑이 멈추면 자동저장하도록 만든다고 해봅시다.

```jsx
// ❌ 타이머 id를 state에 담습니다
const [timerId, setTimerId] = useState(null);

function handleTitleChange(event) {
  clearTimeout(timerId);
  const id = setTimeout(() => save(event.target.value), 300);
  setTimerId(id);
}

// ✅ 기억만 해주는 그릇으로 옮깁니다
const timerId = useRef(null);

function handleTitleChange(event) {
  clearTimeout(timerId.current);
  timerId.current = setTimeout(() => save(event.target.value), 300);
}
```

이렇게 바꾸면 어떤 차이가 날까요?

**글자를 칠 때마다** 차이가 납니다. 위쪽 코드는 한 글자 칠 때마다 `setTimerId`가 불리고, 그때마다 컴포넌트가 통째로 다시 그려집니다.

그런데 타이머 id는 화면 어디에도 나오지 않습니다. **화면을 바꾸지 않는 값이 화면을 다시 그리게 하고 있는 것**입니다.

이런 목적의 데이터는 `useRef`에 저장하는 것이 좋습니다.

## 다 걷어내면 이렇게 남습니다

맨 처음 코드의 열두 개가 네 개가 됐습니다.

```jsx
function TodoListPage({ title }) {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('all');
  const [status, setStatus] = useState('idle');
  const [menu, setMenu] = useState(null);
  const timerId = useRef(null);

  const visibleTodos = todos.filter((todo) => matchesFilter(todo, filter));
  const remainingCount = todos.filter((todo) => !todo.done).length;

  // 이하 이벤트 핸들러와 JSX는 생략합니다
}
```

화면이 하는 일은 처음과 똑같습니다. 타이머 id는 ref로 자리를 옮겼고, 나머지는 **애초에 없어도 되는 것들**이었습니다.

## 결론

어떤 값을 `useState`에 저장해야 할지 궁금하다면, 다섯 가지를 확인해 보는 것이 좋습니다.

1. **다른 state나 props 등으로부터 계산할 수 있는 값인가?**
2. **boolean 상태값들이 실제로 불가능한 조합을 나타낼 수 있는가?**
3. **props를 복사했는가?**
4. **항상 같이 바뀌는 값이 따로 useState로 선언 되어있는가?**
5. **이 state값이 바뀌면 화면이 달라지는가?**

## References: [Reacting to Input with State](https://react.dev/learn/reacting-to-input-with-state)

> Simplicity is key: each piece of state is a "moving piece", and you want as few "moving pieces" as possible.
> More complexity leads to more bugs!

- state 하나하나를 "움직이는 부품"으로 보고 그 수를 줄이라는 뜻입니다. 상태가 많아질수록 버그가 생기기 쉬워진다는 도입부 이야기의 근거입니다.

같은 페이지의 폼 예제는 `isEmpty`·`isTyping`·`isSubmitting`·`isSuccess`·`isError`·`answer`·`error` 일곱 개로 시작해 `answer`·`error`·`status` 세 개로 끝납니다. 이 글에서 열두 개가 네 개가 된 것과 같은 정리입니다.

## References: [Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure)

> **Avoid redundant state.** If you can calculate some information from the component's props or its existing state variables during rendering, you should not put that information into that component's state.

- 손해 1의 근거입니다. `visibleTodos`·`remainingCount`를 state에서 뺀 이유가 여기 있습니다.

> **Avoid contradictions in state.** When the state is structured in a way that several pieces of state may contradict and "disagree" with each other, you leave room for mistakes.

- 손해 2의 근거입니다. 불리언 셋을 `status` 하나로 바꾼 이유입니다.

> This is why "mirroring" some prop in a state variable can lead to confusion.

- 손해 3의 근거입니다. `heading`을 없애고 `title`을 그대로 쓴 이유입니다.

> **Group related state.** If you always update two or more state variables at the same time, consider merging them into a single state variable.

- 손해 4의 근거입니다. 메뉴의 대상과 좌표 셋을 `menu` 하나로 묶은 이유입니다.

## References: [Referencing Values with Refs](https://react.dev/learn/referencing-values-with-refs)

> When a piece of information is used for rendering, keep it in state. When a piece of information is only needed by event handlers and changing it doesn't require a re-render, using a ref may be more efficient.

- 손해 5의 판단 기준입니다. "화면에 쓰이는가"로 state와 ref가 갈립니다.

> - Storing timeout IDs
> - Storing and manipulating DOM elements
> - Storing other objects that aren't necessary to calculate the JSX.

- ref에 담을 것의 예인데 타임아웃 id가 첫 줄에 있습니다. 이 글이 든 자동저장 타이머와 같은 예입니다.
