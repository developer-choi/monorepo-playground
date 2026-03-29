# Monorepo Playground

React/Next.js 실무 패턴을 모노레포로 구현한 프로젝트입니다. 제가 실무에서 반복적으로 마주치는 문제들을 어떻게 해결하는지 보여드립니다.

## 라이브 데모

구현된 패턴을 직접 확인할 수 있습니다:

- **Examples 앱** — [monorepo-playground-examples.vercel.app](https://monorepo-playground-examples.vercel.app/)
- **디자인 시스템 Storybook** — [design-system-eta-six.vercel.app](https://design-system-eta-six.vercel.app/)

## 정적 분석으로 코드 품질 자동화

AI가 생성한 코드든 사람이 작성한 코드든, 리뷰어가 모든 실수를 눈으로 잡을 수는 없습니다. 제가 이 프로젝트에서 선택한 방법은 **커밋 시점에 자동으로 차단하는 것**입니다.

19개 이상의 커스텀 ESLint 룰을 적용했습니다. 예를 들어, 아래와 같은 코드는 커밋 자체가 불가능합니다:

```typescript
// ❌ await 없이 Promise 호출 — 에러가 조용히 삼켜집니다
fetchData();

// ❌ || 대신 ?? 를 강제 — 0이나 빈 문자열이 의도치 않게 무시됩니다
const value = input || 'default';

// ❌ switch에서 케이스 누락 — 유니온 타입에 새 값이 추가되면 컴파일 타임에 잡습니다
switch (status) {
  case 'active': return handleActive();
  // 'inactive' 케이스 누락 → 에러
}
```

검증은 2단계로 나뉩니다. 커밋할 때는 변경된 파일만 빠르게 검사하고, push할 때 전체 워크스페이스를 대상으로 타입 체크와 린트를 실행합니다. **커밋 속도와 코드 안전성을 모두 확보하는 구조입니다.**

## 검색 결과 UX 최적화

검색 결과 페이지에서 흔히 사용하는 로딩 스피너는 체감 속도를 떨어뜨립니다. 제가 구현한 방식은 **이전 결과를 유지하면서 새 결과로 자연스럽게 전환**하는 것입니다.

직접 확인해 보세요 — [검색 결과 데모](https://monorepo-playground-examples.vercel.app/rendering/search-result/search)

```tsx
const [query, setQuery] = useState('');
const deferredQuery = useDeferredValue(query);

// 입력은 즉시 반영, 검색 결과 렌더링은 우선순위를 낮춤
<TextField value={query} onChange={e => setQuery(e.target.value)} />
<SearchResults query={deferredQuery} />
```

`useDeferredValue`로 입력 반응성을 보장하면서, React Query의 캐싱으로 이미 검색한 결과는 즉시 표시됩니다. 대량의 결과는 `@tanstack/react-virtual`로 가상 스크롤링하여 DOM 부하를 줄였습니다.

## 유효성 검증 통합

폼의 타입 정의, 검증 로직, 에러 메시지가 각각 다른 곳에 흩어져 있으면 불일치가 발생합니다. 제가 사용하는 방식은 **Zod 스키마 하나를 단일 소스로 사용**하는 것입니다.

직접 확인해 보세요 — [유효성 검증 데모](https://monorepo-playground-examples.vercel.app/validation/integration)

```typescript
const BOARD_LIMITS = {
  postTitle: { min: 1, max: 100 },
};

// 스키마 하나로 검증 + 에러 메시지를 정의합니다
const BoardSchema = z.object({
  postTitle: z.string()
    .min(BOARD_LIMITS.postTitle.min, '제목을 입력하세요')
    .max(BOARD_LIMITS.postTitle.max, `${BOARD_LIMITS.postTitle.max}자 이내로 입력하세요`),
});

// 타입은 스키마에서 자동 추론됩니다
type Board = z.infer<typeof BoardSchema>;

// 폼 검증에 그대로 연결됩니다
useForm<Board>({ resolver: zodResolver(BoardSchema) });
```

**제약 조건을 한 곳에서 바꾸면 타입, 검증, 에러 메시지, UI의 maxLength까지 자동으로 반영됩니다.**

## 디자인 시스템

Storybook 기반의 컴포넌트 라이브러리입니다. 직접 확인해 보세요 — [Storybook](https://design-system-eta-six.vercel.app/)

Chromatic을 연동하여 PR마다 시각적 회귀 테스트를 자동으로 실행합니다. 컴포넌트의 스타일이 의도치 않게 변경되면 리뷰 단계에서 바로 감지됩니다. Vitest 브라우저 테스팅으로 스토리를 테스트 케이스로 재활용하고, 접근성(a11y) 애드온으로 웹 접근성도 함께 검증합니다.

## 기술 스택

React 19 · Next.js 16 · TypeScript 5.9 · Turborepo · Zod · React Query · React Hook Form · Radix UI · Storybook · Chromatic · Vitest
