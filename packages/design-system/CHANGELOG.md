# 변경 기록

버전마다 쓰는 쪽이 알아야 할 변경을 적습니다. 올리는 규칙은 [README 「버전」](README.md#버전)에 있습니다.

## 0.2.0

버튼·모달·입력칸 모양을 한 톤으로 다시 잡았습니다.

### Removed

- `Button`의 `size="xLarge"`를 없앴습니다. `size="large"`로 바꿔 주세요.

### Changed

- 버튼은 small 24px·12px, medium 36px·14px, large 42px·16px 세 단계입니다. 입력칸(`TextField`·`PasswordField`·`Select`)은 버튼 medium과 같은 36px·14px이고, `TextArea`는 글자만 14px로 바뀌었습니다.
- `Dialog`는 폭 최대 328px·둥글기 16px의 한 모양이 기본입니다. `Dialog.Header`는 제목과 옆 요소(닫기 버튼 등)를 한 줄 양 끝에 두고, `Dialog.Footer`는 오른쪽 정렬 대신 버튼들이 같은 폭으로 줄을 채웁니다. 모달 버튼은 `size="large"`를 씁니다.
- `Confirm`은 취소 버튼이 테두리에서 회색 채움으로 바뀌었고, `destructive`여도 제목을 빨갛게 칠하지 않습니다(위험은 확인 버튼 색으로만 알립니다).

### Added

- `Button`의 `color="surface"`, 지우기 버튼이 달린 `Chip`, 닫기 버튼을 넣는 `Dialog.Close`
- 토큰 `--radius-lg`·`--control-height-sm/md/lg`

## 0.1.0

첫 공개 배포
