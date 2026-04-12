# 폴더 구조 — DDD 기반

## 원칙

- 최상위는 **도메인 단위**로 분리한다 (`src/{domain}/`)
- 도메인에 속하지 않는 공통 모듈은 `src/shared/`에 둔다
- 프레젠테이션(라우팅)은 `src/app/`에 둔다 (Next.js App Router 기준)

```
src/
├── app/             # 라우팅 (프레젠테이션)
├── auth/            # 도메인
├── product/         # 도메인
├── order/           # 도메인
└── shared/          # 도메인 무관 공통 모듈
```

## 도메인 내부 구조

도메인 폴더 안에는 역할별로 파일을 둔다. **컴포넌트 서브폴더를 만들지 않는다** — 플랫 파일로 배치한다.

```
src/product/
├── components/
│   ├── ProductCard.tsx
│   ├── ProductCardSkeleton.tsx
│   └── ProductListSkeleton.tsx
├── api.ts
├── queries.ts
├── schema.ts          # 또는 types.ts
└── constants.ts       # 필요시
```

### 컴포넌트 파일 규칙

| 항목     | 규칙                                                |
| -------- | --------------------------------------------------- |
| 컴포넌트 | `ComponentName.tsx` — PascalCase                    |
| 스타일   | `ComponentName.module.scss` — 컴포넌트명과 1:1 매칭 |
| 테스트   | `ComponentName.test.tsx` — 컴포넌트명과 1:1 매칭    |
| 서브폴더 | 만들지 않는다. 한 폴더에 플랫하게 배치              |

**안티패턴:**

```
# ❌ 서브폴더 + index.module.scss
components/
├── ProductCard/
│   ├── ProductCard.tsx
│   └── index.module.scss    # IDE 탭에서 구분 불가

# ❌ 스타일 파일명이 컴포넌트와 불일치
components/
├── ProductCard.tsx
└── styles.module.scss        # 어떤 컴포넌트의 스타일인지 불명확
```

## shared 내부 구조

```
src/shared/
├── api/             # ApiClient, 에러 클래스 등
├── components/      # 공통 UI (Button, Modal 등)
├── hooks/           # 공통 훅
├── lib/             # 유틸리티 함수
└── styles/          # 글로벌 스타일
```

## 파일이 많아질 때

한 폴더 안의 파일이 많아져서 탐색이 어려워지면, 사용자 판단에 따라 서브폴더로 그룹핑할 수 있다. 위 도메인 내부 구조가 기본이며, 추가 서브폴더 도입은 예외적 판단이다.
