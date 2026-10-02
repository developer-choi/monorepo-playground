# 변경 기록

버전마다 쓰는 쪽이 알아야 할 변경을 적습니다. 올리는 규칙은 [README 「버전」](README.md#버전)에 있습니다.

## 0.4.2

고쳐야 하는 것은 없습니다.

### Changed

- 모달(`Dialog`·`Alert`·`Confirm`) 안쪽 여백을 사방 24px(`--spacing-lg`)로 맞춥니다. 0.2.0부터 아래만 16px(`--spacing-md`)이라, 폼처럼 본문이 긴 모달에서 아래 여백만 좁아 보였습니다.

## 0.4.1

고쳐야 하는 것은 없습니다.

### Changed

- 토스트를 다시 브랜드 컬러(`--color-primary`·`--color-on-primary`)로 칠합니다. 0.4.0에서는 어두운 바탕(`--color-bg-inverse`)이었습니다. 브랜드를 덮어쓰면 토스트도 그 색으로 나옵니다.
- `--color-primary-soft`의 기본값이 흰색 대신 바탕색(`--color-bg-default`)과 섞입니다. 바탕을 덮어쓰는 테마에서도 따라옵니다. 기본 테마 값은 같습니다.

## 0.4.0

색 토큰 이름을 브랜드 컬러 기준으로 다시 지었습니다. **옛 이름은 없어졌으니, 덮어쓰거나 `var()`로 쓰던 곳을 아래 표대로 바꿔 주세요.** 값은 그대로입니다.

### Changed

| 옛 이름                                  | 새 이름                                     |
| ---------------------------------------- | ------------------------------------------- |
| `--color-bg-accent`, `--color-fg-accent` | `--color-primary` (브랜드 컬러 하나로 합침) |
| `--color-on-accent`                      | `--color-on-primary`                        |
| `--color-bg-primary`                     | `--color-bg-default`                        |
| `--color-bg-secondary`                   | `--color-bg-subtle`                         |
| `--color-bg-tertiary`                    | `--color-bg-muted`                          |
| `--color-fg-primary`                     | `--color-fg-default`                        |

- 토스트는 브랜드 색이 아니라 어두운 바탕(`--color-bg-inverse`)으로 칠합니다. 브랜드를 다른 색으로 덮어도 토스트는 어둡게 남습니다.

### Added

- 토큰 `--color-bg-inverse`·`--color-on-inverse`: 어두운 바탕과 그 위 글자·아이콘
- 토큰 `--color-primary-soft`: 브랜드의 옅은 바탕. 기본값은 `--color-primary`를 10% 섞은 색이라 브랜드만 덮어도 따라옵니다.

## 0.3.0

화면 아래에 잠깐 떴다 사라지는 토스트를 더했습니다. 고쳐야 하는 것은 없습니다.

### Added

- 앱에 `<Toaster />`를 한 번 두고, 어디서든 `toast({title, description?, duration?})`를 부릅니다. 기본 1.8초 뒤 사라지고, 동시에 2개까지 뜹니다.
- 토큰 `--z-toast`: 모달 백드롭 위에 토스트를 올립니다.

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
