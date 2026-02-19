# Examples 프로젝트 아키텍처

## 목적

다양한 프론트엔드 기술 패턴을 **예제 페이지 + 설명 문서** 형태로 모아두는 프로젝트.

## 분류 체계

예제는 **기술분류 2뎁스**로 구성한다.

- 1뎁스: 대분류 (broad tech category)
- 2뎁스: 소분류 (specific topic)

```
예시)
listing/infinite-scroll  ← "리스팅" 대분류 > "무한스크롤" 소분류
listing/virtual-list     ← "리스팅" 대분류 > "가상리스트" 소분류
```

특정 라이브러리 이름(zod, tanstack-virtual 등)은 분류명으로 쓰지 않는다.
분류명은 **해결하려는 문제/개념** 기준으로 짓는다.

## 디렉토리 구조

```
src/
├── {대분류}/
│   ├── {소분류}/
│   │   ├── README.md          # 설명 문서
│   │   ├── assets/            # 문서에 첨부할 이미지 등
│   │   ├── schema.ts          # 스키마 정의
│   │   ├── api.ts             # API 함수
│   │   ├── components/        # UI 컴포넌트
│   │   │   └── SomeComponent.tsx
│   │   └── ...
│   └── {소분류}/
│       └── ...
├── shared/                    # 공통 유틸, 컴포넌트
└── app/                       # Next.js 라우트 (페이지)
    └── {대분류}/{소분류}/     # 라우트는 src/app/ 하위에 유지
        └── page.tsx
```

### 핵심 규칙

- 설명 문서(`.md`)와 이미지(`assets/`)는 해당 소분류 폴더 안에 함께 둔다.
- 각 소분류 폴더는 DDD 스타일로 자체적으로 `schema.ts`, `api.ts`, `components/`를 가진다 (필요한 것만).
- `shared/`에는 공통으로 쓰는 코드만 둔다.

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