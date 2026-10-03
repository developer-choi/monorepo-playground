# 변경 기록

버전마다 쓰는 쪽이 알아야 할 변경을 적습니다. 올리는 규칙은 [README 「버전」](README.md#버전)에 있습니다.

## 0.6.0

`Confirm`·`Alert`의 버튼 props가 바뀌었습니다. **쓰던 곳을 아래 「Removed」 표대로 바꿔 주세요.**

### Removed

| 없어진 prop               | 바꿀 것                                 |
| ------------------------- | --------------------------------------- |
| `Confirm`의 `confirmText` | `confirmProps={{children: '삭제'}}`     |
| `Confirm`의 `cancelText`  | `cancelProps={{children: '닫기'}}`      |
| `Confirm`의 `destructive` | `confirmProps={{color: 'destructive'}}` |
| `Alert`의 `confirmText`   | `confirmProps={{children: '닫기'}}`     |

### Added

- `Confirm`의 `confirmProps`·`cancelProps`, `Alert`의 `confirmProps`: `Button` props(`onClick` 제외)를 받아 기본값(확인 `primary`·취소 `secondary`, 둘 다 `large`)에 덮어씁니다. 클릭은 지금처럼 `onConfirm`·`onCancel`(`Alert`는 `onClose`)로 받습니다.
- `confirmProps.loading`이 켜진 동안 `Confirm`은 Esc·바깥 클릭으로 닫히지 않고 [취소]가 비활성입니다.

## 0.5.0

토큰 셋이 없어졌습니다. **쓰던 곳을 아래 「Removed」 표대로 바꿔 주세요.**

### Removed

| 없어진 토큰              | 바꿀 것                                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------------------------- |
| `--spacing-page-x`(24px) | 같은 24px가 필요하면 `--spacing-lg`. 휴대폰 화면 좌우 여백이면 새 토큰 `--spacing-page-x-mobile`(12px)  |
| `--z-pc-sticky-header`   | 앱의 z-index 맵에 직접 둡니다. [README 「z-index」](README.md#z-index)                                  |
| `--z-toast`              | 토스트 층은 디자인 시스템이 정합니다. 앱에서 그 값이 필요하면 내보낸 `$zIndexes`에서 `toast`를 꺼냅니다 |

### Changed

- 버튼 `size="large"` 글자가 16px → 14px입니다. 높이 42px는 같습니다. `large`를 쓰는 `Alert`·`Confirm` 버튼 글자도 14px이 됩니다. 16px 글자가 필요하면 `xLarge`를 씁니다.
- `IconButton` 평소 색이 `--color-fg-muted`(#999) → `--color-fg-secondary`(#666)입니다. hover 색은 같습니다.
- 모달 본문과 버튼 사이가 16px → 24px입니다.
- 모달 백드롭·창에 z-index(400)가 생겼습니다. 앱의 sticky 헤더가 백드롭 위로 올라오지 않습니다. 토스트는 500입니다.

### Added

- 버튼 `size="xLarge"`: 높이 48px, 글자 16px. 토큰 `--control-height-xl`(48px)
- 토큰 `--spacing-page-x-mobile`(12px): 휴대폰 화면 좌우 여백
- z-index 맵 `$zIndexes`(`modal` 400, `toast` 500)를 `@developer-choi/design-system/styles/design-system`으로 내보냅니다. 앱이 합쳐 쓰는 법은 [README 「z-index」](README.md#z-index)

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
