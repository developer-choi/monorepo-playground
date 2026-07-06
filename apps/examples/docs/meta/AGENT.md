# AI Agent 가이드

이 프로젝트의 아키텍처와 규칙은 [ARCHITECTURE.md](./ARCHITECTURE.md)를 따른다.

## 작업 시 체크리스트

- 새 예제 추가 시: 대분류/소분류를 먼저 결정하고, ARCHITECTURE.md의 디렉토리 구조를 따를 것
- 분류명은 라이브러리 이름(zod, tanstack 등)이 아닌 **문제/개념** 기준으로 지을 것
- 설명 문서(`.md`)와 이미지(`assets/`)는 해당 소분류 폴더 안에 함께 둘 것 (별도 docs 폴더 X)
- 데모 페이지 코드(데모 컴포넌트·화면에 노출되는 코드 샘플)는 **자족적으로** 작성할 것 — 보는 사람이 프로젝트 내부 공통 헬퍼(`@/shared` 로직)를 몰라도 되도록 원시 API로 인라인한다 (예: `isMutationSettling(mutation)` ❌ → `mutation.isPending || mutation.isSuccess` ✅). 반대로 `docs/patterns/` 문서는 AI·저자용이므로 레포 헬퍼를 그대로 참조한다
