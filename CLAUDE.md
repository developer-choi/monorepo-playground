## 정적 분석 설정 변경 시 문서 동기화

정적 분석 설정 변경 시 `docs/static-checking.md`의 설정-문서 매핑 테이블을 보고 해당 문서를 최신화한다.

## Stylelint 설정 변경 시 문서 동기화

`.stylelintrc.json` 변경 시 `docs/static-checking/stylelint.md`를 함께 최신화한다.

## 포매터 설정 변경 시 문서 동기화

`.prettierrc`, `.prettierignore`, `.editorconfig` 변경 시 `docs/formatter.md`를 함께 최신화한다.

## 패턴 문서에 코드 복사 금지

레포 내에 원본 파일이 이미 존재하면 코드를 문서에 복사하지 않는다. 원본 파일 경로를 링크로 참조한다. 단, 핵심 코드라인만 별도로 코드 블록으로 발췌하는 것은 예외다.
