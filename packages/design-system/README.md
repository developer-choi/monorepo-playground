# 디자인 시스템

여러 프로젝트가 함께 쓰는 화면 부품(버튼·입력창·모달 등)을 한곳에 모아 만든 디자인 시스템입니다. 색·여백·글자 크기 같은 시각 기준도 한곳에 모아, 그 기준만 바꾸면 전체 톤이 한 번에 바뀝니다.

- [컴포넌트 라이브 데모](https://design-system-eta-six.vercel.app/): 부품을 직접 눌러보며 동작을 확인할 수 있습니다.
- [디자인 시스템 구축기](docs/guides/design-system/step1.md): 표준화부터 모노레포까지 발전 과정을 4단계로 정리했습니다.

## 설치

```bash
npm install @developer-choi/design-system
```

React 19가 필요합니다.

## 버전

1.0 전까지는 아래 규칙으로 올립니다.

- **patch** (`0.1.0` → `0.1.1`): 버그 수정. 쓰는 쪽 코드를 고칠 필요가 없습니다.
- **minor** (`0.1.0` → `0.2.0`): 기능 추가, 또는 쓰는 쪽 코드를 고쳐야 하는 변경(props·토큰 이름 변경 등). 고쳐야 하는 변경이 있으면 아래 「변경 기록」에 무엇을 어떻게 바꾸면 되는지 적습니다.

`package.json`의 `version`을 올린 PR이 master에 머지되면 GitHub Actions가 npm에 배포합니다. 이미 배포된 버전이면 건너뜁니다.

### 변경 기록

- `0.1.0`: 첫 공개 배포
- `0.2.0`: 버튼·모달·입력칸 모양을 한 톤으로 다시 잡았습니다.
  - **고쳐야 하는 것**: `Button`의 `size="xLarge"`를 없앴습니다. `size="large"`로 바꿔 주세요.
  - 버튼은 small 24px·12px, medium 36px·14px, large 42px·16px 세 단계입니다. 입력칸(`TextField`·`PasswordField`·`Select`)은 버튼 medium과 같은 36px·14px이고, `TextArea`는 글자만 14px로 바뀌었습니다.
  - `Dialog`는 폭 최대 328px·둥글기 16px의 한 모양이 기본입니다. `Dialog.Header`는 제목과 옆 요소(닫기 버튼 등)를 한 줄 양 끝에 두고, `Dialog.Footer`는 오른쪽 정렬 대신 버튼들이 같은 폭으로 줄을 채웁니다. 모달 버튼은 `size="large"`를 씁니다.
  - `Confirm`은 취소 버튼이 테두리에서 회색 채움으로 바뀌었고, `destructive`여도 제목을 빨갛게 칠하지 않습니다(위험은 확인 버튼 색으로만 알립니다).
  - 새로 생긴 것: `Button`의 `color="surface"`, 지우기 버튼이 달린 `Chip`, 닫기 버튼을 넣는 `Dialog.Close`, 토큰 `--radius-lg`·`--control-height-sm/md/lg`.

## 테마 바꾸기

색·여백 같은 토큰은 `themeClassName`이 붙은 요소 아래에서만 적용됩니다. [Radix Themes](https://www.radix-ui.com/themes/docs/theme/color)가 `.radix-themes` 아래에 토큰을 두고 덮어쓰게 하는 것과 같은 방식입니다.

1. `<body>`에 `themeClassName`을 붙입니다. 모달처럼 `<body>`로 portal되는 부품까지 토큰을 받습니다.
2. 같은 `<body>`에 자기 클래스를 함께 붙이고, 그 클래스에서 토큰을 덮어씁니다. 그 CSS는 디자인 시스템 CSS **뒤에** 불러옵니다.

```tsx
// app/layout.tsx
import '@developer-choi/design-system/style.css';
import {themeClassName} from '@developer-choi/design-system';
import styles from './layout.module.css';

<body className={clsx(themeClassName, styles.theme)}>...</body>;
```

```css
/* layout.module.css */
.theme {
  --color-bg-accent: #1971c2;
  --color-fg-accent: #1971c2;
}
```

덮어쓸 수 있는 토큰 목록은 [design-tokens.module.scss](src/styles/design-tokens.module.scss)에 있습니다.
