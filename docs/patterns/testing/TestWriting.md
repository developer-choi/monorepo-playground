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

### describe.each — 여러 구현체 동시 테스트

```typescript
const algorithms = [
  {name: 'Bubble Sort', fn: bubbleSort},
  {name: 'Selection Sort', fn: selectionSort},
  {name: 'Quick Sort', fn: quickSort},
];

describe.each(algorithms)('정렬 알고리즘 > $name', ({fn}) => {
  it('배열을 오름차순으로 정렬해야 한다', () => {
    const {output} = fn({value: [3, 1, 2], order: 'asc'});
    expect(output).toEqual([1, 2, 3]);
  });
});
```

## 쿼리

### getByRole 우선 사용

`getByRole` 외 쿼리 사용 시 사용자에게 보고한다. 워딩은 언제든 바뀔 수 있으므로 문자열에 의존하는 쿼리를 지양한다.

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

### 반복 assertion → 데이터 기반 반복문

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

## 네이밍

### it 설명은 사용자 관점 워딩

구현 용어(URL 파라미터명, 변수명, 메서드명) 대신 사용자가 인식하는 워딩으로 쓴다. 훅 테스트도 예외 없다.

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

## 검증 범위

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
