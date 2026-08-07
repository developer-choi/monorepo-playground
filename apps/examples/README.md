# Examples

실무 프로젝트에서 반복적으로 사용되는 패턴들을 Next.js 예제로 정리한 앱. 예제는 계속 추가될 예정입니다.

## 실행

```bash
# 모노레포 루트에서
npm run examples
```

## 예제 목록

| 경로                                                                       | 주제             | 키워드                                                    |
| -------------------------------------------------------------------------- | ---------------- | --------------------------------------------------------- |
| [`/validation/integration`](./src/validation/integration/README.md)        | Zod 활용기       | 스키마 파생, 상수 공유, API 응답 검증, 에러 처리, 폼 연동 |
| [`/rendering/search-result`](./src/rendering/search-result/README.md)      | 검색결과 목록 UX | useDeferredValue, 디바운싱, 캐싱, Race Condition          |
| [`/rendering/infinite-scroll`](../../docs/guides/infinite-scroll/step1.md) | 무한스크롤       | 렌더링 전략, 이미지 최적화, 리렌더링 최적화, 에러 방어    |
| [`/form`](./src/form/README.md)                                            | 폼 공통 규칙     | 제출 핸들링, trim 유효성검증, 자동 포커스                 |

무한스크롤 설명은 4단계 가이드 문서로 분리해두었고, 나머지 예제는 각 폴더의 README.md에 있습니다.

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router 페이지 (form/, sandbox/ 포함)
├── shared/                 # 예제 전체에서 공유하는 코드 (ApiClient, 폼 컴포넌트 등)
├── validation/integration/ # Zod 활용기
├── form/                   # 폼 공통 규칙 도메인
└── rendering/              # 렌더링 예제
```
