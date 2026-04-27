## docs/patterns/ 와 docs/best-practices-map.md

### 로드 규칙

패턴 문서는 코드를 직접 포함하거나, 소스 파일 링크로 참조한다. 코드를 직접 포함하면 중복이 생기므로 링크로 분리하는 경우가 있는데, 이때 `[CRITICAL]`로 표기된 링크는 패턴의 실체이므로 반드시 Read한다. 그 외 링크(설계 히스토리 등)는 선택 참조.

각 패턴은 해당 주제만큼의 코드를 담고 있으며, 단독으로 완성된 구현이 아니다. 실제 구현 시에는 관련 패턴을 조합해야 한다. 예: URL `[id]` 검증은 에러 처리 이원화와 함께 사용해야 검증 실패 시 에러 페이지 흐름이 완성된다.

### 콘텐츠 배치 정책

`docs/patterns/`, `docs/best-practices-map.md`를 수정하기 전에 [`docs/meta/placement.md`](docs/meta/placement.md)를 읽는다. KA·AC로 가야 할 콘텐츠인지 먼저 판단한다.

### 문서 수정 시 작성 규칙 역제안

`docs/` 하위 문서(특히 `docs/patterns/`, `docs/tips/`, `docs/best-practices-map.md`) 수정 시:

1. 요청된 수정을 수행
2. 패턴성 판단 (동일 실수·요청이 재발할 가능성)
3. 패턴성이면, 해당 영역의 작성 규칙(`docs/best-practices-map.md` 상단 / `docs/meta/placement.md` / 관련 메타 파일)에 추가할 규칙을 구체적 문안과 함께 역제안

### 코드 복사 금지

레포 내에 원본 파일이 이미 존재하면 코드를 문서에 복사하지 않는다. 원본 파일 경로를 링크로 참조한다. 단, 핵심 코드라인만 별도로 코드 블록으로 발췌하는 것은 예외다.

## 설정 파일 변경 시 문서 동기화

### 정적 분석

정적 분석 설정 변경 시 `docs/static-checking.md`의 설정-문서 매핑 테이블을 보고 해당 문서를 최신화한다.

### Stylelint

`.stylelintrc.json` 변경 시 `docs/static-checking/stylelint.md`를 함께 최신화한다.

### 포매터

`.prettierrc`, `.prettierignore`, `.editorconfig` 변경 시 `docs/formatter.md`를 함께 최신화한다.
