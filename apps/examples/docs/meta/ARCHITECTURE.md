# Examples 프로젝트 아키텍처

## 목적

다양한 프론트엔드 기술 패턴을 **예제 페이지 + 설명 문서** 형태로 모아두는 프로젝트.

## 분류 체계

예제는 **기술분류 2뎁스**로 구성한다.

- 1뎁스: 대분류 (broad tech category)
- 2뎁스: 소분류 (specific topic)

```
예시)
validation/integration   ← "검증" 대분류 > "통합" 소분류
rendering/search-result  ← "렌더링" 대분류 > "검색결과" 소분류
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
- `shared/`에는 여러 소분류에서 공통으로 쓰는 코드만 둔다.