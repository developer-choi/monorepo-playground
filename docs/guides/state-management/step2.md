# 이 상태를 어느 컴포넌트가 소유해야 할까요?

## 목차
1. [이 값, state로 만들어야 할까요?](./step1.md)
2. **이 상태를 어느 컴포넌트가 소유해야 할까요?** ← 현재 문서

---

지난 글에서 불필요한 state를 걷어내고 이런 코드가 남았습니다.

```jsx
function TodoListPage({ title }) {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'done'
  const [status, setStatus] = useState('idle');
  const [menu, setMenu] = useState(null);
  const timerId = useRef(null);

  // 이하 이벤트 핸들러와 JSX는 생략합니다
}
```

살아남은 상태에는 다음 질문이 붙습니다. **이 상태를 누가 들고 있어야 할까요?**

후보는 다음과 같습니다.

1. **필터 폼 컴포넌트**: 어느 버튼이 눌려 있는지 표시하려면 필요해요.
2. **리스트 컴포넌트**: 필터 데이터를 읽어야 리스트 API를 호출할 수 있어요.
3. **페이지 컴포넌트**: 위 1, 2번의 부모라 양쪽에 내려줄 수 있어요.
4. **Context 또는 전역 store**: 트리 어디에 있든 꺼내 쓸 수 있어요.
5. **URL 쿼리스트링**: 지금 보고 있는 화면을 다른 사람에게 링크로 공유할 수 있게 돼요.

이 필터 데이터를 예시로, 상태는 어느 컴포넌트가 소유해야 하는지를 생각해봤습니다.

## 이 상태가 어디까지 공유돼야 할까요?

저장 위치는 네 단계로 나뉩니다.

| 단계 | 상태가 있는 곳                | 그 상태를 읽을 수 있는 범위   |
|---|-------------------------|--------------------|
| 1단계 | 그 컴포넌트 안 (`useState`)   | 컴포넌트 자신            |
| 2단계 | 공통 부모 컴포넌트 (`useState`) | 그 부모 아래의 자식들       |
| 3단계 | Context나 외부 store       | 앱 안의 모든 컴포넌트       |
| 4단계 | 주소창 (URL)               | 새로 연 화면, 링크를 받은 사람 |

고르는 기준은 하나입니다. **이 상태를 누가 읽어야 하는가?**

그리고 **가장 낮은 단계에서 시작합니다.** 단계를 올리면 두 가지가 따라오기 때문입니다.

1. **상태를 바꿀 수 있는 자리가 늘어납니다.**
2. **상태의 수명이 길어집니다.**

둘 다 영향 범위가 넓어진다는 말입니다. 코드를 파악하기 어려워지고, 그만큼 버그가 생길 자리도 늘어납니다.

그래서 순서는 **가장 낮은 단계에서 시작해, 올려야 할 이유가 실제로 생겼을 때만 한 단계씩**입니다.

그러므로 필터 상태를 1단계에 놓고 한 단계씩 올려가면서, 어느 단계가 가장 알맞은지 살펴보겠습니다.

## 1단계: 컴포넌트 안 (useState)

필터 버튼은 세 개가 한 묶음이고, 지금 어느 것이 눌려 있는지를 표시해야 합니다. 그러려면 사용자가 무엇을 골랐는지 기억하고 있어야 하니 상태가 필요합니다.

일단 이 상태를 버튼 컴포넌트 안에 둬 보겠습니다.

```jsx
function FilterButtons() {
  const [filter, setFilter] = useState('all');

  return (
    <div>
      <button onClick={() => setFilter('all')} aria-pressed={filter === 'all'}>전체</button>
      <button onClick={() => setFilter('active')} aria-pressed={filter === 'active'}>남은 것</button>
      <button onClick={() => setFilter('done')} aria-pressed={filter === 'done'}>끝난 것</button>
    </div>
  );
}
```

여기까지는 아무 문제가 없습니다. `filter`를 읽는 것도 바꾸는 것도 이 컴포넌트뿐이고, 어느 버튼이 눌렸는지도 제대로 표시됩니다.

여기서 **요구사항이 하나 추가되어 필터링된 리스트도 같이 보여줘야 한다면,** 대응이 불가능해집니다.

```jsx
function TodoListPage() {
  return (
    <>
      <FilterButtons />   {/* filter가 이 안에 갇혀 있습니다 */}
      <TodoList />        {/* filter를 읽어야 하는데 읽을 방법이 없습니다 */}
    </>
  );
}
```

- ✅ **언제 상태를 컴포넌트 안에 두면 좋을까요?** 그 상태를 읽고 바꾸는 곳이 그 컴포넌트 **하나뿐일 때**입니다.
- ❌ **언제 컴포넌트 안에 두면 안 좋을까요?** 그 상태를 읽고 바꾸는 곳이 그 컴포넌트 말고 **더 있을 때**입니다.

## 2단계: 부모가 들고 있기

두 컴포넌트가 같은 상태를 봐야 하니, 상태를 **둘의 가장 가까운 공통 부모로 옮깁니다.**

```jsx
function TodoListPage() {
  const [filter, setFilter] = useState('all');

  return (
    <>
      <FilterButtons filter={filter} onChange={setFilter} />
      <TodoList filter={filter} />
    </>
  );
}

function FilterButtons({ filter, onChange }) {
  return (
    <div>
      <button onClick={() => onChange('all')} aria-pressed={filter === 'all'}>전체</button>
      {/* 나머지 버튼은 생략합니다 */}
    </div>
  );
}
```

여기서 **요구사항이 또 추가되어 필터에 걸리는 할 일이 없을 때 "필터 해제하기" 버튼을 띄워야 한다면,** props를 전달하는 구조가 한 단계 더 깊어집니다.

```jsx
function TodoListPage() {
  const [filter, setFilter] = useState('all');

  return (
    <>
      <FilterButtons filter={filter} onChange={setFilter} />
      <TodoList filter={filter} onFilterChange={setFilter} />
    </>
  );
}

function TodoList({ filter, onFilterChange }) {
  const visibleTodos = todos.filter((todo) => matchesFilter(todo, filter));

  if (visibleTodos.length === 0) {
    return <EmptyState onFilterChange={onFilterChange} />;
  }

  // 이하 목록 렌더링은 생략합니다
}

function EmptyState({ onFilterChange }) {
  return (
    <div>
      <p>조건에 맞는 할 일이 없습니다.</p>
      <button onClick={() => onFilterChange('all')}>필터 해제하기</button>
    </div>
  );
}
```

상태를 쓰는 곳이 하나 늘 때마다 상태는 그것들을 모두 감싸는 위쪽으로 올라가고, 전달 구조는 그만큼 깊어집니다. 네 단계, 다섯 단계 아래까지 내려보내야 한다면 중간에 낀 컴포넌트들은 자기와 상관없는 값을 받아서 아래로 넘기기만 합니다.

이것을 prop drilling이라고 부릅니다.

말로 하면 잘 와닿지 않으니 코드로 보겠습니다. 상태는 맨 위에 하나뿐이고, 그 아래는 전부 받아서 넘기기만 합니다.

```jsx
function App() {
  const [filter, setFilter] = useState('all');
  return <Layout filter={filter} onFilterChange={setFilter} />;
}

function Layout({ filter, onFilterChange }) {
  return <Main filter={filter} onFilterChange={onFilterChange} />;
}

function Main({ filter, onFilterChange }) {
  return <TodoListPage filter={filter} onFilterChange={onFilterChange} />;
}

function TodoListPage({ filter, onFilterChange }) {
  return <TodoList filter={filter} onFilterChange={onFilterChange} />;
}

function TodoList({ filter, onFilterChange }) {
  return <EmptyState onFilterChange={onFilterChange} />;   // 여기서야 씁니다
}
```

필터 하나 때문에 다섯 컴포넌트가 같은 props를 받고 있습니다. 그중 넷은 이 값을 쓰지도 않습니다.

- ✅ **언제 상태를 부모가 들고 있으면 좋을까요?** 그 상태를 읽고 바꾸는 컴포넌트가 **한 부모 아래에 모여 있고**, props를 그렇게 깊이 전달하지 않아도 될 때입니다.
- ❌ **언제 상태를 부모가 들고 있으면 안 좋을까요?** 위 코드처럼 **props를 깊은 곳까지 전달해야 할 때**입니다.

## 3단계: 앱 어디서나 (Context / 외부 store)

여기서 **요구사항이 또 추가되어 화면 맨 위 툴바에서도 필터를 바꿀 수 있어야 한다면,** 방금 본 prop drilling이 실제로 생깁니다.

툴바는 할 일 목록 화면 바깥에 있습니다. 그래서 둘의 공통 부모는 앱 맨 위까지 올라가고, 필터는 거기서부터 양쪽으로 각각 내려갑니다.

```jsx
function App() {
  const [filter, setFilter] = useState('all');

  return (
    <Layout>
      <Header filter={filter} onFilterChange={setFilter} />   {/* Header는 안 쓰고 Toolbar에 넘기기만 합니다 */}
      <TodoListPage filter={filter} onFilterChange={setFilter} />
    </Layout>
  );
}
```

여기서 필터를 트리 어디서든 꺼내 쓸 수 있게 하면 중간 컴포넌트가 받아서 넘길 일이 없어집니다. Context가 그 일을 합니다.

```jsx
const FilterContext = createContext(null);

function App() {
  const [filter, setFilter] = useState('all');

  return (
    <FilterContext value={{ filter, setFilter }}>
      <Layout>
        <Header />
        <TodoListPage />
      </Layout>
    </FilterContext>
  );
}

function Toolbar() {
  const { filter, setFilter } = useContext(FilterContext);   // 중간 컴포넌트를 거치지 않고 바로 읽습니다

  // 이하 JSX는 생략합니다
}
```

`Header`에서 `filter` props가 사라졌습니다. 상태가 필요한 컴포넌트가 직접 꺼내 쓰기 때문입니다.

### Context로 올리기 전에 시도해야 하는 것

공식문서는 상태를 Context로 올리기 전에 아래 2가지를 확인해보라고 제안하고있습니다.

#### 1. props로 계속 내려보내기

두 단계만 내려보내면 되는 상태도 Context로 올리면 props를 아예 안 써도 됩니다. 그렇게 올린 상태가 하나둘 늘면 이런 코드가 됩니다.

```jsx
function Toolbar() {
  const { filter, setFilter } = useContext(FilterContext);
  const { sort } = useContext(SortContext);
  const { view } = useContext(ViewContext);

  // 이하 JSX는 생략합니다
}
```

이 셋이 어디서 와서 누가 바꾸는지는 이 파일에 안 적혀 있습니다. `filter`를 따라가려면 `FilterContext`를 만든 곳을 찾아가야 하고, 누가 바꾸는지 알려면 `setFilter`를 꺼내 쓰는 컴포넌트를 앱 전체에서 찾아야 합니다.

props로 내려보내면 그 정보가 코드에 남습니다.

```jsx
function Header({ filter, onFilterChange }) {
  return <Toolbar filter={filter} onFilterChange={onFilterChange} />;
}
```

거치는 컴포넌트마다 props를 적어줘야 합니다. 대신 `filter`가 `Header`를 거쳐 `Toolbar`로 간다는 사실이 코드에 그대로 있습니다. 어느 컴포넌트가 어떤 상태를 쓰는지 따라가려면 트리를 위로 올라가면 됩니다.

#### 2. 컴포넌트를 떼어내 `children`으로 넘기기

안 쓰는 상태를 받아 넘기기만 하는 층이 여럿이라면, 대개 컴포넌트를 덜 나눈 것입니다. 방금 본 `Header`가 그렇습니다.

```jsx
function Header({ filter, onFilterChange }) {
  return <Toolbar filter={filter} onFilterChange={onFilterChange} />;   // 자기는 안 쓰고 넘기기만 합니다
}
```

`Header`가 `Toolbar`를 자기 안에서 만들고 있어서 `filter`를 알아야 합니다. `Toolbar`를 밖에서 만들어 넣어주면 그럴 필요가 없어집니다.

```jsx
function App() {
  const [filter, setFilter] = useState('all');

  return (
    <Layout>
      <Header>
        <Toolbar filter={filter} onFilterChange={setFilter} />   {/* 쓰는 컴포넌트에 바로 넘깁니다 */}
      </Header>
      <TodoListPage filter={filter} onFilterChange={setFilter} />
    </Layout>
  );
}

function Header({ children }) {
  return <header>{children}</header>;   // filter를 몰라도 됩니다
}
```

`Header`가 받아서 넘기기만 하던 층이 사라졌습니다. 이제 `filter`는 그것을 쓰는 `Toolbar`에게만 전달됩니다.

### 결론

이 둘로 안 될 때 Context를 씁니다.

- ✅ **언제 상태를 Context나 store에 두면 좋을까요?** 그 상태를 읽는 컴포넌트가 **트리 여기저기에 흩어져 있고**, 위 두 방법으로도 받아서 넘기기만 하는 층이 줄지 않을 때입니다.
- ❌ **언제 Context나 store에 두면 안 좋을까요?** 그 상태를 읽는 곳이 **한 부모 아래에 모여 있을 때**입니다.

이때 Context로 올리면 상태를 바꾸는 코드가 앱 어디에나 있을 수 있게 됩니다. 그래서 이 상태를 고칠 때는 화면 하나가 아니라 상태를 읽는 모든 컴포넌트를 봐야 합니다.

여기서 **요구사항이 또 추가되어 지금 보고 있는 화면을 링크로 보낼 수 있어야 한다면,** Context나 store로는 안 됩니다. 주소를 복사해 보내도 받은 사람은 전체 목록을 보게 되는데, 필터가 있는 곳이 URL이 아니기 때문입니다.

## 4단계: 앱 밖 (URL)

링크를 받은 사람이 같은 화면을 보려면 지금 어떤 필터를 보고 있는지가 앱 밖에 적혀 있어야 합니다. 그런 자리가 주소창입니다.

```jsx
function TodoListPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const filter = searchParams.get('filter') ?? 'all';   // 상태를 주소에서 읽습니다

  function changeFilter(next) {
    const params = new URLSearchParams(searchParams);
    params.set('filter', next);
    router.replace(`?${params}`);                       // 상태를 바꾸는 것 = 주소를 바꾸는 것
  }

  // 이하 JSX는 생략합니다
}
```

`useState`가 사라졌습니다. 상태는 이제 컴포넌트도 store도 아닌 **주소**에 있습니다.

`?filter=done`이 붙은 주소를 복사해 보내면 받은 사람도 끝난 것만 보게 됩니다. 새로고침해도 주소는 그대로니 필터도 그대로입니다.

- ✅ **언제 상태를 주소에 두면 좋을까요?** 그 상태를 **타인과 공유하거나 북마크할 수 있어야 할 때**입니다.
- ❌ **언제 주소에 두면 안 좋을까요?** 그 상태를 **타인과 공유할 필요가 없을 때**입니다.

## 결론

상태를 어디에 둘지는 그 상태를 누가 읽거나 수정하는지가 정합니다. 한 단계씩 올리면서 이렇게 물어보면 됩니다.

1. **이 상태를 읽는 곳이 이 컴포넌트 하나뿐인가?** → 그렇다면 `useState`로 그 안에 둡니다
2. **다른 컴포넌트도 읽어야 하는가?** → 가장 가까운 공통 부모로 올리고 props로 내려줍니다
3. **상태를 쓰지도 않는 컴포넌트가 받아서 넘기기만 하는 층이 쌓였는가?** → 이때 Context나 store를 씁니다. 그전에 컴포넌트를 떼어내 `children`으로 넘기는 방법이 있는지 먼저 봅니다
4. **링크로 보낼 수 있어야 하는가?** → 주소에 담습니다

## References: [Passing Data Deeply with Context](https://react.dev/learn/passing-data-deeply-with-context)

> The nearest common ancestor could be far removed from the components that need data, and lifting state up that high can lead to a situation called "prop drilling".

- 공통 부모가 멀어질수록 끌어올리기가 prop drilling이 된다는 말입니다.

> Just because you need to pass some props several levels deep doesn't mean you should put that information into context.

> Start by passing props. If your components are not trivial, it's not unusual to pass a dozen props down through a dozen components. It may feel like a slog, but it makes it very clear which components use which data!

> Extract components and pass JSX as children to them. If you pass some data through many layers of intermediate components that don't use that data (and only pass it further down), this often means that you forgot to extract some components along the way.

- 몇 단계 내려보낸다는 사실만으로는 Context로 갈 이유가 안 되고, 그냥 props로 내려보내는 것과 컴포넌트를 떼어내 `children`으로 넘기는 것을 먼저 시도하라는 뜻입니다.
