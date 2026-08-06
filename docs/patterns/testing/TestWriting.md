# 테스트 코드 작성 패턴

## 테스트 구조

### 함수 테스트

```typescript
describe('clamp()', () => {
  describe('General cases', () => {
    it('범위 안의 값은 그대로 반환해야 한다', () => {
      expect(clamp(5, 1, 10)).toBe(5);
    });
  });

  describe('Boundary cases', () => {
    it('하한·상한값은 그대로 반환해야 한다', () => {
      expect(clamp(1, 1, 10)).toBe(1);
      expect(clamp(10, 1, 10)).toBe(10);
    });

    it('범위를 벗어나면 가까운 경계로 보정해야 한다', () => {
      expect(clamp(-1, 1, 10)).toBe(1);
      expect(clamp(11, 1, 10)).toBe(10);
    });
  });

  describe('Edge cases', () => {
    it('NaN을 넣으면 에러를 던져야 한다', () => {
      expect(() => clamp(NaN, 1, 10)).toThrow(TypeError);
    });
  });
});
```

### 컴포넌트 테스트

```typescript
describe('RecentSearches', () => {
  describe('General cases', () => {
    it('저장된 검색어를 클릭하면 해당 검색어로 검색된다', async () => {
      const keyword = '니트';
      render(<RecentSearches initialKeywords={[keyword]} />);

      await user.click(screen.getByRole('button', {name: keyword}));

      expect(mockReplace).toHaveBeenCalledWith(`/search?searchText=${encodeURIComponent(keyword)}`);
    });

    it('검색어가 없으면 빈 상태 메시지가 표시된다', () => {
      render(<RecentSearches initialKeywords={[]} />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('삭제 버튼을 누르면 해당 검색어가 목록에서 사라진다', async () => {
      render(<RecentSearches initialKeywords={['니트']} />);

      await user.click(screen.getByRole('button', {name: /삭제/i}));

      expect(screen.queryByRole('button', {name: '니트'})).not.toBeInTheDocument();
    });
  });
});
```

## 쿼리

### getByRole 우선 사용

`getByRole` 외 쿼리 사용 시 사용자에게 보고한다. 워딩은 언제든 바뀔 수 있으므로 문자열에 의존하는 쿼리를 지양한다. Playwright E2E 테스트의 `page.getByRole()` 로케이터에도 동일하게 적용한다 — `getByText`·`getByLabel`·`getByTestId` 등을 써야 하면 임의로 작성하지 않고 사용자에게 보고한다.

```tsx
// before (컴포넌트)
export const EMPTY_KEYWORDS_MESSAGE = '최근 검색어가 없습니다.';
<p>{EMPTY_KEYWORDS_MESSAGE}</p>;

// before (테스트)
import {EMPTY_KEYWORDS_MESSAGE} from './RecentSearches';
expect(screen.getByText(EMPTY_KEYWORDS_MESSAGE)).toBeInTheDocument();

// after (컴포넌트)
const EMPTY_KEYWORDS_MESSAGE = '최근 검색어가 없습니다.';
<p role="status">{EMPTY_KEYWORDS_MESSAGE}</p>;

// after (테스트)
expect(screen.getByRole('status')).toBeInTheDocument();
```

### 쿼리 접두사 용도

```typescript
// getBy — 요소가 있어야 한다 (없으면 즉시 실패)
expect(screen.getByRole('button')).toBeInTheDocument();

// queryBy — 요소가 없음을 검증할 때
expect(screen.queryByRole('alert')).not.toBeInTheDocument();

// findBy — 비동기로 나타나는 요소를 기다릴 때
expect(await screen.findByRole('alert')).toBeInTheDocument();
```

## 조작

### 사용자가 할 수 없는 조작을 흉내내지 않는다

userEvent는 브라우저가 막는 조작을 테스트에서도 막는다. 그 검사를 옵션으로 끄고 통과시키면, 실제로는 일어날 수 없는 경로를 검증하게 된다.

```tsx
// ❌ 모달이 열리면 body에 pointer-events: none이 걸린다.
//    검사를 꺼야만 통과한다 = 사용자가 못 하는 클릭이다.
await userEvent.setup({pointerEventsCheck: 0}).click(document.body);

// ✅ 모달이 열렸을 때 실제로 누를 수 있는 바깥 면은 overlay다.
//    radix는 overlay에 pointer-events: auto를 주고, dialog 바로 앞에 렌더한다.
const overlay = screen.getByRole('dialog').previousElementSibling as Element;
await userEvent.click(overlay);
```

검사에 막히면 조작 **대상**을 바꾼다. 검사를 끄지 않는다. 꺼야만 통과하는 조작이면 그 조작이 사용자 시나리오에 없다는 신호다.

`pointerEventsCheck`를 성능 때문에 낮추는 것은 별개다 — 공식 문서도 이 검사가 비싸다는 이유로 단계를 제공한다. 문제는 **테스트를 통과시키려고** 끄는 경우다.

출처: https://testing-library.com/docs/user-event/intro/

> It adds visibility and interactability checks along the way and manipulates the DOM just like a user interaction in the browser would. It factors in that the browser e.g. wouldn't let a user click a hidden element or type in a disabled text box.

출처: https://testing-library.com/docs/user-event/options/

> The pointer API includes a check if an element has or inherits `pointer-events: none`. This check is known to be expensive and very expensive when checking deeply nested nodes.

## Mock

### mock 도입 시 근거·확답 필수

테스트에 mock을 넣을 때(`vi.mock`·`vi.fn`·`server.use`·fake timer·`vi.stubGlobal`/`stubEnv` 등) 왜 그 mock이 정당한지 근거를 제시하고 사용자 확답을 받는다. 근거를 댈 수 없으면 mock 없이 실제 코드로 검증한다 — 순수 로직·상태·라우팅은 대부분 mock이 필요 없다.

정당한 근거는 **진짜를 쓰면 느림 / 불안정(flaky) / 통제 못 할 부작용** 셋 중 하나에 걸리는 경우다. 셋 다 아니면(즉시 값이 나오고, 언제 불러도 같고, 부작용 없는 대상) mock하지 않는다 — 얻는 것 없이 확신만 잃고, 그 대상의 버그가 통과한다.

### mock 범위는 이유를 없앨 만큼만

mock은 확신을 편의와 바꾸는 거래이고, **범위와 확신은 반비례**한다. mock한 대상 안쪽은 실행되지 않으므로 그 안의 버그는 프로덕션에서 처음 드러난다.

끊는 위치(seam)는 이유가 사라지는 가장 바깥 지점으로 잡는다.

- 네트워크 요청 — 이유는 실서버가 느리고 불안정한 것. 서버만 가짜면 이유가 사라지므로 **MSW로 네트워크에서 끊는다**. 요청 함수를 통째로 `vi.mock`하면 URL·body 조립 코드가 통째로 실행되지 않아 `{ text }`를 `{ content }`로 보내는 오류도 테스트가 통과한다. `fetch` 스텁은 조립까지는 실행되지만 결과를 아무도 보지 않아 URL 오타를 못 잡는다. MSW는 핸들러가 주소·본문을 보므로 어긋나면 그대로 실패한다.
- 결제 SDK 등 부작용 — 이유는 진짜 청구가 일어나는 것. 부르지 않아야 사라지므로 모듈째 교체한다.

mock 정당성 판단 기준과 도메인별 worked example 73개는 KA `techniques/frontend/testing/mocking-cases.md` 참조.

> 근거·예제 전개(채용담당자용 긴 글): [guides/testing/how-to-mock.md](../../guides/testing/how-to-mock.md). AI는 위 요약으로 판단하고, 이 링크는 열지 않는다.

## 데이터 처리

### 매직 스트링 → 케이스 내 로컬 변수

같은 값이 반복되거나 값의 변환이 포함될 때 로컬 변수로 추출한다.

```typescript
// before
await user.type(screen.getByRole('searchbox'), '블라우스{enter}');
expect(mockReplace).toHaveBeenCalledWith('/search?searchText=%EB%B8%94%EB%9D%BC%EC%9A%B0%EC%8A%A4');

// after
const keyword = '블라우스';
await user.type(screen.getByRole('searchbox'), `${keyword}{enter}`);
expect(mockReplace).toHaveBeenCalledWith(`/search?searchText=${encodeURIComponent(keyword)}`);
```

### 같은 검증이 대상만 바꿔 반복되면 데이터로 돌린다

단언 줄이든 `it`·`describe` 블록이든, 검증 내용이 같고 **대상만 다르면** 데이터 배열로 돌린다. 블록 단위 반복은 눈에 덜 띄어서 그냥 늘어놓기 쉽다 — 대상이 셋을 넘어가면 어느 줄이 어느 대상인지 읽는 쪽이 대조해야 한다.

```typescript
// before
expect(screen.getByRole('button', {name: '니트'})).toBeInTheDocument();
expect(screen.getByRole('button', {name: '원피스'})).toBeInTheDocument();

// after
const names = ['니트', '원피스'];
names.forEach((name) => {
  expect(screen.getByRole('button', {name})).toBeInTheDocument();
});
```

블록도 마찬가지다. 아래 예시의 `itMergesClassNameToRoot`는 className 병합을 검증하는 공용 테스트 함수다([test-class-name.ts](../../../packages/design-system/src/test-utils/test-class-name.ts) — 루트 element를 잡는 방법만 호출부가 넘긴다).

```tsx
// before — 같은 검증이 대상만 바꿔 세 번
describe('Dialog.Header', () => {
  itMergesClassNameToRoot((className) => {
    render(<Dialog.Header className={className}>본문</Dialog.Header>);
    return screen.getByText('본문');
  });
});
describe('Dialog.Content', () => {
  /* 위와 동일, 대상만 다름 */
});
describe('Dialog.Footer', () => {
  /* 위와 동일, 대상만 다름 */
});

// after
[
  {name: 'Dialog.Header', wrapper: Dialog.Header},
  {name: 'Dialog.Content', wrapper: Dialog.Content},
  {name: 'Dialog.Footer', wrapper: Dialog.Footer},
].forEach(({name, wrapper: Wrapper}) => {
  describe(name, () => {
    itMergesClassNameToRoot((className) => {
      render(<Wrapper className={className}>본문</Wrapper>);
      return screen.getByText('본문');
    });
  });
});
```

`describe.for`가 아니라 배열 + `forEach`인 이유: `.for`의 `$name`은 문자열 값에 따옴표를 붙여 테스트 이름에 그대로 드러나고, `%s`는 `.for`가 인자를 펼치지 않아 객체가 통째로 찍힌다.

컴포넌트를 데이터로 넘길 때는 이름을 바꿔 받아(`{wrapper: Wrapper}`) 대문자로 쓴다. `naming-convention`이 함수 타입에 PascalCase를 허용하므로 억제 주석이 필요 없다([eslint.md](../../static-checking/eslint.md#typescript-eslintnaming-convention)). 표의 열이 `ElementType`처럼 컴포넌트와 태그 문자열의 합집합이면 이 예외에 안 걸리므로, 그때는 열 타입을 컴포넌트로 좁힌다.

**경계** — 검증 내용이 대상마다 다르면 묶지 않는다. 시각 prop 조합을 표로 도는 것도 아니다([TestsWeAvoid.md](./TestsWeAvoid.md) 「prop 조합을 전부 테스트한다」).

## 네이밍

### it 설명은 사용자 관점 워딩

구현 용어(URL 파라미터명, 변수명, 메서드명) 대신 사용자가 인식하는 워딩으로 쓴다. 훅 테스트도 예외 없다.

> 출처: https://vitest.dev/guide/learn/testing-in-practice.html
> "Write test names that describe the behavior, not the implementation. 'returns formatted price for USD' is better than 'calls Intl.NumberFormat with correct options'."

```typescript
// before
it('gender=F로 이동한다', ...);
it('sortBy를 price_asc로 바꾸면 URL이 변경된다', ...);
it('router.replace가 호출된다', ...);

// after
it('여성 필터를 선택하면 해당 조건으로 이동한다', ...);
it('낮은 가격순으로 정렬을 바꾸면 URL이 변경된다', ...);
it('선택을 확정하면 URL이 갱신된다', ...);
```

### 디자인 시스템 컴포넌트 — 사용자 = 개발자 소비자

디자인 시스템 컴포넌트의 소비자는 최종 사용자가 아닌 개발자다. "사용자 관점 워딩"에서 허용·금지 범위가 달라진다.

- **prop 이름 (`className`, `type` 등)** → 개발자가 인식하는 API 표면. 구현 내부어가 아니므로 허용.
- **도메인 특화 콜백 (`onConfirm`, `onCancel`, `onClose` 등)** → 컴포넌트의 공개 API prop. 직접 표기 허용.
- **범용 이벤트 핸들러 (`onClick`, `onChange` 등)** → 컴포넌트 도메인 의미가 없는 HTML 표준 이벤트. 행동으로 풀어 쓴다.

```typescript
// before — 범용 핸들러 이름 노출
it('loading 중에는 클릭해도 onClick이 호출되지 않는다', ...);

// after — 행동 묘사
it('로딩 중에는 클릭해도 반응하지 않는다', ...);

// 도메인 특화 콜백은 직접 표기
it('확인 버튼을 누르면 onConfirm이 호출된다', ...);
it('Esc를 누르면 onCancel이 호출된다', ...);
```

## 검증 범위

### 거의 뭐든 통과하는 단언으로 끝내지 않는다

값이 존재하는지만 보는 단언은 테스트를 초록으로 만들지만 아무것도 보장하지 않는다 — 함수가 엉뚱한 객체를 돌려줘도 통과하므로 거짓 자신감만 남는다. 반환값의 실제 속성을 단언한다.

```typescript
// before — undefined만 아니면 통과
const filter = parseSearchParams('?page=2&searchText=니트');
expect(filter).toBeDefined();

// after — 실제 속성을 검증
const filter = parseSearchParams('?page=2&searchText=니트');
expect(filter).toMatchObject({page: 2, searchText: '니트'});
```

호출만 하고 아무 단언도 두지 않는 스모크 테스트도 같은 이유로 쓰지 않는다 — [TestsWeAvoid.md](./TestsWeAvoid.md) 「크래시 없이 렌더된다」 참조.

### mock 호출 인덱스 접근 금지

`mock.calls[0]![0]` 같은 인덱스 접근은 호출 횟수·인자 순서에 결합된다. `toHaveBeenCalledWith`로 인자를 직접 매칭한다.

```typescript
// before
expect(mockReplace.mock.calls[0]![0]).toBe('/search?searchText=니트');

// after
expect(mockReplace).toHaveBeenCalledWith('/search?searchText=니트');
```

### 라이브러리 동작 재검증 금지

zod `.catch()`, react-hook-form 기본 검증 같은 라이브러리 API 기본 동작은 테스트하지 않는다. 프로젝트 비즈니스 로직만 검증한다.

```typescript
// ❌ zod .catch() 자체를 재검증
it('잘못된 값이 오면 기본값으로 대체된다', () => {
  const schema = z.enum(['a', 'b']).catch('a');
  expect(schema.parse('xxx')).toBe('a');
});
```
