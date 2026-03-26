# Examples 프로젝트 아키텍처

## 목적

다양한 프론트엔드 기술 패턴을 **예제 페이지 + 설명 문서** 형태로 모아두는 프로젝트.

## 분류 체계

예제는 **학습 카테고리 2뎁스**로 구성한다.

- 1뎁스: 학습 카테고리 (broad tech category)
- 2뎁스: 학습주제 (specific topic)

```
예시)
rendering/infinite-scroll  ← "렌더링" 카테고리 > "무한스크롤" 주제
rendering/search-result    ← "렌더링" 카테고리 > "검색결과" 주제
validation/integration     ← "검증" 카테고리 > "통합 폼" 주제
showcase/board             ← "완성형" 카테고리 > "게시판" 주제
```

특정 라이브러리 이름(zod, tanstack-virtual 등)은 분류명으로 쓰지 않는다.
분류명은 **해결하려는 문제/개념** 기준으로 짓는다.

## 디렉토리 구조

```
src/
├── {카테고리}/
│   └── {주제}/
│       ├── README.md          # 설명 문서
│       ├── assets/            # 문서에 첨부할 이미지 등
│       ├── types.ts           # 클라이언트 타입 (shared/board를 import하거나 자체 정의)
│       ├── api.ts             # API 함수 (shared/board를 import하거나 자체 정의)
│       ├── queries.ts         # TanStack Query options
│       ├── schema.ts          # Zod 스키마
│       ├── hooks/             # 커스텀 훅
│       ├── components/        # UI 컴포넌트
│       └── ...
├── shared/                    # 공통 코드 (아래 참고)
└── app/                       # Next.js 라우트 (src/ 구조와 1:1 매칭)
    ├── {카테고리}/{주제}/
    │   └── page.tsx
    └── api/                   # Route Handler
```

### 핵심 규칙

- 설명 문서(`.md`)와 이미지(`assets/`)는 해당 주제 폴더 안에 함께 둔다.
- **각 예제는 그 예제의 관심사만 담는다.** 예제를 읽는 사람이 해당 예제와 무관한 코드를 읽어야 한다면 설계가 잘못된 것이다.
- **app 경로와 src 경로를 1:1로 매칭**한다. URL을 보고 src 경로를 바로 유추할 수 있어야 한다.

### 예제 간 코드 공유 원칙

- **컴포넌트, hooks, queries, zod 스키마**는 예제 간 공유하지 않는다. 중복이어도 각자 구현한다.
  - 이유: 코드 통합의 전제는 "사용하는 곳마다 미래에 같은 변경사항을 공유해야 하는가"인데, 예제끼리는 독립적으로 변경된다.
- **Board 타입, API 호출함수, DTO 변환**은 `shared/board/`에 둔다.
  - 이유: 모든 예제가 동일하게 쓰며, 예제가 늘수록 중복 비용이 커진다.

## shared

`shared/`에는 두 종류의 코드가 들어간다.

### 1. 인프라 코드 (도메인 무관)

```
shared/
├── api/          # HTTP 클라이언트 (ky 인스턴스 등)
├── error/        # 에러 클래스, 핸들러
├── utils/        # 범용 유틸 함수
├── schema/       # pagination 등 범용 스키마
├── components/   # ErrorPageTemplate 등 범용 UI 컴포넌트
└── server/       # Mock DB, database.ts
```

### 2. 도메인 데이터 레이어 (board)

모든 예제가 동일하게 사용하는 Board 도메인의 최소 공통분모.

```
shared/
└── board/
    ├── types.ts   # Board 클라이언트 타입 (camelCase)
    └── api.ts     # Board API 호출함수 + DTO → Board 변환
```

컴포넌트, hooks, queries, zod 스키마는 shared/board에 두지 않는다.

## showcase

여러 best practice를 합친 **완성형 페이지**. 개별 예제가 하나의 패턴을 분리해서 보여주는 것과 대비된다.

```
src/showcase/board/           # 완성형 게시판
app/showcase/board/page.tsx   # /showcase/board
```

showcase 하위 코드는 `Showcase` 접두사를 사용한다.

```tsx
// 예시
interface ShowcaseBoardDto { ... }
function ShowcaseBoardCard() { ... }
```

## sandbox

라이브러리 스펙을 간단히 돌려보는 테스트 페이지. 정식 예제와 달리 별도의 `src/` 폴더 없이 페이지 파일 내에서 완결한다.

```
src/app/sandbox/{라이브러리 이름}/{스펙 이름}/
└── page.tsx
```

```
예시)
sandbox/zod/partial      ← Zod의 partial() 메소드 테스트
sandbox/zod/safeParse    ← Zod의 safeParse() 메소드 테스트
```

2뎁스 제한 없이 `sandbox/{라이브러리}/{스펙}` 형태로 자유롭게 구성한다.
