## docs/patterns/ 와 docs/best-practices-map.md

### 로드 규칙

패턴 문서는 코드를 직접 포함하거나, 소스 파일 링크로 참조한다. 코드를 직접 포함하면 중복이 생기므로 링크로 분리하는 경우가 있는데, 이때 `[CRITICAL]`로 표기된 링크는 패턴의 실체이므로 반드시 Read한다. 그 외 링크(설계 히스토리 등)는 선택 참조.

각 패턴은 해당 주제만큼의 코드를 담고 있으며, 단독으로 완성된 구현이 아니다. 실제 구현 시에는 관련 패턴을 조합해야 한다. 예: URL `[id]` 검증은 에러 처리 이원화와 함께 사용해야 검증 실패 시 에러 페이지 흐름이 완성된다.

### 작성 범위 — AI 지침 한정

`docs/patterns/`와 `docs/best-practices-map.md`는 AI가 코드를 쓸 때 참조하는 지침이다. 배경·원문·방법론은 KA(`knowledge-archive`)로 위임한다.

패턴 문서에 넣지 않는 것:

- 규칙의 근거·이론 설명 (why, false negative/positive 같은 논리)
- 1차 소스 URL 목록 (Fowler, Kent C. Dodds 등 외부 원문)
- 학습용 방법론 (예: "테스트 대상 결정 5단계" 같은 프로세스)
- 섹션마다 달리는 "출처: knowledge/..." 각주
- 배경 도입부, 연결 문장, 풍성한 설명
- 패턴 간 상호 참조 ("관련: TestWriting.md" 같은 링크 섹션) — best-practices-map.md가 전담

패턴 문서에는 판단 기준·규칙·MP 고유 코드/사례만 남긴다. 근거가 KA에 있으면 파일 맨 아래에 `배경: KA knowledge/<경로>` 한 줄로만 남긴다.

### 코드 복사 금지

레포 내에 원본 파일이 이미 존재하면 코드를 문서에 복사하지 않는다. 원본 파일 경로를 링크로 참조한다. 단, 핵심 코드라인만 별도로 코드 블록으로 발췌하는 것은 예외다.

## 설정 파일 변경 시 문서 동기화

### 정적 분석

정적 분석 설정 변경 시 `docs/static-checking.md`의 설정-문서 매핑 테이블을 보고 해당 문서를 최신화한다.

### Stylelint

`.stylelintrc.json` 변경 시 `docs/static-checking/stylelint.md`를 함께 최신화한다.

### 포매터

`.prettierrc`, `.prettierignore`, `.editorconfig` 변경 시 `docs/formatter.md`를 함께 최신화한다.
