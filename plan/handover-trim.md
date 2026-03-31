# fix/trim-2 인수인계

## 브랜치
- `fix/trim-2` (base: `548a4dea` — trim 예제 페이지 최초 커밋)
- 커밋 1개: `44d5be7b` feat(examples): trim 예제에 일괄 trim 토픽 및 유틸리티 추가
- 푸시 완료

## 남은 작업
- [ ] 코드리뷰

## 변경 내용 (3개 파일)

### page.tsx — trim 예제 페이지
- 상단 핵심 문구에 "폼 데이터는 공백 포함 원본 그대로 유지" 추가
- 2번 토픽: "데이터 교정" → "trim"으로 문구 수정, `' 홍길동 '` 예시로 공백 유지 설명 보강
- 3번 토픽 "서버 전송 시 일괄 trim" 섹션 신규 추가 (trimObject 인풋/아웃풋 코드 블록)
- shiki 호출을 Promise.all로 병렬화

### object.ts / object.test.ts — 유틸리티
- test-playground에서 복사 (`shared/utils/data/`)
- trimObject, cleanObject, mapObjectLeaves, isObject

## 참고: 폐기된 브랜치
- `fix/trim` — 시작 위치가 feature/form HEAD (error-feedback 커밋 포함)로 잘못됨. 로컬에만 존재, 미푸시.
- `worktree-trim` — 워크트리 생성 시 자동 생성된 브랜치. 사용 안 함.
